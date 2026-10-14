package com.ecommerce.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.dto.OrderItemResponse;
import com.ecommerce.dto.OrderResponse;
import com.ecommerce.dto.OrderStatusHistoryResponse;
import com.ecommerce.entity.Address;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.OrderStatusHistory;
import com.ecommerce.entity.OrderTrackingEvent;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.AddressRepository;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.OrderItemRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.OrderStatusHistoryRepository;
import com.ecommerce.repository.OrderTrackingEventRepository;
import com.ecommerce.repository.PaymentRepository;
import com.ecommerce.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderTrackingEventRepository orderTrackingEventRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final PaymentRepository paymentRepository;
    private final CartService cartService;

    // =========================================================
    // CHECKOUT
    // =========================================================

    @Transactional
    public OrderResponse checkout(Long userId, Long addressId) {

        User authenticatedUser = getAuthenticatedUser();

        if (userId == null || addressId == null) {
            throw new IllegalArgumentException(
                    "User ID and address ID are required."
            );
        }

        // Customers can only checkout for themselves.
        // ADMIN can checkout for another user if required.
        if (!authenticatedUser.getId().equals(userId)
                && !isAdmin(authenticatedUser)) {
            throw new SecurityException(
                    "You are not allowed to place an order for this user."
            );
        }

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Address not found with id: " + addressId
                        ));

        if (!userId.equals(address.getUserId())) {
            throw new SecurityException(
                    "The selected address does not belong to this user."
            );
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart not found for user: " + userId
                        ));

        List<CartItem> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new IllegalStateException(
                    "Cannot checkout with an empty cart."
            );
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Validate every cart item before creating the order.
        for (CartItem cartItem : cartItems) {

            if (cartItem.getQuantity() == null
                    || cartItem.getQuantity() < 1) {
                throw new IllegalStateException(
                        "Cart contains an invalid quantity."
                );
            }

            BigDecimal unitPrice = cartItem.getUnitPrice();

            if (unitPrice == null || unitPrice.signum() < 0) {
                throw new IllegalStateException(
                        "Cart contains an invalid unit price."
                );
            }

            if (cartItem.getProduct() == null
                    || cartItem.getProduct().getId() == null) {
                throw new IllegalStateException(
                        "Cart contains an invalid product."
                );
            }

            Long productId = cartItem.getProduct().getId();

            Inventory inventory = inventoryRepository
                    .findByProductId(productId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Inventory not found for product id: "
                                            + productId
                            ));

            // This assumes CartService reserves stock when items
            // are added to the cart.
            if (inventory.getReservedQuantity() == null
                    || inventory.getReservedQuantity()
                            < cartItem.getQuantity()) {
                throw new IllegalStateException(
                        "Insufficient reserved inventory for product id: "
                                + productId
                );
            }

            BigDecimal subtotal = unitPrice.multiply(
                    BigDecimal.valueOf(cartItem.getQuantity())
            );

            totalAmount = totalAmount.add(subtotal);
        }

        Order order = Order.builder()
                .userId(userId)
                .addressId(addressId)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .expectedDeliveryDate(LocalDate.now().plusDays(5))
                .build();

        order = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {

            BigDecimal unitPrice = cartItem.getUnitPrice();

            BigDecimal subtotal = unitPrice.multiply(
                    BigDecimal.valueOf(cartItem.getQuantity())
            );

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(cartItem.getProduct().getId())
                    .productName(cartItem.getProduct().getName())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            orderItemRepository.save(orderItem);
        }

        createStatusHistory(order, OrderStatus.PENDING);
        createTrackingEvent(order, OrderStatus.PENDING);

        // Purchased items are removed, but their stock reservations
        // remain until payment succeeds or the order is cancelled.
        cartService.removePurchasedItemsAfterCheckout(userId);

        return mapToResponse(order);
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Order ID is required."
            );
        }

        User authenticatedUser = getAuthenticatedUser();

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + id
                        ));

        verifyOrderOwnership(order, authenticatedUser);

        return mapToResponse(order);
    }

    // =========================================================
    // GET ORDERS BY USER
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required."
            );
        }

        User authenticatedUser = getAuthenticatedUser();

        if (!authenticatedUser.getId().equals(userId)
                && !isAdmin(authenticatedUser)) {
            throw new SecurityException(
                    "You are not allowed to view these orders."
            );
        }

        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // ADMIN-ONLY ORDER STATUS UPDATE
    // =========================================================

    @Transactional
    public OrderResponse updateOrderStatus(
            Long orderId,
            OrderStatus newStatus) {

        User authenticatedUser = getAuthenticatedUser();

        // Check the logged-in user's actual database role.
        requireAdmin(authenticatedUser);

        if (orderId == null) {
            throw new IllegalArgumentException(
                    "Order ID is required."
            );
        }

        if (newStatus == null) {
            throw new IllegalArgumentException(
                    "New order status is required."
            );
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + orderId
                        ));

        // PENDING -> CONFIRMED must go through the payment-checked path.
        if (order.getStatus() == OrderStatus.PENDING
                && newStatus == OrderStatus.CONFIRMED) {

            confirmOrderAfterPayment(orderId);

            return mapToResponse(
                    orderRepository.findById(orderId).orElseThrow()
            );
        }

        validateStatusTransition(order.getStatus(), newStatus);

        if (newStatus == OrderStatus.CANCELLED) {
            releasePendingOrderReservations(order);
        }

        order.setStatus(newStatus);

        Order savedOrder = orderRepository.save(order);

        createStatusHistory(savedOrder, newStatus);
        createTrackingEvent(savedOrder, newStatus);

        return mapToResponse(savedOrder);
    }

    // =========================================================
    // CONFIRM ORDER AFTER SUCCESSFUL PAYMENT
    // Internal service operation called by PaymentService.
    // Do not expose this method as an unrestricted REST endpoint.
    // =========================================================

    @Transactional
    public void confirmOrderAfterPayment(Long orderId) {

        if (orderId == null) {
            throw new IllegalArgumentException(
                    "Order ID is required."
            );
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + orderId
                        ));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING orders can be confirmed after payment. "
                            + "Current status: " + order.getStatus()
            );
        }

        // ---- Payment verification ----
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "No payment found for order id: " + orderId
                        ));

        // Adjust "SUCCESS" to whatever your payment status value is
        // (e.g. SUCCESS / PAID / COMPLETED).
        if (!"SUCCESS".equals(String.valueOf(payment.getStatus()))) {
            throw new IllegalStateException(
                    "Order cannot be confirmed: payment status is "
                            + payment.getStatus()
            );
        }

        if (payment.getAmount() == null
                || order.getTotalAmount() == null
                || payment.getAmount().compareTo(order.getTotalAmount()) != 0) {
            throw new IllegalStateException(
                    "Payment amount does not match the order total."
            );
        }
        // ---- End payment verification ----

        List<OrderItem> orderItems =
                orderItemRepository.findByOrderId(orderId);

        if (orderItems.isEmpty()) {
            throw new IllegalStateException(
                    "Cannot confirm an order without order items."
            );
        }

        // Validate all reservations before changing inventory.
        for (OrderItem orderItem : orderItems) {

            Inventory inventory = inventoryRepository
                    .findByProductId(orderItem.getProductId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Inventory not found for product id: "
                                            + orderItem.getProductId()
                            ));

            if (orderItem.getQuantity() == null
                    || orderItem.getQuantity() < 1
                    || inventory.getReservedQuantity() == null
                    || inventory.getReservedQuantity()
                            < orderItem.getQuantity()) {
                throw new IllegalStateException(
                        "Cannot consume reservation for product id: "
                                + orderItem.getProductId()
                );
            }
        }

        // Consume the reservations only after all checks pass.
        for (OrderItem orderItem : orderItems) {

            Inventory inventory = inventoryRepository
                    .findByProductId(orderItem.getProductId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Inventory not found for product id: "
                                            + orderItem.getProductId()
                            ));

            inventory.setReservedQuantity(
                    inventory.getReservedQuantity()
                            - orderItem.getQuantity()
            );

            inventoryRepository.save(inventory);
        }

        order.setStatus(OrderStatus.CONFIRMED);

        Order savedOrder = orderRepository.save(order);

        createStatusHistory(savedOrder, OrderStatus.CONFIRMED);
        createTrackingEvent(savedOrder, OrderStatus.CONFIRMED);
    }

    // =========================================================
    // RELEASE INVENTORY FOR CANCELLED PENDING ORDERS
    // =========================================================

    private void releasePendingOrderReservations(Order order) {

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending orders can release reservations."
            );
        }

        List<OrderItem> orderItems =
                orderItemRepository.findByOrderId(order.getId());

        // Validate every inventory record before modifying any.
        for (OrderItem orderItem : orderItems) {

            Inventory inventory = inventoryRepository
                    .findByProductId(orderItem.getProductId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Inventory not found for product id: "
                                            + orderItem.getProductId()
                            ));

            Integer quantity = orderItem.getQuantity();

            if (quantity == null
                    || quantity < 1
                    || inventory.getAvailableQuantity() == null
                    || inventory.getReservedQuantity() == null
                    || inventory.getReservedQuantity() < quantity) {
                throw new IllegalStateException(
                        "Cannot release reservation for product id: "
                                + orderItem.getProductId()
                );
            }
        }

        for (OrderItem orderItem : orderItems) {

            Inventory inventory = inventoryRepository
                    .findByProductId(orderItem.getProductId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Inventory not found for product id: "
                                            + orderItem.getProductId()
                            ));

            int quantity = orderItem.getQuantity();

            inventory.setReservedQuantity(
                    inventory.getReservedQuantity() - quantity
            );

            inventory.setAvailableQuantity(
                    inventory.getAvailableQuantity() + quantity
            );

            inventoryRepository.save(inventory);
        }
    }

    // =========================================================
    // AUTOMATIC DELIVERY UPDATE
    // Internal scheduler/service operation.
    // =========================================================

    @Transactional
    public void updateOrderStatusAutomatically(
            Long orderId,
            OrderStatus newStatus) {

        if (orderId == null) {
            throw new IllegalArgumentException(
                    "Order ID is required."
            );
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + orderId
                        ));

        // Only allow the automatic OUT_FOR_DELIVERY -> DELIVERED
        // transition once the expected delivery date has arrived.
        if (order.getStatus() != OrderStatus.OUT_FOR_DELIVERY
                || newStatus != OrderStatus.DELIVERED
                || order.getExpectedDeliveryDate() == null
                || order.getExpectedDeliveryDate()
                        .isAfter(LocalDate.now())) {
            return;
        }

        order.setStatus(OrderStatus.DELIVERED);

        Order savedOrder = orderRepository.save(order);

        createStatusHistory(savedOrder, OrderStatus.DELIVERED);
        createTrackingEvent(savedOrder, OrderStatus.DELIVERED);
    }

    // =========================================================
    // ORDER STATUS HISTORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderStatusHistoryResponse> getOrderStatusHistory(
            Long orderId) {

        if (orderId == null) {
            throw new IllegalArgumentException(
                    "Order ID is required."
            );
        }

        User authenticatedUser = getAuthenticatedUser();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + orderId
                        ));

        verifyOrderOwnership(order, authenticatedUser);

        return orderStatusHistoryRepository
                .findByOrderIdOrderByCreatedAtAsc(orderId)
                .stream()
                .map(history ->
                        OrderStatusHistoryResponse.builder()
                                .id(history.getId())
                                .orderId(history.getOrderId())
                                .status(history.getStatus())
                                .createdAt(history.getCreatedAt())
                                .build()
                )
                .toList();
    }

    // =========================================================
    // ORDER STATUS TRANSITION VALIDATION
    // =========================================================

    private void validateStatusTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus) {

        if (currentStatus == null) {
            throw new IllegalStateException(
                    "Current order status cannot be null."
            );
        }

        if (newStatus == null) {
            throw new IllegalArgumentException(
                    "New order status cannot be null."
            );
        }

        Map<OrderStatus, List<OrderStatus>> validTransitions =
                Map.of(
                        OrderStatus.PENDING,
                        List.of(OrderStatus.CANCELLED),

                        OrderStatus.CONFIRMED,
                        List.of(OrderStatus.PACKED),

                        OrderStatus.PACKED,
                        List.of(OrderStatus.SHIPPED),

                        OrderStatus.SHIPPED,
                        List.of(OrderStatus.IN_TRANSIT),

                        OrderStatus.IN_TRANSIT,
                        List.of(OrderStatus.OUT_FOR_DELIVERY),

                        OrderStatus.OUT_FOR_DELIVERY,
                        List.of(OrderStatus.DELIVERED),

                        OrderStatus.DELIVERED,
                        List.of(),

                        OrderStatus.CANCELLED,
                        List.of()
                );

        List<OrderStatus> allowedStatuses =
                validTransitions.get(currentStatus);

        if (allowedStatuses == null
                || !allowedStatuses.contains(newStatus)) {
            throw new IllegalStateException(
                    "Invalid order status transition from "
                            + currentStatus + " to " + newStatus
            );
        }
    }

    // =========================================================
    // CREATE ORDER STATUS HISTORY
    // =========================================================

    private void createStatusHistory(
            Order order,
            OrderStatus status) {

        OrderStatusHistory history = OrderStatusHistory.builder()
                .orderId(order.getId())
                .status(status)
                .createdAt(LocalDateTime.now())
                .build();

        orderStatusHistoryRepository.save(history);
    }

    // =========================================================
    // CREATE TRACKING EVENT
    // =========================================================

    private void createTrackingEvent(
            Order order,
            OrderStatus status) {

        OrderTrackingEvent event = OrderTrackingEvent.builder()
                .orderId(order.getId())
                .status(status)
                .location(getTrackingLocation(status))
                .description(getTrackingDescription(status))
                .createdAt(LocalDateTime.now())
                .build();

        orderTrackingEventRepository.save(event);
    }

    private String getTrackingLocation(OrderStatus status) {

        return switch (status) {
            case PENDING -> "Order Processing Center";
            case CONFIRMED -> "Seller Processing Center";
            case PACKED -> "Seller Warehouse";
            case SHIPPED -> "Regional Dispatch Center";
            case IN_TRANSIT -> "Transit Hub";
            case OUT_FOR_DELIVERY -> "Local Delivery Hub";
            case DELIVERED -> "Customer Address";
            case CANCELLED -> "Order Processing Center";
        };
    }

    private String getTrackingDescription(OrderStatus status) {

        return switch (status) {
            case PENDING ->
                    "Order has been placed successfully.";

            case CONFIRMED ->
                    "Order has been confirmed by the seller.";

            case PACKED ->
                    "Order has been packed and is ready for dispatch.";

            case SHIPPED ->
                    "Order has been shipped from the seller.";

            case IN_TRANSIT ->
                    "Order is currently in transit.";

            case OUT_FOR_DELIVERY ->
                    "Order is out for delivery.";

            case DELIVERED ->
                    "Order has been delivered successfully.";

            case CANCELLED ->
                    "Order has been cancelled.";
        };
    }

    // =========================================================
    // MAP ORDER TO RESPONSE DTO
    // =========================================================

    private OrderResponse mapToResponse(Order order) {

        List<OrderItemResponse> items =
                orderItemRepository.findByOrderId(order.getId())
                        .stream()
                        .map(item ->
                                OrderItemResponse.builder()
                                        .id(item.getId())
                                        .productId(item.getProductId())
                                        .productName(item.getProductName())
                                        .quantity(item.getQuantity())
                                        .unitPrice(item.getUnitPrice())
                                        .subtotal(item.getSubtotal())
                                        .build()
                        )
                        .toList();

        Address address = null;

        if (order.getAddressId() != null) {
            address = addressRepository.findById(order.getAddressId())
                    .orElse(null);
        }

        Payment payment = paymentRepository
                .findByOrderId(order.getId())
                .orElse(null);

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .addressId(order.getAddressId())

                // Delivery address
                .deliveryFullName(
                        address != null
                                ? address.getFullName() : null)
                .deliveryAddressLine(
                        address != null
                                ? address.getAddressLine() : null)
                .deliveryCity(
                        address != null
                                ? address.getCity() : null)
                .deliveryState(
                        address != null
                                ? address.getState() : null)
                .deliveryPostalCode(
                        address != null
                                ? address.getPostalCode() : null)
                .deliveryCountry(
                        address != null
                                ? address.getCountry() : null)
                .deliveryPhone(
                        address != null
                                ? address.getPhone() : null)

                // Order details
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .expectedDeliveryDate(order.getExpectedDeliveryDate())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())

                // Payment details
                .paymentMethod(
                        payment != null
                                ? payment.getPaymentMethod() : null)
                .paymentStatus(
                        payment != null
                                ? payment.getStatus() : null)
                .transactionId(
                        payment != null
                                ? payment.getTransactionId() : null)
                .paymentAmount(
                        payment != null
                                ? payment.getAmount() : null)

                .items(items)
                .build();
    }

    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        // Detect missing authentication and anonymous sessions.
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken
                || authentication.getPrincipal() == null
                || "anonymousUser".equals(authentication.getPrincipal())) {

            throw new SecurityException(
                    "Authentication required. Please login to access this resource."
            );
        }

        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            throw new SecurityException(
                    "Authenticated user email is missing."
            );
        }

        return userRepository.findByEmail(
                        email.trim().toLowerCase(java.util.Locale.ROOT)
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user not found in the database."
                        ));
    }

    // =========================================================
    // VERIFY ORDER OWNERSHIP
    // =========================================================

    private void verifyOrderOwnership(
            Order order,
            User authenticatedUser) {

        if (order.getUserId() == null
                || authenticatedUser.getId() == null) {
            throw new IllegalStateException(
                    "Order ownership information is missing."
            );
        }

        if (!isAdmin(authenticatedUser)
                && !order.getUserId().equals(authenticatedUser.getId())) {
            throw new SecurityException(
                    "You are not allowed to access this order."
            );
        }
    }

    // =========================================================
    // ADMIN ROLE CHECK
    // =========================================================

    private boolean isAdmin(User user) {

        return user != null
                && user.getRole() != null
                && "ADMIN".equals(user.getRole().name());
    }

    private void requireAdmin(User user) {

        if (!isAdmin(user)) {
            throw new SecurityException(
                    "Admin access is required."
            );
        }
    }
}
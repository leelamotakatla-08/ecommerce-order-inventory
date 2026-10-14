
package com.ecommerce.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.dto.CartItemResponse;
import com.ecommerce.dto.CartResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.InsufficientStockException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional
    public CartResponse addItem(
            Long userId,
            CartItemRequest request) {

        if (userId == null) {
            throw new IllegalArgumentException("User ID is required.");
        }

        if (request == null || request.getProductId() == null) {
            throw new IllegalArgumentException("Product ID is required.");
        }

        if (request.getQuantity() == null
                || request.getQuantity() < 1) {
            throw new IllegalArgumentException(
                    "Quantity must be at least 1."
            );
        }

        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: "
                                        + request.getProductId()
                        ));

        Inventory inventory = inventoryRepository
                .findByProductId(product.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Inventory not found for product id: "
                                        + product.getId()
                        ));

        validateInventory(inventory);

        Cart cart = cartRepository
                .findByUserId(userId)
                .orElseGet(() -> createCart(userId));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(
                        cart.getId(),
                        product.getId()
                )
                .orElse(null);

        int currentQuantity = cartItem == null
                ? 0
                : cartItem.getQuantity();

        int requestedQuantity = request.getQuantity();

        if (currentQuantity > Integer.MAX_VALUE - requestedQuantity) {
            throw new IllegalArgumentException(
                    "Requested quantity is too large."
            );
        }

        int newQuantity = currentQuantity + requestedQuantity;

        if (inventory.getAvailableQuantity() < requestedQuantity) {
            throw new InsufficientStockException(
                    "Insufficient stock. Available: "
                            + inventory.getAvailableQuantity()
                            + ", requested additional quantity: "
                            + requestedQuantity
            );
        }

        // Reserve only the additional quantity.
        inventory.setAvailableQuantity(
                inventory.getAvailableQuantity() - requestedQuantity
        );

        inventory.setReservedQuantity(
                inventory.getReservedQuantity() + requestedQuantity
        );

        inventoryRepository.save(inventory);

        if (cartItem == null) {
            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(newQuantity)
                    .unitPrice(product.getPrice())
                    .subtotal(
                            product.getPrice().multiply(
                                    BigDecimal.valueOf(newQuantity)
                            )
                    )
                    .build();
        } else {
            cartItem.setQuantity(newQuantity);
            cartItem.setSubtotal(
                    cartItem.getUnitPrice().multiply(
                            BigDecimal.valueOf(newQuantity)
                    )
            );
        }

        cartItemRepository.save(cartItem);

        recalculateCartTotal(cart);

        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse getCart(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException("User ID is required.");
        }

        Cart cart = cartRepository
                .findByUserId(userId)
                .orElseGet(() -> createCart(userId));

        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(
            Long userId,
            Long productId,
            Integer quantity) {

        if (quantity == null || quantity < 1) {
            throw new IllegalArgumentException(
                    "Quantity must be at least 1."
            );
        }

        Cart cart = cartRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart not found for user id: " + userId
                        ));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(
                        cart.getId(),
                        productId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found in cart."
                        ));

        Inventory inventory = inventoryRepository
                .findByProductId(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Inventory not found for product id: "
                                        + productId
                        ));

        validateInventory(inventory);

        int currentQuantity = cartItem.getQuantity();
        int quantityDifference = quantity - currentQuantity;

        if (quantityDifference > 0) {

            if (inventory.getAvailableQuantity() < quantityDifference) {
                throw new InsufficientStockException(
                        "Insufficient stock. Available: "
                                + inventory.getAvailableQuantity()
                                + ", requested additional quantity: "
                                + quantityDifference
                );
            }

            inventory.setAvailableQuantity(
                    inventory.getAvailableQuantity() - quantityDifference
            );

            inventory.setReservedQuantity(
                    inventory.getReservedQuantity() + quantityDifference
            );

        } else if (quantityDifference < 0) {

            int releasedQuantity = currentQuantity - quantity;

            validateReservedQuantity(inventory, releasedQuantity);

            inventory.setAvailableQuantity(
                    inventory.getAvailableQuantity() + releasedQuantity
            );

            inventory.setReservedQuantity(
                    inventory.getReservedQuantity() - releasedQuantity
            );
        }

        inventoryRepository.save(inventory);

        cartItem.setQuantity(quantity);
        cartItem.setSubtotal(
                cartItem.getUnitPrice().multiply(
                        BigDecimal.valueOf(quantity)
                )
        );

        cartItemRepository.save(cartItem);

        recalculateCartTotal(cart);

        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(
            Long userId,
            Long productId) {

        Cart cart = cartRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart not found for user id: " + userId
                        ));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(
                        cart.getId(),
                        productId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found in cart."
                        ));

        Inventory inventory = inventoryRepository
                .findByProductId(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Inventory not found for product id: "
                                        + productId
                        ));

        validateInventory(inventory);

        int quantity = cartItem.getQuantity();

        validateReservedQuantity(inventory, quantity);

        inventory.setAvailableQuantity(
                inventory.getAvailableQuantity() + quantity
        );

        inventory.setReservedQuantity(
                inventory.getReservedQuantity() - quantity
        );

        inventoryRepository.save(inventory);

        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        recalculateCartTotal(cart);

        return mapToResponse(cart);
    }

    /*
     * Clears a cart and releases its reservations.
     *
     * Do not call this method after successful checkout:
     * checkout transfers the existing reservations to the order.
     */
    @Transactional
    public void clearCart(Long userId) {

        Cart cart = cartRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart not found for user id: " + userId
                        ));

        List<CartItem> cartItems = new ArrayList<>(
                cartItemRepository.findByCartId(cart.getId())
        );

        for (CartItem cartItem : cartItems) {

            Long productId = cartItem.getProduct().getId();

            Inventory inventory = inventoryRepository
                    .findByProductId(productId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Inventory not found for product id: "
                                            + productId
                            ));

            validateInventory(inventory);

            int quantity = cartItem.getQuantity();

            validateReservedQuantity(inventory, quantity);

            inventory.setAvailableQuantity(
                    inventory.getAvailableQuantity() + quantity
            );

            inventory.setReservedQuantity(
                    inventory.getReservedQuantity() - quantity
            );

            inventoryRepository.save(inventory);
        }

        cartItemRepository.deleteAll(cartItems);
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);

        cartRepository.save(cart);
    }

    /*
     * Called during checkout in the same database transaction.
     * Removes cart items without releasing inventory reservations.
     */
    @Transactional
    public void removePurchasedItemsAfterCheckout(Long userId) {

        Cart cart = cartRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart not found for user id: " + userId
                        ));

        List<CartItem> cartItems = new ArrayList<>(
                cartItemRepository.findByCartId(cart.getId())
        );

        if (cartItems.isEmpty()) {
            throw new IllegalStateException(
                    "Cart is already empty."
            );
        }

        cartItemRepository.deleteAll(cartItems);
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);

        cartRepository.save(cart);
    }

    private Cart createCart(Long userId) {

        Cart cart = Cart.builder()
                .userId(userId)
                .items(new ArrayList<>())
                .totalAmount(BigDecimal.ZERO)
                .build();

        return cartRepository.save(cart);
    }

    private void validateInventory(Inventory inventory) {

        if (inventory.getAvailableQuantity() == null
                || inventory.getReservedQuantity() == null
                || inventory.getAvailableQuantity() < 0
                || inventory.getReservedQuantity() < 0) {

            throw new IllegalStateException(
                    "Invalid inventory quantities for product id: "
                            + inventory.getProduct().getId()
            );
        }
    }

    private void validateReservedQuantity(
            Inventory inventory,
            int quantity) {

        if (inventory.getReservedQuantity() < quantity) {
            throw new IllegalStateException(
                    "Reserved inventory is insufficient for product id: "
                            + inventory.getProduct().getId()
            );
        }
    }

    private void recalculateCartTotal(Cart cart) {

        BigDecimal total = cartItemRepository
                .findByCartId(cart.getId())
                .stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        cart.setTotalAmount(total);

        cartRepository.save(cart);
    }

    private CartResponse mapToResponse(Cart cart) {

        List<CartItemResponse> items =
                cartItemRepository
                        .findByCartId(cart.getId())
                        .stream()
                        .map(this::mapItemToResponse)
                        .toList();

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .items(items)
                .totalAmount(cart.getTotalAmount())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    private CartItemResponse mapItemToResponse(CartItem item) {

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build();
    }
}

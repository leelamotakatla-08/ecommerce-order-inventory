package com.ecommerce.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.dto.PaymentResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.Payment;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Transactional
    public PaymentResponse processPayment(
            Long orderId,
            String paymentMethod) {

        if (orderId == null) {
            throw new IllegalArgumentException("Order ID is required.");
        }

        // Authentication + ownership guard (admins allowed).
        orderService.getOrderById(orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException(
                    "Payment can only be processed for PENDING orders. "
                            + "Current status: " + order.getStatus());
        }

        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            throw new IllegalStateException(
                    "Payment already exists for order id: " + orderId);
        }

        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new IllegalArgumentException("Payment method is required");
        }

        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(order.getTotalAmount())
                .paymentMethod(paymentMethod.trim().toUpperCase())
                .status("SUCCESS")
                .transactionId("TXN-" + UUID.randomUUID())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        orderService.confirmOrderAfterPayment(orderId);

        return mapToResponse(savedPayment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {

        if (orderId == null) {
            throw new IllegalArgumentException("Order ID is required.");
        }

        // Only the order owner or an admin can view the payment.
        orderService.getOrderById(orderId);

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for order id: " + orderId));

        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {

        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
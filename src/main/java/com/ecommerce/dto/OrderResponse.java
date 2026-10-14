package com.ecommerce.dto;

import com.ecommerce.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {

    private Long id;
    private Long userId;
    private Long addressId;

    // Delivery address
    private String deliveryFullName;
    private String deliveryAddressLine;
    private String deliveryCity;
    private String deliveryState;
    private String deliveryPostalCode;
    private String deliveryCountry;
    private String deliveryPhone;

    // Order information
    private BigDecimal totalAmount;
    private OrderStatus status;
    private LocalDate expectedDeliveryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Payment information
    private String paymentMethod;
    private String paymentStatus;
    private String transactionId;
    private BigDecimal paymentAmount;

    private List<OrderItemResponse> items;
}
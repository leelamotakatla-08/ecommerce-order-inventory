package com.ecommerce.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class CartResponse {

    private Long id;

    private Long userId;

    private List<CartItemResponse> items;

    private BigDecimal totalAmount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
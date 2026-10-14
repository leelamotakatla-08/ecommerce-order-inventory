package com.ecommerce.dto;

import com.ecommerce.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class OrderStatusHistoryResponse {

    private Long id;
    private Long orderId;
    private OrderStatus status;
    private String note;
    private LocalDateTime createdAt;
}
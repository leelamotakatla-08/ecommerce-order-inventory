package com.ecommerce.dto;

import com.ecommerce.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class OrderTrackingEventResponse {

    private Long id;

    private Long orderId;

    private OrderStatus status;

    private String location;

    private String description;

    private LocalDateTime createdAt;
}
package com.ecommerce.controller;

import com.ecommerce.dto.OrderTrackingEventResponse;
import com.ecommerce.service.OrderTrackingService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderTrackingController {

    private final OrderTrackingService orderTrackingService;

    @GetMapping("/{orderId}/tracking")
    public ResponseEntity<List<OrderTrackingEventResponse>> getTrackingEvents(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderTrackingService.getTrackingEvents(orderId)
        );
    }
}
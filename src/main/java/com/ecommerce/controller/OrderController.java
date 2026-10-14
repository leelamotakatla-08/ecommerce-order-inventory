package com.ecommerce.controller;

import com.ecommerce.dto.CheckoutRequest;
import com.ecommerce.dto.OrderResponse;
import com.ecommerce.dto.OrderStatusHistoryResponse;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.service.OrderService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @Valid @RequestBody CheckoutRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        orderService.checkout(
                                request.getUserId(),
                                request.getAddressId()
                        )
                );
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.getOrderById(id)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                orderService.getOrdersByUserId(userId)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(
                        id,
                        status
                )
        );
    }

    @GetMapping("/{id}/status-history")
    public ResponseEntity<List<OrderStatusHistoryResponse>>
    getOrderStatusHistory(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.getOrderStatusHistory(id)
        );
    }
}
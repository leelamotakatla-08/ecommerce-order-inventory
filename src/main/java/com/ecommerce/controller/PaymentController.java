package com.ecommerce.controller;

import com.ecommerce.dto.PaymentResponse;
import com.ecommerce.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> processPayment(
            @PathVariable Long orderId,
            @RequestParam String paymentMethod) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        paymentService.processPayment(
                                orderId,
                                paymentMethod
                        )
                );
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                paymentService.getPaymentByOrderId(orderId)
        );
    }
}
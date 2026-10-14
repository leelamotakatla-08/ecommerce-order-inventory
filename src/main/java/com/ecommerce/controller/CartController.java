package com.ecommerce.controller;

import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.dto.CartResponse;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/{userId}/items")
    public ResponseEntity<CartResponse> addItem(
            @PathVariable Long userId,
            @Valid @RequestBody CartItemRequest request) {

        return ResponseEntity.ok(
                cartService.addItem(userId, request)
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CartResponse> getCart(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                cartService.getCart(userId)
        );
    }

    @PutMapping("/{userId}/items/{productId}")
    public ResponseEntity<CartResponse> updateItem(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                cartService.updateItem(
                        userId,
                        productId,
                        quantity
                )
        );
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable Long userId,
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                cartService.removeItem(userId, productId)
        );
    }

    @DeleteMapping("/{userId}/items")
    public ResponseEntity<Void> clearCart(
            @PathVariable Long userId) {

        cartService.clearCart(userId);

        return ResponseEntity.noContent().build();
    }
}
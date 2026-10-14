package com.ecommerce.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.dto.WishlistResponse;
import com.ecommerce.service.WishlistService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{userId}/products/{productId}")
    public ResponseEntity<WishlistResponse> addToWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        wishlistService.addToWishlist(
                                userId,
                                productId
                        )
                );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<WishlistResponse>> getWishlist(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                wishlistService.getWishlist(userId)
        );
    }

    @DeleteMapping("/{userId}/products/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId) {

        wishlistService.removeFromWishlist(
                userId,
                productId
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/products/{productId}/exists")
    public ResponseEntity<Boolean> isInWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                wishlistService.isInWishlist(
                        userId,
                        productId
                )
        );
    }
}
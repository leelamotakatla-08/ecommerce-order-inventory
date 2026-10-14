package com.ecommerce.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.dto.WishlistResponse;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.entity.Wishlist;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.WishlistRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public WishlistResponse addToWishlist(
            Long userId,
            Long productId) {

        if (wishlistRepository.existsByUserIdAndProductId(
                userId,
                productId)) {

            throw new IllegalArgumentException(
                    "Product is already in the wishlist."
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        ));

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + productId
                        ));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        Wishlist savedWishlist =
                wishlistRepository.save(wishlist);

        return mapToResponse(savedWishlist);
    }

    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist(
            Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException(
                    "User not found with id: " + userId
            );
        }

        return wishlistRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void removeFromWishlist(
            Long userId,
            Long productId) {

        Wishlist wishlist =
                wishlistRepository
                        .findByUserIdAndProductId(
                                userId,
                                productId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product is not in the wishlist."
                                ));

        wishlistRepository.delete(wishlist);
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(
            Long userId,
            Long productId) {

        return wishlistRepository
                .existsByUserIdAndProductId(
                        userId,
                        productId
                );
    }

    private WishlistResponse mapToResponse(
            Wishlist wishlist) {

        Product product = wishlist.getProduct();

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .productId(product.getId())
                .productName(product.getName())
                .brand(product.getBrand())
                .imageUrl(product.getImageUrl())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .categoryName(
                        product.getCategory().getName()
                )
                .createdAt(wishlist.getCreatedAt())
                .build();
    }
}
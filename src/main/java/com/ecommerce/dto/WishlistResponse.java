package com.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponse {

    private Long id;

    private Long productId;

    private String productName;

    private String brand;

    private String imageUrl;

    private BigDecimal price;

    private Integer stockQuantity;

    private String categoryName;

    private LocalDateTime createdAt;
}
package com.ecommerce.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InventoryResponse {

    private Long id;

    private Long productId;

    private String productName;

    private Integer availableQuantity;

    private Integer reservedQuantity;

    private Long version;
}
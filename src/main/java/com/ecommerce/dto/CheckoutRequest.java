package com.ecommerce.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Address ID is required")
    private Long addressId;
}
package com.ecommerce.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AddressResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String phone;
    private Boolean defaultAddress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
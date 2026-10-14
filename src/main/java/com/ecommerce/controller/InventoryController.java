package com.ecommerce.controller;

import com.ecommerce.dto.InventoryResponse;
import com.ecommerce.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/{productId}")
    public ResponseEntity<InventoryResponse> createInventory(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(inventoryService.createInventory(productId, quantity));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getInventory(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                inventoryService.getInventoryByProductId(productId)
        );
    }

    @PutMapping("/{productId}/add")
    public ResponseEntity<InventoryResponse> addStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                inventoryService.addStock(productId, quantity)
        );
    }

    @PutMapping("/{productId}/reduce")
    public ResponseEntity<InventoryResponse> reduceStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                inventoryService.reduceStock(productId, quantity)
        );
    }
}
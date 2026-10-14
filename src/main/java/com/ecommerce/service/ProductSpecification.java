package com.ecommerce.service;

import com.ecommerce.entity.Product;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ProductSpecification {

    private ProductSpecification() {
    }

    public static Specification<Product> hasCategory(Long categoryId) {

        return (root, query, criteriaBuilder) ->
                categoryId == null
                        ? null
                        : criteriaBuilder.equal(
                                root.get("category").get("id"),
                                categoryId
                        );
    }

    public static Specification<Product> search(String keyword) {

        return (root, query, criteriaBuilder) -> {

            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }

            String searchKeyword =
                    "%" + keyword.trim().toLowerCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("name")
                            ),
                            searchKeyword
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("brand")
                            ),
                            searchKeyword
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("description")
                            ),
                            searchKeyword
                    )
            );
        };
    }

    public static Specification<Product> priceGreaterThanOrEqualTo(
            BigDecimal minPrice) {

        return (root, query, criteriaBuilder) ->
                minPrice == null
                        ? null
                        : criteriaBuilder.greaterThanOrEqualTo(
                                root.get("price"),
                                minPrice
                        );
    }

    public static Specification<Product> priceLessThanOrEqualTo(
            BigDecimal maxPrice) {

        return (root, query, criteriaBuilder) ->
                maxPrice == null
                        ? null
                        : criteriaBuilder.lessThanOrEqualTo(
                                root.get("price"),
                                maxPrice
                        );
    }

    public static Specification<Product> isAvailable(
            Boolean available) {

        return (root, query, criteriaBuilder) -> {

            if (available == null) {
                return null;
            }

            if (available) {
                return criteriaBuilder.greaterThan(
                        root.get("stockQuantity"),
                        0
                );
            }

            return criteriaBuilder.equal(
                    root.get("stockQuantity"),
                    0
            );
        };
    }
}
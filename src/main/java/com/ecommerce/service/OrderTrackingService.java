package com.ecommerce.service;

import com.ecommerce.dto.OrderTrackingEventResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderTrackingEvent;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.OrderTrackingEventRepository;
import com.ecommerce.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderTrackingService {

    private final OrderRepository orderRepository;
    private final OrderTrackingEventRepository orderTrackingEventRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<OrderTrackingEventResponse> getTrackingEvents(
            Long orderId) {

        User authenticatedUser =
                getAuthenticatedUser();

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order not found with id: "
                                                + orderId
                                ));

        if (!isAdmin(authenticatedUser)
                && !order.getUserId()
                        .equals(authenticatedUser.getId())) {

            throw new SecurityException(
                    "You are not allowed to view this order tracking."
            );
        }

        return orderTrackingEventRepository
                .findByOrderIdOrderByCreatedAtAsc(orderId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new SecurityException(
                    "Authentication is required."
            );
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(
                        email.toLowerCase().trim()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user not found."
                        ));
    }

    private boolean isAdmin(User user) {

        return user.getRole() != null
                && user.getRole()
                        .name()
                        .equals("ADMIN");
    }

    private OrderTrackingEventResponse mapToResponse(
            OrderTrackingEvent event) {

        return OrderTrackingEventResponse.builder()
                .id(event.getId())
                .orderId(event.getOrderId())
                .status(event.getStatus())
                .location(event.getLocation())
                .description(event.getDescription())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
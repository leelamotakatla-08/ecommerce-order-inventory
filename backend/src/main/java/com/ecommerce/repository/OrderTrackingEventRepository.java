package com.ecommerce.repository;

import com.ecommerce.entity.OrderTrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderTrackingEventRepository
        extends JpaRepository<OrderTrackingEvent, Long> {

    List<OrderTrackingEvent> findByOrderIdOrderByCreatedAtAsc(
            Long orderId
    );
}
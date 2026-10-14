
package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.repository.OrderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderDeliveryScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void processDueOrders() {

        log.info("Order delivery scheduler started");

        List<Order> orders = orderRepository.findAll();

        LocalDate today = LocalDate.now();

        int deliveredCount = 0;

        for (Order order : orders) {

            if (order.getExpectedDeliveryDate() == null) {
                continue;
            }

            if (order.getExpectedDeliveryDate().isAfter(today)) {
                continue;
            }

            if (order.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {

                orderService.updateOrderStatusAutomatically(
                    order.getId(),
                    OrderStatus.DELIVERED
                );

                deliveredCount++;

                log.info("Order {} automatically marked as DELIVERED",
                         order.getId());
            }
        }

        log.info("Order delivery scheduler finished. Orders delivered: {}",
                 deliveredCount);
    }
}

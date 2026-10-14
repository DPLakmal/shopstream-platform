package com.shopstream.repository;

import com.shopstream.entity.Order;
import com.shopstream.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail, Pageable pageable);

    long countByStatus(OrderStatus status);
}

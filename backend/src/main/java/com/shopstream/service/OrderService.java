package com.shopstream.service;

import com.shopstream.dto.CartItemDto;
import com.shopstream.dto.CreateOrderRequest;
import com.shopstream.dto.OrderItemDto;
import com.shopstream.dto.OrderResponse;
import com.shopstream.entity.Order;
import com.shopstream.entity.OrderItem;
import com.shopstream.entity.OrderStatus;
import com.shopstream.entity.Product;
import com.shopstream.exception.ResourceNotFoundException;
import com.shopstream.repository.OrderRepository;
import com.shopstream.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final IdempotencyService idempotencyService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        IdempotencyService idempotencyService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.idempotencyService = idempotencyService;
    }

    public OrderResponse createOrder(CreateOrderRequest request) {
        String key = request.getIdempotencyKey();
        if (key != null && !key.isBlank()) {
            boolean acquired = idempotencyService.acquireLock(key, "ORDER_CREATE", Duration.ofMinutes(10));
            if (!acquired) {
                // If already completed, find previously created order
                return idempotencyService.getRecord(key)
                        .map(rec -> getOrderByNumber(rec.getResponseBody()))
                        .orElseThrow(() -> new IllegalStateException("Idempotency conflict"));
            }
        }

        try {
            Order order = new Order();
            order.setOrderNumber(generateOrderNumber());
            order.setCustomerEmail(request.getCustomerEmail());
            order.setCustomerName(request.getCustomerName());
            order.setCustomerPhone(request.getCustomerPhone());
            order.setShippingAddress(request.getShippingAddress());
            order.setBillingAddress(request.getBillingAddress() != null ? request.getBillingAddress() : request.getShippingAddress());
            order.setNotes(request.getNotes());
            order.setStatus(OrderStatus.PENDING);

            BigDecimal subtotal = BigDecimal.ZERO;

            for (CartItemDto itemDto : request.getItems()) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemDto.getProductId()));

                // Verify stock
                if (product.getStockQuantity() < itemDto.getQuantity()) {
                    throw new IllegalArgumentException("Insufficient stock for product: " + product.getTitle());
                }

                OrderItem item = new OrderItem(
                        product.getId(),
                        product.getSku(),
                        product.getTitle(),
                        product.getEffectivePrice(),
                        itemDto.getQuantity(),
                        product.getPrimaryImageUrl()
                );
                order.addItem(item);
                subtotal = subtotal.add(item.getSubtotal());
            }

            order.setSubtotal(subtotal);

            // Free shipping over $100
            BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(100.00)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(10.00);
            order.setShippingAmount(shipping);

            // 8% tax
            BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.08)).setScale(2, RoundingMode.HALF_UP);
            order.setTaxAmount(tax);

            order.setTotalAmount(subtotal.add(shipping).add(tax));
            order.setCurrency("USD");

            Order saved = orderRepository.save(order);

            if (key != null && !key.isBlank()) {
                idempotencyService.markSuccess(key, 201, saved.getOrderNumber());
            }

            return toResponse(saved);
        } catch (Exception ex) {
            if (key != null) {
                idempotencyService.releaseLock(key);
            }
            throw ex;
        }
    }

    public OrderResponse updateOrderStatus(String orderNumber, OrderStatus newStatus) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));

        log.info("Transitioning order {} status from {} to {}", orderNumber, order.getStatus(), newStatus);
        order.setStatus(newStatus);

        // If transitioned to PAID, deduct inventory
        if (newStatus == OrderStatus.PAID) {
            for (OrderItem item : order.getItems()) {
                productRepository.findById(item.getProductId()).ifPresent(p -> {
                    int updated = Math.max(0, p.getStockQuantity() - item.getQuantity());
                    p.setStockQuantity(updated);
                    productRepository.save(p);
                });
            }
        }

        return toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getCustomerOrders(String customerEmail, Pageable pageable) {
        return orderRepository.findByCustomerEmailOrderByCreatedAtDesc(customerEmail, pageable)
                .map(this::toResponse);
    }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        int rand = 1000 + RANDOM.nextInt(9000);
        return "ORD-" + datePart + "-" + rand;
    }

    public OrderResponse toResponse(Order order) {
        OrderResponse res = new OrderResponse();
        res.setId(order.getId());
        res.setOrderNumber(order.getOrderNumber());
        res.setCustomerEmail(order.getCustomerEmail());
        res.setCustomerName(order.getCustomerName());
        res.setCustomerPhone(order.getCustomerPhone());
        res.setStatus(order.getStatus());
        res.setSubtotal(order.getSubtotal());
        res.setTaxAmount(order.getTaxAmount());
        res.setShippingAmount(order.getShippingAmount());
        res.setTotalAmount(order.getTotalAmount());
        res.setCurrency(order.getCurrency());
        res.setShippingAddress(order.getShippingAddress());
        res.setBillingAddress(order.getBillingAddress());
        res.setCreatedAt(order.getCreatedAt());

        if (order.getItems() != null) {
            List<OrderItemDto> itemDtos = order.getItems().stream().map(i -> {
                OrderItemDto dto = new OrderItemDto();
                dto.setProductId(i.getProductId());
                dto.setSku(i.getSku());
                dto.setTitle(i.getTitle());
                dto.setUnitPrice(i.getUnitPrice());
                dto.setQuantity(i.getQuantity());
                dto.setSubtotal(i.getSubtotal());
                dto.setImageUrl(i.getImageUrl());
                return dto;
            }).collect(Collectors.toList());
            res.setItems(itemDtos);
        }

        return res;
    }
}

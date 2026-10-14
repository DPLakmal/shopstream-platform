package com.shopstream.service;

import com.shopstream.dto.CartItemDto;
import com.shopstream.dto.CreateOrderRequest;
import com.shopstream.dto.OrderResponse;
import com.shopstream.entity.Order;
import com.shopstream.entity.OrderStatus;
import com.shopstream.entity.Product;
import com.shopstream.repository.OrderRepository;
import com.shopstream.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    private OrderRepository orderRepository;
    private ProductRepository productRepository;
    private IdempotencyService idempotencyService;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        idempotencyService = Mockito.mock(IdempotencyService.class);
        orderService = new OrderService(orderRepository, productRepository, idempotencyService);
    }

    @Test
    void testCreateOrderSuccess() {
        Product p = new Product();
        p.setId(1L);
        p.setSku("SKU-1");
        p.setTitle("Wireless Headphones");
        p.setBasePrice(new BigDecimal("120.00"));
        p.setStockQuantity(10);

        when(productRepository.findById(1L)).thenReturn(Optional.of(p));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerEmail("customer@example.com");
        req.setCustomerName("Jane Doe");
        req.setShippingAddress("123 Market Street");
        CartItemDto item = new CartItemDto(1L, "SKU-1", "Wireless Headphones", "wireless-headphones", new BigDecimal("120.00"), 1, null);
        req.setItems(List.of(item));

        OrderResponse res = orderService.createOrder(req);

        assertNotNull(res);
        assertNotNull(res.getOrderNumber());
        assertTrue(res.getOrderNumber().startsWith("ORD-"));
        assertEquals(OrderStatus.PENDING, res.getStatus());
        assertEquals(new BigDecimal("120.00"), res.getSubtotal());
        // $120 qualifies for free shipping
        assertEquals(BigDecimal.ZERO, res.getShippingAmount());
        assertEquals(new BigDecimal("9.60"), res.getTaxAmount()); // 8% of 120
        assertEquals(new BigDecimal("129.60"), res.getTotalAmount());
    }

    @Test
    void testCreateOrderInsufficientStockThrows() {
        Product p = new Product();
        p.setId(1L);
        p.setSku("SKU-1");
        p.setTitle("Out of stock item");
        p.setBasePrice(new BigDecimal("50.00"));
        p.setStockQuantity(0);

        when(productRepository.findById(1L)).thenReturn(Optional.of(p));

        CreateOrderRequest req = new CreateOrderRequest();
        req.setCustomerEmail("customer@example.com");
        req.setCustomerName("Jane Doe");
        req.setShippingAddress("123 Market Street");
        CartItemDto item = new CartItemDto(1L, "SKU-1", "Out of stock item", "out-of-stock", new BigDecimal("50.00"), 2, null);
        req.setItems(List.of(item));

        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(req));
    }
}

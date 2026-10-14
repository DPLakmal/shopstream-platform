package com.shopstream.service;

import com.shopstream.dto.CartDto;
import com.shopstream.dto.ProductDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class CartServiceTest {

    private ProductService productService;
    private CartService cartService;

    @BeforeEach
    void setUp() {
        productService = Mockito.mock(ProductService.class);
        cartService = new CartService(productService);
    }

    @Test
    void testAddItemAndCalculations() {
        ProductDto p = new ProductDto();
        p.setId(1L);
        p.setSku("TEST-01");
        p.setTitle("Test Headphones");
        p.setEffectivePrice(new BigDecimal("50.00"));

        when(productService.getProductById(1L)).thenReturn(p);

        String cartId = "cart-test-1";
        CartDto cart = cartService.addItem(cartId, 1L, 2);

        assertNotNull(cart);
        assertEquals(1, cart.getItems().size());
        assertEquals(2, cart.getTotalItems());
        assertEquals(new BigDecimal("100.00"), cart.getSubtotal());
        // $100+ qualifies for free shipping
        assertEquals(BigDecimal.ZERO, cart.getEstimatedShipping());
        assertTrue(cart.getGrandTotal().compareTo(new BigDecimal("100.00")) > 0);
    }

    @Test
    void testUpdateQuantityAndRemove() {
        ProductDto p = new ProductDto();
        p.setId(2L);
        p.setSku("TEST-02");
        p.setTitle("Test Earbuds");
        p.setEffectivePrice(new BigDecimal("20.00"));

        when(productService.getProductById(2L)).thenReturn(p);

        String cartId = "cart-test-2";
        cartService.addItem(cartId, 2L, 1);
        CartDto updated = cartService.updateItemQuantity(cartId, 2L, 4);

        assertEquals(4, updated.getTotalItems());
        assertEquals(new BigDecimal("80.00"), updated.getSubtotal());

        CartDto removed = cartService.removeItem(cartId, 2L);
        assertEquals(0, removed.getItems().size());
        assertEquals(0, removed.getTotalItems());
    }
}

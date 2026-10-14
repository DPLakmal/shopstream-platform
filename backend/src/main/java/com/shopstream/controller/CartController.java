package com.shopstream.controller;

import com.shopstream.dto.CartDto;
import com.shopstream.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart(@RequestHeader(value = "X-Cart-Id", required = false) String headerCartId,
                                           @RequestParam(value = "cartId", required = false) String paramCartId) {
        String cartId = (headerCartId != null && !headerCartId.isBlank()) ? headerCartId : paramCartId;
        CartDto cart = cartService.getCart(cartId);
        return ResponseEntity.ok()
                .header("X-Cart-Id", cart.getCartId())
                .body(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto> addItem(
            @RequestHeader(value = "X-Cart-Id", required = false) String cartId,
            @RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        int quantity = body.containsKey("quantity") ? Integer.parseInt(body.get("quantity").toString()) : 1;
        String resolvedCartId = (cartId != null && !cartId.isBlank()) ? cartId : (String) body.get("cartId");
        CartDto cart = cartService.addItem(resolvedCartId, productId, quantity);
        return ResponseEntity.ok()
                .header("X-Cart-Id", cart.getCartId())
                .body(cart);
    }

    @PutMapping("/items")
    public ResponseEntity<CartDto> updateItemQuantity(
            @RequestHeader(value = "X-Cart-Id", required = false) String cartId,
            @RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        int quantity = Integer.parseInt(body.get("quantity").toString());
        String resolvedCartId = (cartId != null && !cartId.isBlank()) ? cartId : (String) body.get("cartId");
        CartDto cart = cartService.updateItemQuantity(resolvedCartId, productId, quantity);
        return ResponseEntity.ok()
                .header("X-Cart-Id", cart.getCartId())
                .body(cart);
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartDto> removeItem(
            @RequestHeader(value = "X-Cart-Id", required = false) String cartId,
            @PathVariable Long productId,
            @RequestParam(required = false) String paramCartId) {
        String resolvedCartId = (cartId != null && !cartId.isBlank()) ? cartId : paramCartId;
        CartDto cart = cartService.removeItem(resolvedCartId, productId);
        return ResponseEntity.ok()
                .header("X-Cart-Id", cart.getCartId())
                .body(cart);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @RequestHeader(value = "X-Cart-Id", required = false) String cartId,
            @RequestParam(required = false) String paramCartId) {
        String resolvedCartId = (cartId != null && !cartId.isBlank()) ? cartId : paramCartId;
        cartService.clearCart(resolvedCartId);
        return ResponseEntity.noContent().build();
    }
}

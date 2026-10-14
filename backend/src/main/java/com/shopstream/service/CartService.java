package com.shopstream.service;

import com.shopstream.dto.CartDto;
import com.shopstream.dto.CartItemDto;
import com.shopstream.dto.ProductDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class CartService {

    private static final Logger log = LoggerFactory.getLogger(CartService.class);

    private final ProductService productService;

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    // Resilient fallback in-memory store if Redis is unavailable in local sandbox
    private final Map<String, CartDto> inMemoryFallbackCarts = new ConcurrentHashMap<>();

    @Value("${shopstream.cart.session-ttl-days:7}")
    private long cartTtlDays;

    public CartService(ProductService productService) {
        this.productService = productService;
    }

    private String getRedisKey(String cartId) {
        return "cart:" + cartId;
    }

    public CartDto getCart(String cartId) {
        if (cartId == null || cartId.isBlank()) {
            cartId = java.util.UUID.randomUUID().toString();
        }

        CartDto cart = null;
        if (redisTemplate != null) {
            try {
                cart = (CartDto) redisTemplate.opsForValue().get(getRedisKey(cartId));
            } catch (Exception ex) {
                log.warn("Redis unavailable for getCart, using local cache: {}", ex.getMessage());
            }
        }

        if (cart == null) {
            cart = inMemoryFallbackCarts.getOrDefault(cartId, new CartDto(cartId));
        }

        cart.recalculate();
        return cart;
    }

    public CartDto addItem(String cartId, Long productId, int quantity) {
        CartDto cart = getCart(cartId);
        ProductDto product = productService.getProductById(productId);

        Optional<CartItemDto> existing = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst();

        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + quantity);
        } else {
            CartItemDto item = new CartItemDto(
                    product.getId(),
                    product.getSku(),
                    product.getTitle(),
                    product.getSlug(),
                    product.getEffectivePrice(),
                    quantity,
                    product.getPrimaryImageUrl()
            );
            cart.getItems().add(item);
        }

        cart.recalculate();
        saveCart(cart);
        return cart;
    }

    public CartDto updateItemQuantity(String cartId, Long productId, int quantity) {
        CartDto cart = getCart(cartId);
        if (quantity <= 0) {
            cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        } else {
            cart.getItems().stream()
                    .filter(i -> i.getProductId().equals(productId))
                    .findFirst()
                    .ifPresent(i -> i.setQuantity(quantity));
        }

        cart.recalculate();
        saveCart(cart);
        return cart;
    }

    public CartDto removeItem(String cartId, Long productId) {
        CartDto cart = getCart(cartId);
        cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        cart.recalculate();
        saveCart(cart);
        return cart;
    }

    public void clearCart(String cartId) {
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(getRedisKey(cartId));
            } catch (Exception ignored) {}
        }
        inMemoryFallbackCarts.remove(cartId);
    }

    private void saveCart(CartDto cart) {
        inMemoryFallbackCarts.put(cart.getCartId(), cart);
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(getRedisKey(cart.getCartId()), cart, cartTtlDays, TimeUnit.DAYS);
            } catch (Exception ex) {
                log.warn("Failed to persist cart to Redis: {}", ex.getMessage());
            }
        }
    }
}

package com.shopstream.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String cartId;
    private List<CartItemDto> items = new ArrayList<>();
    private Integer totalItems = 0;
    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal estimatedTax = BigDecimal.ZERO;
    private BigDecimal estimatedShipping = BigDecimal.ZERO;
    private BigDecimal grandTotal = BigDecimal.ZERO;

    public CartDto() {}

    public CartDto(String cartId) {
        this.cartId = cartId;
    }

    public void recalculate() {
        int count = 0;
        BigDecimal sum = BigDecimal.ZERO;
        for (CartItemDto item : items) {
            count += (item.getQuantity() != null) ? item.getQuantity() : 0;
            if (item.getSubtotal() != null) {
                sum = sum.add(item.getSubtotal());
            }
        }
        this.totalItems = count;
        this.subtotal = sum;
        // Free shipping over $100, else $10 flat
        if (sum.compareTo(BigDecimal.valueOf(100.00)) >= 0 || count == 0) {
            this.estimatedShipping = BigDecimal.ZERO;
        } else {
            this.estimatedShipping = BigDecimal.valueOf(10.00);
        }
        // 8% estimated tax
        this.estimatedTax = sum.multiply(BigDecimal.valueOf(0.08)).setScale(2, java.math.RoundingMode.HALF_UP);
        this.grandTotal = this.subtotal.add(this.estimatedTax).add(this.estimatedShipping);
    }

    public String getCartId() { return cartId; }
    public void setCartId(String cartId) { this.cartId = cartId; }
    public List<CartItemDto> getItems() { return items; }
    public void setItems(List<CartItemDto> items) { this.items = items; }
    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getEstimatedTax() { return estimatedTax; }
    public void setEstimatedTax(BigDecimal estimatedTax) { this.estimatedTax = estimatedTax; }
    public BigDecimal getEstimatedShipping() { return estimatedShipping; }
    public void setEstimatedShipping(BigDecimal estimatedShipping) { this.estimatedShipping = estimatedShipping; }
    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }
}

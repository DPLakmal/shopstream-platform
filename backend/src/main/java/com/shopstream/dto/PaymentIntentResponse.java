package com.shopstream.dto;

import java.math.BigDecimal;

public class PaymentIntentResponse {
    private String clientSecret;
    private String paymentIntentId;
    private String orderNumber;
    private BigDecimal amount;
    private String currency;
    private String status;
    private boolean mock;

    public PaymentIntentResponse() {}

    public PaymentIntentResponse(String clientSecret, String paymentIntentId, String orderNumber, BigDecimal amount, String currency, String status, boolean mock) {
        this.clientSecret = clientSecret;
        this.paymentIntentId = paymentIntentId;
        this.orderNumber = orderNumber;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.mock = mock;
    }

    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isMock() { return mock; }
    public void setMock(boolean mock) { this.mock = mock; }
}

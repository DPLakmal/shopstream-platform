package com.shopstream.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopstream.dto.OrderResponse;
import com.shopstream.dto.PaymentIntentRequest;
import com.shopstream.dto.PaymentIntentResponse;
import com.shopstream.entity.Order;
import com.shopstream.entity.OrderStatus;
import com.shopstream.entity.PaymentTransaction;
import com.shopstream.exception.ResourceNotFoundException;
import com.shopstream.repository.OrderRepository;
import com.shopstream.repository.PaymentTransactionRepository;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderService orderService;
    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    @Value("${shopstream.stripe.api-key:sk_test_mock_shopstream_key}")
    private String stripeApiKey;

    @Value("${shopstream.stripe.webhook-secret:whsec_mock_shopstream_secret}")
    private String stripeWebhookSecret;

    @Value("${shopstream.stripe.mock-mode:true}")
    private boolean mockMode;

    public PaymentService(OrderRepository orderRepository,
                          PaymentTransactionRepository paymentTransactionRepository,
                          OrderService orderService,
                          IdempotencyService idempotencyService,
                          ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.orderService = orderService;
        this.idempotencyService = idempotencyService;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        if (stripeApiKey != null && !stripeApiKey.startsWith("sk_test_mock")) {
            Stripe.apiKey = stripeApiKey;
            this.mockMode = false;
        } else {
            this.mockMode = true;
            log.info("ShopStream Stripe running in simulated MOCK MODE for seamless local testing.");
        }
    }

    public PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request) {
        Order order = orderRepository.findByOrderNumber(request.getOrderNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + request.getOrderNumber()));

        // Mark order as PAYMENT_PENDING
        order.setStatus(OrderStatus.PAYMENT_PENDING);
        orderRepository.save(order);

        BigDecimal amount = order.getTotalAmount();
        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

        if (mockMode) {
            String mockIntentId = "pi_mock_" + UUID.randomUUID().toString().substring(0, 18);
            String mockSecret = mockIntentId + "_secret_" + UUID.randomUUID().toString().substring(0, 16);
            return new PaymentIntentResponse(
                    mockSecret,
                    mockIntentId,
                    order.getOrderNumber(),
                    amount,
                    order.getCurrency(),
                    "requires_payment_method",
                    true
            );
        }

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(order.getCurrency().toLowerCase())
                    .setDescription("ShopStream Order " + order.getOrderNumber())
                    .putMetadata("orderNumber", order.getOrderNumber())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            return new PaymentIntentResponse(
                    intent.getClientSecret(),
                    intent.getId(),
                    order.getOrderNumber(),
                    amount,
                    order.getCurrency(),
                    intent.getStatus(),
                    false
            );
        } catch (Exception ex) {
            log.error("Failed to create Stripe PaymentIntent: {}", ex.getMessage());
            throw new RuntimeException("Stripe payment creation error: " + ex.getMessage(), ex);
        }
    }

    public boolean processWebhook(String payload, String sigHeader) {
        String eventId = null;
        String eventType = null;
        String paymentIntentId = null;
        String orderNumber = null;
        BigDecimal amount = null;
        String status = "FAILED";

        try {
            if (!mockMode && stripeWebhookSecret != null && !stripeWebhookSecret.startsWith("whsec_mock")) {
                Event event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
                eventId = event.getId();
                eventType = event.getType();

                if ("payment_intent.succeeded".equals(eventType)) {
                    PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (intent != null) {
                        paymentIntentId = intent.getId();
                        orderNumber = intent.getMetadata().get("orderNumber");
                        amount = BigDecimal.valueOf(intent.getAmount()).divide(BigDecimal.valueOf(100));
                        status = "PAID";
                    }
                }
            } else {
                // Parse mock / simulated webhook JSON
                JsonNode root = objectMapper.readTree(payload);
                eventId = root.path("id").asText("evt_mock_" + UUID.randomUUID());
                eventType = root.path("type").asText("payment_intent.succeeded");
                JsonNode dataObj = root.path("data").path("object");
                paymentIntentId = dataObj.path("id").asText("pi_mock_" + UUID.randomUUID());
                orderNumber = dataObj.path("metadata").path("orderNumber").asText();
                if (orderNumber == null || orderNumber.isBlank()) {
                    orderNumber = root.path("orderNumber").asText();
                }
                amount = BigDecimal.valueOf(dataObj.path("amount").asLong(10000)).divide(BigDecimal.valueOf(100));
                status = "PAID";
            }

            if (orderNumber == null || orderNumber.isBlank()) {
                log.warn("Webhook received without orderNumber, eventId: {}", eventId);
                return true;
            }

            // ====================================================================
            // IDEMPOTENCY GUARD: Prevent duplicate charges & duplicate fulfillment
            // ====================================================================
            String idempotencyKey = "stripe-evt:" + eventId;
            boolean acquired = idempotencyService.acquireLock(idempotencyKey, "STRIPE_WEBHOOK", Duration.ofHours(24));
            if (!acquired) {
                log.info("Stripe webhook already processed idempotently for eventId: {}", eventId);
                return true;
            }

            Order order = orderRepository.findByOrderNumber(orderNumber).orElse(null);
            if (order == null) {
                log.warn("Order {} not found during webhook processing", orderNumber);
                idempotencyService.releaseLock(idempotencyKey);
                return false;
            }

            // Check if already in PAID state
            if (order.getStatus() == OrderStatus.PAID) {
                log.info("Order {} is already marked as PAID. Skipping duplicate processing.", orderNumber);
                idempotencyService.markSuccess(idempotencyKey, 200, "ALREADY_PAID");
                return true;
            }

            if ("PAID".equalsIgnoreCase(status)) {
                orderService.updateOrderStatus(orderNumber, OrderStatus.PAID);
            } else {
                orderService.updateOrderStatus(orderNumber, OrderStatus.FAILED);
            }

            // Save Payment Transaction Audit Log
            PaymentTransaction tx = new PaymentTransaction();
            tx.setOrder(order);
            tx.setStripePaymentIntentId(paymentIntentId);
            tx.setAmount(amount != null ? amount : order.getTotalAmount());
            tx.setCurrency(order.getCurrency());
            tx.setStatus(status);
            tx.setIdempotencyKey(idempotencyKey);
            tx.setRawResponse(payload);
            paymentTransactionRepository.save(tx);

            idempotencyService.markSuccess(idempotencyKey, 200, "SUCCESS");
            log.info("Successfully processed payment webhook for order: {}, intent: {}", orderNumber, paymentIntentId);
            return true;

        } catch (Exception ex) {
            log.error("Stripe webhook processing error: {}", ex.getMessage(), ex);
            if (eventId != null) {
                idempotencyService.releaseLock("stripe-evt:" + eventId);
            }
            return false;
        }
    }

    public OrderResponse simulatePaymentSuccess(String orderNumber, String idempotencyKey) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));

        String key = (idempotencyKey != null && !idempotencyKey.isBlank())
                ? idempotencyKey
                : "sim-" + UUID.randomUUID();

        boolean acquired = idempotencyService.acquireLock(key, "MOCK_PAYMENT", Duration.ofMinutes(15));
        if (!acquired || order.getStatus() == OrderStatus.PAID) {
            log.info("Order {} already paid or simulation idempotent for key {}", orderNumber, key);
            return orderService.toResponse(order);
        }

        try {
            OrderResponse updated = orderService.updateOrderStatus(orderNumber, OrderStatus.PAID);

            PaymentTransaction tx = new PaymentTransaction();
            tx.setOrder(order);
            tx.setStripePaymentIntentId("pi_sim_" + UUID.randomUUID().toString().substring(0, 16));
            tx.setAmount(order.getTotalAmount());
            tx.setCurrency(order.getCurrency());
            tx.setStatus("PAID");
            tx.setPaymentMethod("mock_card");
            tx.setIdempotencyKey(key);
            paymentTransactionRepository.save(tx);

            idempotencyService.markSuccess(key, 200, updated.getOrderNumber());
            return updated;
        } catch (Exception ex) {
            idempotencyService.releaseLock(key);
            throw ex;
        }
    }
}

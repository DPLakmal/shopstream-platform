package com.shopstream.controller;

import com.shopstream.dto.OrderResponse;
import com.shopstream.dto.PaymentIntentRequest;
import com.shopstream.dto.PaymentIntentResponse;
import com.shopstream.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody PaymentIntentRequest request) {

        if (idempotencyKey != null && request.getIdempotencyKey() == null) {
            request.setIdempotencyKey(idempotencyKey);
        }

        return ResponseEntity.ok(paymentService.createPaymentIntent(request));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        boolean processed = paymentService.processWebhook(payload, sigHeader);
        if (processed) {
            return ResponseEntity.ok("Webhook processed successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to process webhook");
        }
    }

    @PostMapping("/simulate-success")
    public ResponseEntity<OrderResponse> simulateSuccess(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody Map<String, String> body) {

        String orderNumber = body.get("orderNumber");
        if (orderNumber == null || orderNumber.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String key = (idempotencyKey != null) ? idempotencyKey : body.get("idempotencyKey");
        return ResponseEntity.ok(paymentService.simulatePaymentSuccess(orderNumber, key));
    }
}

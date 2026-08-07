package com.zoadex.api.payment;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.net.Webhook;
import com.zoadex.api.common.exception.BadRequestException;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final StripeService stripeService;
    private final UserRepository userRepository;

    @Value("${zoadex.stripe.webhook-secret:}")
    private String webhookSecret;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckout(@RequestAttribute("userId") UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.hasActiveSubscription()) {
            throw new BadRequestException("You already have an active subscription");
        }

        try {
            String checkoutUrl = stripeService.createCheckoutSession(user);
            return ResponseEntity.ok(Map.of("url", checkoutUrl));
        } catch (StripeException e) {
            log.error("Stripe checkout error: {}", e.getMessage());
            throw new BadRequestException("Payment service unavailable");
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature");
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        switch (event.getType()) {
            case "customer.subscription.created", "customer.subscription.updated" -> {
                Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (subscription != null && "active".equals(subscription.getStatus())) {
                    stripeService.handleSubscriptionActive(
                            subscription.getCustomer(),
                            subscription.getId()
                    );
                }
            }
            case "customer.subscription.deleted" -> {
                Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (subscription != null) {
                    stripeService.handleSubscriptionCancelled(subscription.getCustomer());
                }
            }
            case "invoice.payment_failed" -> {
                log.warn("Payment failed for event: {}", event.getId());
            }
            default -> log.debug("Unhandled Stripe event: {}", event.getType());
        }

        return ResponseEntity.ok("ok");
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSubscriptionStatus(@RequestAttribute("userId") UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        return ResponseEntity.ok(Map.of(
                "plan", user.getPlan().name(),
                "subscriptionStatus", user.getSubscriptionStatus() != null ? user.getSubscriptionStatus() : "none",
                "active", user.hasActiveSubscription(),
                "regionSlots", user.getPlan() == com.zoadex.api.user.UserPlan.PRO ? 10 : 3
        ));
    }
}

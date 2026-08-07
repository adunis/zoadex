package com.zoadex.api.payment;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserPlan;
import com.zoadex.api.user.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    private final UserRepository userRepository;

    @Value("${zoadex.stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${zoadex.stripe.price-id:}")
    private String priceId;

    @Value("${zoadex.mail.base-url:http://localhost:5173}")
    private String baseUrl;

    @PostConstruct
    public void init() {
        if (!stripeSecretKey.isBlank()) {
            Stripe.apiKey = stripeSecretKey;
            log.info("Stripe initialized");
        } else {
            log.warn("Stripe secret key not configured - payments disabled");
        }
    }

    public String createCheckoutSession(User user) throws StripeException {
        String customerId = user.getStripeCustomerId();
        if (customerId == null) {
            CustomerCreateParams customerParams = CustomerCreateParams.builder()
                    .setEmail(user.getEmail())
                    .putMetadata("userId", user.getId().toString())
                    .putMetadata("username", user.getUsername())
                    .build();

            Customer customer = Customer.create(customerParams);
            customerId = customer.getId();

            user.setStripeCustomerId(customerId);
            userRepository.save(user);
        }

        SessionCreateParams sessionParams = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setCustomer(customerId)
                .setSuccessUrl(baseUrl + "/profile?subscription=success")
                .setCancelUrl(baseUrl + "/profile?subscription=cancelled")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(priceId)
                                .setQuantity(1L)
                                .build()
                )
                .build();

        Session session = Session.create(sessionParams);
        return session.getUrl();
    }

    @Transactional
    public void handleSubscriptionActive(String customerId, String subscriptionId) {
        userRepository.findByStripeCustomerId(customerId).ifPresent(user -> {
            user.setStripeSubscriptionId(subscriptionId);
            user.setSubscriptionStatus("active");
            user.setPlan(UserPlan.PRO);
            userRepository.save(user);
            log.info("Subscription activated for user {}", user.getUsername());
        });
    }

    @Transactional
    public void handleSubscriptionCancelled(String customerId) {
        userRepository.findByStripeCustomerId(customerId).ifPresent(user -> {
            user.setSubscriptionStatus("cancelled");
            user.setPlan(UserPlan.FREE);
            userRepository.save(user);
            log.info("Subscription cancelled for user {}", user.getUsername());
        });
    }

    @Transactional
    public void handleSubscriptionExpired(String customerId) {
        userRepository.findByStripeCustomerId(customerId).ifPresent(user -> {
            user.setSubscriptionStatus("expired");
            user.setPlan(UserPlan.FREE);
            userRepository.save(user);
            log.info("Subscription expired for user {}", user.getUsername());
        });
    }
}

package com.zoadex.api.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("")
    private String fromAddress;

    @Value("")
    private String baseUrl;

    @Async
    public void sendVerificationEmail(String to, String username, String token) {
        String verifyUrl = baseUrl + "/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("ZoaDex - Verify your email");
        message.setText(String.format(
                "Hi %s,\n\n" +
                "Welcome to ZoaDex! Please verify your email address by clicking the link below:\n\n" +
                "%s\n\n" +
                "This link expires in 24 hours.\n\n" +
                "If you didn't create an account, you can safely ignore this email.\n\n" +
                "Happy exploring!\n" +
                "The ZoaDex Team",
                username, verifyUrl
        ));

        try {
            mailSender.send(message);
            log.info("Verification email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String username, String token) {
        String resetUrl = baseUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("ZoaDex - Reset your password");
        message.setText(String.format(
                "Hi %s,\n\n" +
                "You requested a password reset. Click the link below to set a new password:\n\n" +
                "%s\n\n" +
                "This link expires in 1 hour.\n\n" +
                "If you didn't request this, you can safely ignore this email.\n\n" +
                "The ZoaDex Team",
                username, resetUrl
        ));

        try {
            mailSender.send(message);
            log.info("Password reset email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }
}

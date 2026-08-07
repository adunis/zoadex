package com.zoadex.api.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    private static final String TEST_SECRET = "thisIsATestSecretKeyThatMustBeAtLeast256BitsLongForHmacSha256Algorithm";
    private static final long TEST_EXPIRATION_MS = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", TEST_EXPIRATION_MS);
    }

    @Test
    void generateToken_returnsNonNullToken() {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateToken(userId, "test@example.com");

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void extractUserId_returnsCorrectUuid() {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateToken(userId, "test@example.com");

        UUID extractedId = jwtService.extractUserId(token);

        assertThat(extractedId).isEqualTo(userId);
    }

    @Test
    void extractEmail_returnsCorrectEmail() {
        UUID userId = UUID.randomUUID();
        String email = "user@zoadex.com";
        String token = jwtService.generateToken(userId, email);

        String extractedEmail = jwtService.extractEmail(token);

        assertThat(extractedEmail).isEqualTo(email);
    }

    @Test
    void isTokenValid_returnsTrueForValidToken() {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateToken(userId, "test@example.com");

        boolean valid = jwtService.isTokenValid(token);

        assertThat(valid).isTrue();
    }

    @Test
    void isTokenValid_returnsFalseForExpiredToken() {
        // Set a negative expiration to create an already-expired token
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", -1000L);

        UUID userId = UUID.randomUUID();
        String token = jwtService.generateToken(userId, "test@example.com");

        // Reset to normal for validation
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", TEST_EXPIRATION_MS);

        boolean valid = jwtService.isTokenValid(token);

        assertThat(valid).isFalse();
    }

    @Test
    void isTokenValid_returnsFalseForMalformedToken() {
        boolean valid = jwtService.isTokenValid("not.a.valid.jwt.token");

        assertThat(valid).isFalse();
    }
}

package com.zoadex.api.user;

import com.zoadex.api.common.exception.BadRequestException;
import com.zoadex.api.config.JwtService;
import com.zoadex.api.user.dto.AuthResponse;
import com.zoadex.api.user.dto.LoginRequest;
import com.zoadex.api.user.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserPrivacyRepository userPrivacyRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_createsUserWithEncodedPassword() {
        RegisterRequest request = RegisterRequest.builder()
                .email("test@example.com")
                .username("testuser")
                .password("plainPassword123")
                .build();

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("plainPassword123")).thenReturn("encodedHash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });
        when(userPrivacyRepository.save(any(UserPrivacy.class))).thenReturn(null);
        when(jwtService.generateToken(any(UUID.class), any(String.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getEmail()).isEqualTo("test@example.com");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("encodedHash");
    }

    @Test
    void register_throwsWhenEmailAlreadyExists() {
        RegisterRequest request = RegisterRequest.builder()
                .email("existing@example.com")
                .username("newuser")
                .password("password123")
                .build();

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Email already in use");
    }

    @Test
    void register_throwsWhenUsernameAlreadyExists() {
        RegisterRequest request = RegisterRequest.builder()
                .email("new@example.com")
                .username("existinguser")
                .password("password123")
                .build();

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Username already taken");
    }

    @Test
    void login_returnsTokenForValidCredentials() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("user@example.com")
                .username("validuser")
                .passwordHash("hashedPw")
                .build();

        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("correctPassword")
                .build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correctPassword", "hashedPw")).thenReturn(true);
        when(jwtService.generateToken(userId, "user@example.com")).thenReturn("valid-jwt");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("valid-jwt");
        assertThat(response.getUsername()).isEqualTo("validuser");
        assertThat(response.getEmail()).isEqualTo("user@example.com");
    }

    @Test
    void login_throwsForInvalidEmail() {
        LoginRequest request = LoginRequest.builder()
                .email("nonexistent@example.com")
                .password("password")
                .build();

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void login_throwsForWrongPassword() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .username("user")
                .passwordHash("correctHash")
                .build();

        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("wrongPassword")
                .build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "correctHash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Invalid email or password");
    }
}

package com.zoadex.api.user;

import com.zoadex.api.common.exception.BadRequestException;
import com.zoadex.api.common.exception.ResourceNotFoundException;
import com.zoadex.api.config.JwtService;
import com.zoadex.api.region.Region;
import com.zoadex.api.region.RegionRepository;
import com.zoadex.api.user.dto.AuthResponse;
import com.zoadex.api.user.dto.LoginRequest;
import com.zoadex.api.user.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserPrivacyRepository userPrivacyRepository;
    private final UserRegionRepository userRegionRepository;
    private final RegionRepository regionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        // If username contains 'admin', give 999 slots (admin override)
        if (request.getUsername().toLowerCase().contains("admin")) {
            user.setPlan(UserPlan.PRO);
        }

        user = userRepository.save(user);

        // Create default privacy settings
        UserPrivacy privacy = UserPrivacy.builder()
                .userId(user.getId())
                .build();
        userPrivacyRepository.save(privacy);

        // Assign starting region if provided
        if (request.getRegionId() != null) {
            Region region = regionRepository.findById(request.getRegionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Region", "id", request.getRegionId()));
            user.setActiveRegion(region);
            user = userRepository.save(user);

            UserRegion userRegion = UserRegion.builder()
                    .userId(user.getId())
                    .regionId(request.getRegionId())
                    .unlockedAt(LocalDateTime.now())
                    .build();
            userRegionRepository.save(userRegion);
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }
}

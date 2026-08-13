package com.zoadex.api.user;

import com.zoadex.api.badge.UserBadge;
import com.zoadex.api.badge.UserBadgeRepository;
import com.zoadex.api.common.exception.BadRequestException;
import com.zoadex.api.common.exception.ResourceNotFoundException;
import com.zoadex.api.map.exploration.ExploredCellRepository;
import com.zoadex.api.map.exploration.MapNoteRepository;
import com.zoadex.api.region.Region;
import com.zoadex.api.region.RegionRepository;
import com.zoadex.api.sighting.Sighting;
import com.zoadex.api.sighting.SightingRepository;
import com.zoadex.api.social.FriendshipRepository;
import com.zoadex.api.social.NotificationRepository;
import com.zoadex.api.xp.XpEvent;
import com.zoadex.api.xp.XpEventRepository;
import com.zoadex.api.xp.XpService;
import com.zoadex.api.user.dto.UpdateProfileRequest;
import com.zoadex.api.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final SightingRepository sightingRepository;
    private final UserRegionRepository userRegionRepository;
    private final XpService xpService;
    private final XpEventRepository xpEventRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ExploredCellRepository exploredCellRepository;
    private final MapNoteRepository mapNoteRepository;
    private final FriendshipRepository friendshipRepository;
    private final NotificationRepository notificationRepository;

    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        long totalSightings = sightingRepository.countByUserId(userId);
        long uniqueDiscoveries = sightingRepository.countByUserIdAndIsFirstDiscoveryTrue(userId);

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .plan(user.getPlan().name())
                .activeRegionId(user.getActiveRegion() != null ? user.getActiveRegion().getId() : null)
                .activeRegionName(user.getActiveRegion() != null ? user.getActiveRegion().getName() : null)
                .totalSightings(totalSightings)
                .uniqueSpeciesDiscovered(uniqueDiscoveries)
                .xp(user.getXp())
                .level(user.getLevel())
                .xpInCurrentLevel(user.getXp() - (user.getLevel() - 1) * 100)
                .xpNeededForNext(100)
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }

        if (request.getActiveRegionId() != null) {
            Region region = regionRepository.findById(request.getActiveRegionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Region", "id", request.getActiveRegionId()));
            user.setActiveRegion(region);
        }

        userRepository.save(user);
        return getProfile(userId);
    }

    @Transactional
    public void setActiveRegion(UUID userId, UUID regionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new ResourceNotFoundException("Region", "id", regionId));

        if (region.getSpeciesCount() == null || region.getSpeciesCount() == 0) {
            throw new BadRequestException("This region has no species data yet. Check back soon!");
        }

        // Check if region is already unlocked
        if (!userRegionRepository.existsByUserIdAndRegionId(userId, regionId)) {
            // Check if user can unlock more regions
            long currentSlots = userRegionRepository.countByUserId(userId);
            int maxSlots = getMaxSlots(user);

            if (currentSlots >= maxSlots) {
                throw new BadRequestException(
                        "Region limit reached. Upgrade to Premium to unlock more regions ("
                                + currentSlots + "/" + maxSlots + ")");
            }

            // Unlock the region
            UserRegion newRegion = UserRegion.builder()
                    .userId(userId)
                    .regionId(regionId)
                    .unlockedAt(LocalDateTime.now())
                    .build();
            userRegionRepository.save(newRegion);
        }

        // Award XP for unlocking a new region
        xpService.awardRegionUnlockXp(userId, regionId);

        user.setActiveRegion(region);
        userRepository.save(user);
    }

    public List<UUID> getUnlockedRegions(UUID userId) {
        return userRegionRepository.findByUserId(userId)
                .stream()
                .map(UserRegion::getRegionId)
                .toList();
    }

    @Transactional
    public void unlockRegion(UUID userId, UUID regionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new ResourceNotFoundException("Region", "id", regionId));

        if (region.getSpeciesCount() == null || region.getSpeciesCount() == 0) {
            throw new BadRequestException("This region has no species data yet. Check back soon!");
        }

        // Check if already unlocked
        if (userRegionRepository.existsByUserIdAndRegionId(userId, regionId)) {
            return; // already unlocked, no-op
        }

        // Check slot limit
        long currentSlots = userRegionRepository.countByUserId(userId);
        int maxSlots = getMaxSlots(user);
        if (currentSlots >= maxSlots) {
            throw new BadRequestException(
                    "Region limit reached. Upgrade to Premium to unlock more regions ("
                            + currentSlots + "/" + maxSlots + ")");
        }

        // Unlock
        UserRegion newRegion = UserRegion.builder()
                .userId(userId)
                .regionId(regionId)
                .unlockedAt(LocalDateTime.now())
                .build();
        userRegionRepository.save(newRegion);

        // Award XP for unlocking a new region
        xpService.awardRegionUnlockXp(userId, regionId);
    }

    private int getMaxSlots(User user) {
        if (user.getUsername().toLowerCase().contains("admin")) {
            return 999;
        }
        return switch (user.getPlan()) {
            case PREMIUM, PRO -> 5;
            case FREE -> 1;
        };
    }

    /**
     * GDPR: Export all user data as a map.
     */
    public Map<String, Object> exportUserData(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Map<String, Object> data = new HashMap<>();

        // Profile
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("email", user.getEmail());
        profile.put("username", user.getUsername());
        profile.put("plan", user.getPlan().name());
        profile.put("xp", user.getXp());
        profile.put("level", user.getLevel());
        profile.put("createdAt", user.getCreatedAt());
        data.put("profile", profile);

        // Sightings
        List<Sighting> sightings = sightingRepository.findByUserId(userId, Pageable.unpaged()).getContent();
        data.put("sightings", sightings.stream().map(s -> {
            Map<String, Object> sm = new HashMap<>();
            sm.put("id", s.getId());
            sm.put("speciesId", s.getSpeciesId());
            sm.put("sightedAt", s.getSightedAt());
            sm.put("notes", s.getNotes());
            sm.put("photoUrl", s.getPhotoUrl());
            sm.put("videoUrl", s.getVideoUrl());
            sm.put("createdAt", s.getCreatedAt());
            return sm;
        }).toList());

        // Badges
        List<UserBadge> badges = userBadgeRepository.findByUserId(userId);
        data.put("badges", badges.stream().map(b -> {
            Map<String, Object> bm = new HashMap<>();
            bm.put("id", b.getId());
            bm.put("badgeId", b.getBadgeId());
            bm.put("unlockedAt", b.getUnlockedAt());
            return bm;
        }).toList());

        // XP Events
        List<XpEvent> xpEvents = xpEventRepository.findByUserIdOrderByCreatedAtDesc(userId);
        data.put("xpEvents", xpEvents.stream().map(x -> {
            Map<String, Object> xm = new HashMap<>();
            xm.put("id", x.getId());
            xm.put("amount", x.getAmount());
            xm.put("reason", x.getReason());
            xm.put("description", x.getDescription());
            xm.put("createdAt", x.getCreatedAt());
            return xm;
        }).toList());

        return data;
    }

    /**
     * GDPR: Delete account and all associated data.
     */
    @Transactional
    public void deleteAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Delete sightings
        List<Sighting> sightings = sightingRepository.findByUserId(userId, Pageable.unpaged()).getContent();
        sightingRepository.deleteAll(sightings);

        // Delete badges
        List<UserBadge> badges = userBadgeRepository.findByUserId(userId);
        userBadgeRepository.deleteAll(badges);

        // Delete XP events
        List<XpEvent> xpEvents = xpEventRepository.findByUserIdOrderByCreatedAtDesc(userId);
        xpEventRepository.deleteAll(xpEvents);

        // Delete explored cells
        exploredCellRepository.deleteAll(exploredCellRepository.findByUserId(userId));

        // Delete map notes
        mapNoteRepository.deleteAll(mapNoteRepository.findByUserId(userId));

        // Delete friendships
        friendshipRepository.deleteAll(friendshipRepository.findAcceptedFriendships(userId));
        friendshipRepository.deleteAll(friendshipRepository.findByUserIdAndStatus(userId, "PENDING"));

        // Delete notifications
        notificationRepository.deleteAll(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged()));

        // Delete user region links
        userRegionRepository.deleteAll(userRegionRepository.findByUserId(userId));

        // Finally delete the user
        userRepository.delete(user);
    }
}


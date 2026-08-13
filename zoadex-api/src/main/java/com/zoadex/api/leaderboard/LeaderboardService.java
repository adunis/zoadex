package com.zoadex.api.leaderboard;

import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final EntityManager entityManager;
    private final UserRepository userRepository;

    public List<LeaderboardEntry> getLeaderboard(UUID regionId, String period, int limit) {
        LocalDateTime since = switch (period) {
            case "weekly" -> LocalDateTime.now().minusWeeks(1);
            case "monthly" -> LocalDateTime.now().minusMonths(1);
            default -> LocalDateTime.of(2000, 1, 1, 0, 0);
        };

        String sql = """
            SELECT s.user_id, COUNT(*) as sighting_count
            FROM sightings s
            JOIN users u ON u.id = s.user_id
            WHERE u.active_region_id = :regionId
              AND s.sighted_at >= :since
            GROUP BY s.user_id
            ORDER BY sighting_count DESC
            LIMIT :limit
            """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("regionId", regionId);
        query.setParameter("since", since);
        query.setParameter("limit", limit);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        List<LeaderboardEntry> entries = new ArrayList<>();
        int rank = 1;
        for (Object[] row : results) {
            UUID userId = (UUID) row[0];
            long sightingCount = ((Number) row[1]).longValue();

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) continue;

            entries.add(LeaderboardEntry.builder()
                    .rank(rank++)
                    .userId(userId)
                    .username(user.getUsername())
                    .level(user.getLevel())
                    .xp(user.getXp())
                    .sightingCount(sightingCount)
                    .build());
        }

        return entries;
    }
}

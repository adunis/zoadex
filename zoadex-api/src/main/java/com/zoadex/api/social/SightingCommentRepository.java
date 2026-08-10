package com.zoadex.api.social;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SightingCommentRepository extends JpaRepository<SightingComment, UUID> {
    List<SightingComment> findBySightingIdOrderByCreatedAtAsc(UUID sightingId);
    long countBySightingId(UUID sightingId);
}

package com.zoadex.api.sighting;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpeditionRepository extends JpaRepository<Expedition, UUID> {

    Page<Expedition> findByUserId(UUID userId, Pageable pageable);

    Optional<Expedition> findByUserIdAndEndedAtIsNull(UUID userId);
}

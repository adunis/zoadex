package com.zoadex.api.species;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpeciesImageRepository extends JpaRepository<SpeciesImage, UUID> {

    List<SpeciesImage> findBySpeciesId(UUID speciesId);

    List<SpeciesImage> findBySpeciesIdIn(List<UUID> speciesIds);
}

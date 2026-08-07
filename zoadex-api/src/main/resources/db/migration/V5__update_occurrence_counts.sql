-- Update region_species occurrence_count from actual imported occurrence data.
-- Species with 30 points = common (we hit our import cap).
-- Species with fewer points = rarer (GBIF had limited records).
UPDATE region_species rs
SET occurrence_count = (
    SELECT COUNT(*)
    FROM species_occurrences so
    WHERE so.species_id = rs.species_id
      AND so.region_id = rs.region_id
);

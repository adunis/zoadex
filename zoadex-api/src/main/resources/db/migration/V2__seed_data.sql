-- V2__seed_data.sql
-- Seed Emilia-Romagna region with approximate boundary
INSERT INTO regions (id, name, country, admin_level, boundary, species_count, created_at)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Emilia-Romagna',
    'Italy',
    4,
    ST_GeomFromText('MULTIPOLYGON(((9.2 43.7, 12.8 43.7, 12.8 45.1, 9.2 45.1, 9.2 43.7)))', 4326),
    0,
    NOW()
);

-- Seed sample badges
INSERT INTO badges (id, name, description, icon_url, category, tier, criteria, created_at) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Bird Watcher Bronze',
    'Discover 25% of all bird species in your active region',
    NULL,
    'REGION_CATEGORY',
    'BRONZE',
    '{"type": "REGION_CATEGORY_COMPLETE", "category": "BIRDS", "percentage": 25}',
    NOW()
),
(
    '22222222-2222-2222-2222-222222222222',
    'Bird Watcher Gold',
    'Discover 75% of all bird species in your active region',
    NULL,
    'REGION_CATEGORY',
    'GOLD',
    '{"type": "REGION_CATEGORY_COMPLETE", "category": "BIRDS", "percentage": 75}',
    NOW()
),
(
    '33333333-3333-3333-3333-333333333333',
    'First Steps',
    'Discover your very first species in the wild',
    NULL,
    'MILESTONE',
    'BRONZE',
    '{"type": "MILESTONE", "count": 1}',
    NOW()
),
(
    '44444444-4444-4444-4444-444444444444',
    'Explorer',
    'Discover 50 unique species — you are a true explorer!',
    NULL,
    'MILESTONE',
    'GOLD',
    '{"type": "MILESTONE", "count": 50}',
    NOW()
),
(
    '55555555-5555-5555-5555-555555555555',
    'Robin Regular',
    'Spot the same species 10 times — you know its habits well',
    NULL,
    'SPECIES_SIGHTING_COUNT',
    'SILVER',
    '{"type": "SPECIES_SIGHTING_COUNT", "count": 10}',
    NOW()
),
(
    '66666666-6666-6666-6666-666666666666',
    'Shutterbug',
    'Take photos of 25 sightings — documenting nature like a pro',
    NULL,
    'SIGHTINGS_WITH_PHOTO',
    'SILVER',
    '{"type": "SIGHTINGS_WITH_PHOTO", "count": 25}',
    NOW()
),
(
    '77777777-7777-7777-7777-777777777777',
    'Week Warrior',
    'Stay active for 7 weeks — consistency is key!',
    NULL,
    'STREAK',
    'GOLD',
    '{"type": "STREAK", "weeks": 7}',
    NOW()
);

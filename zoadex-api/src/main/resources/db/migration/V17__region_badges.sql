-- Region-specific badges: auto-generated per region
-- Badge templates: Explorer, Champion, Avian Lord, Plant Sage, Fungi Master

-- Add region_id to badges to link region-specific badges
ALTER TABLE badges ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);

CREATE INDEX IF NOT EXISTS idx_badges_region_id ON badges(region_id);

-- Insert region-specific badges for all regions
-- Explorer of [Region] - log 10 sightings in this region
INSERT INTO badges (id, name, description, category, tier, criteria, region_id)
SELECT
    gen_random_uuid(),
    'Explorer of ' || r.name,
    'Log 10 sightings in ' || r.name,
    'EXPLORATION',
    'BRONZE',
    ('{"type": "region_sightings", "regionId": "' || r.id || '", "count": 10}')::jsonb,
    r.id
FROM regions r
WHERE NOT EXISTS (
    SELECT 1 FROM badges b WHERE b.region_id = r.id AND b.name = 'Explorer of ' || r.name
);

-- Champion of [Region] - discover 50 unique species in this region
INSERT INTO badges (id, name, description, category, tier, criteria, region_id)
SELECT
    gen_random_uuid(),
    'Champion of ' || r.name,
    'Discover 50 unique species in ' || r.name,
    'EXPLORATION',
    'SILVER',
    ('{"type": "region_species", "regionId": "' || r.id || '", "count": 50}')::jsonb,
    r.id
FROM regions r
WHERE NOT EXISTS (
    SELECT 1 FROM badges b WHERE b.region_id = r.id AND b.name = 'Champion of ' || r.name
);

-- Avian Lord of [Region] - spot 20 bird species in this region
INSERT INTO badges (id, name, description, category, tier, criteria, region_id)
SELECT
    gen_random_uuid(),
    'Avian Lord of ' || r.name,
    'Spot 20 different bird species in ' || r.name,
    'BIRDS',
    'GOLD',
    ('{"type": "region_category_species", "regionId": "' || r.id || '", "category": "BIRDS", "count": 20}')::jsonb,
    r.id
FROM regions r
WHERE NOT EXISTS (
    SELECT 1 FROM badges b WHERE b.region_id = r.id AND b.name = 'Avian Lord of ' || r.name
);

-- Plant Sage of [Region] - discover 30 plant species in this region
INSERT INTO badges (id, name, description, category, tier, criteria, region_id)
SELECT
    gen_random_uuid(),
    'Plant Sage of ' || r.name,
    'Discover 30 plant species in ' || r.name,
    'PLANTS',
    'SILVER',
    ('{"type": "region_category_species", "regionId": "' || r.id || '", "category": "PLANTS", "count": 30}')::jsonb,
    r.id
FROM regions r
WHERE NOT EXISTS (
    SELECT 1 FROM badges b WHERE b.region_id = r.id AND b.name = 'Plant Sage of ' || r.name
);

-- Fungi Master of [Region] - discover 15 mushroom species in this region
INSERT INTO badges (id, name, description, category, tier, criteria, region_id)
SELECT
    gen_random_uuid(),
    'Fungi Master of ' || r.name,
    'Discover 15 mushroom species in ' || r.name,
    'MUSHROOMS',
    'BRONZE',
    ('{"type": "region_category_species", "regionId": "' || r.id || '", "category": "MUSHROOMS", "count": 15}')::jsonb,
    r.id
FROM regions r
WHERE NOT EXISTS (
    SELECT 1 FROM badges b WHERE b.region_id = r.id AND b.name = 'Fungi Master of ' || r.name
);

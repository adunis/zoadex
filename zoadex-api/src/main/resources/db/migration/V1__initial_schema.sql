-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    active_region_id UUID,
    plan VARCHAR(20) DEFAULT 'FREE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Regions (from OSM administrative boundaries)
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    admin_level INTEGER,
    boundary GEOMETRY(MultiPolygon, 4326),
    species_count INTEGER DEFAULT 0,
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD CONSTRAINT fk_users_region FOREIGN KEY (active_region_id) REFERENCES regions(id);

-- Species categories
CREATE TYPE species_category AS ENUM (
    'BIRDS', 'MAMMALS', 'INSECTS', 'REPTILES', 'AMPHIBIANS',
    'FISH', 'MUSHROOMS', 'TREES', 'PLANTS'
);

-- Species
CREATE TABLE species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gbif_key BIGINT UNIQUE,
    scientific_name VARCHAR(255) NOT NULL,
    common_name VARCHAR(255),
    common_name_local VARCHAR(255),
    category species_category NOT NULL,
    taxonomy_class VARCHAR(100),
    taxonomy_order VARCHAR(100),
    taxonomy_family VARCHAR(100),
    iucn_status VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Species images
CREATE TABLE species_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_id UUID NOT NULL REFERENCES species(id),
    source VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    license VARCHAR(50),
    attribution TEXT,
    fetched_at TIMESTAMP DEFAULT NOW()
);

-- Species-Region mapping (which species are in which region)
CREATE TABLE region_species (
    region_id UUID NOT NULL REFERENCES regions(id),
    species_id UUID NOT NULL REFERENCES species(id),
    occurrence_count INTEGER DEFAULT 0,
    PRIMARY KEY (region_id, species_id)
);

-- Species occurrence data (for suggestions + heatmap)
CREATE TABLE species_occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_id UUID NOT NULL REFERENCES species(id),
    region_id UUID NOT NULL REFERENCES regions(id),
    location GEOMETRY(Point, 4326),
    month SMALLINT,
    time_bucket VARCHAR(20),
    occurrence_count INTEGER DEFAULT 0
);

CREATE INDEX idx_occurrences_species_region ON species_occurrences(species_id, region_id);
CREATE INDEX idx_occurrences_location ON species_occurrences USING GIST(location);
CREATE INDEX idx_occurrences_month ON species_occurrences(month);

-- Sightings (user discoveries — multiple per species allowed)
CREATE TABLE sightings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    species_id UUID NOT NULL REFERENCES species(id),
    sighted_at TIMESTAMP NOT NULL,
    location GEOMETRY(Point, 4326),
    location_name VARCHAR(255),
    notes TEXT,
    photo_url TEXT,
    is_first_discovery BOOLEAN DEFAULT FALSE,
    expedition_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sightings_user ON sightings(user_id);
CREATE INDEX idx_sightings_species ON sightings(species_id);
CREATE INDEX idx_sightings_location ON sightings USING GIST(location);
CREATE INDEX idx_sightings_expedition ON sightings(expedition_id);

-- Expeditions (grouping sightings from a single outing)
CREATE TABLE expeditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    route GEOMETRY(LineString, 4326),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE sightings ADD CONSTRAINT fk_sightings_expedition FOREIGN KEY (expedition_id) REFERENCES expeditions(id);

-- Badges
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    category VARCHAR(50) NOT NULL,
    tier VARCHAR(20),
    criteria JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User badges (unlocked)
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    badge_id UUID NOT NULL REFERENCES badges(id),
    unlocked_at TIMESTAMP DEFAULT NOW(),
    triggering_sighting_id UUID REFERENCES sightings(id),
    UNIQUE(user_id, badge_id)
);

-- Achievement progress tracking
CREATE TABLE achievement_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    badge_id UUID NOT NULL REFERENCES badges(id),
    current_progress INTEGER DEFAULT 0,
    target INTEGER NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    plan VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    payment_provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cosmetic purchases
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    item_type VARCHAR(50) NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    purchased_at TIMESTAMP DEFAULT NOW(),
    transaction_id VARCHAR(255)
);

-- User cosmetic equipment
CREATE TABLE user_cosmetics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    cosmetic_type VARCHAR(50) NOT NULL,
    cosmetic_id VARCHAR(100) NOT NULL,
    equipped BOOLEAN DEFAULT FALSE
);

-- Social follows
CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES users(id),
    followed_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, followed_id)
);

-- Privacy settings
CREATE TABLE user_privacy (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    show_sightings_on_map VARCHAR(20) DEFAULT 'APPROXIMATE',
    profile_visibility VARCHAR(20) DEFAULT 'PUBLIC',
    allow_follows VARCHAR(20) DEFAULT 'YES',
    show_in_leaderboards VARCHAR(20) DEFAULT 'YES'
);

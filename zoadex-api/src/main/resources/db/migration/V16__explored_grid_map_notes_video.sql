-- Explored grid cells (user paints areas they have explored)
CREATE TABLE explored_cells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    region_id UUID NOT NULL REFERENCES regions(id),
    cell_x INTEGER NOT NULL,
    cell_y INTEGER NOT NULL,
    zoom_level INTEGER NOT NULL DEFAULT 14,
    color VARCHAR(7) DEFAULT '#4CAF50',
    explored_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, region_id, cell_x, cell_y, zoom_level)
);

CREATE INDEX idx_explored_cells_user_region ON explored_cells(user_id, region_id);

-- Map notes (geo-pinned notes with optional media)
CREATE TABLE map_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    region_id UUID NOT NULL REFERENCES regions(id),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    title VARCHAR(255) NOT NULL,
    text TEXT,
    media_url TEXT,
    media_type VARCHAR(20),
    color VARCHAR(7) DEFAULT '#FF9800',
    icon VARCHAR(50) DEFAULT 'pin',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_map_notes_user_region ON map_notes(user_id, region_id);
CREATE INDEX idx_map_notes_location ON map_notes(latitude, longitude);

-- Add video support to sightings
ALTER TABLE sightings ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE sightings ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'photo';

-- Track which regions each user has unlocked
CREATE TABLE user_regions (
    user_id UUID NOT NULL REFERENCES users(id),
    region_id UUID NOT NULL REFERENCES regions(id),
    unlocked_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, region_id)
);

-- For existing users, add their active region to user_regions
INSERT INTO user_regions (user_id, region_id)
SELECT id, active_region_id FROM users WHERE active_region_id IS NOT NULL
ON CONFLICT DO NOTHING;

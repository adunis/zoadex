-- Social features: comments, confirmations, friendships, notifications

-- Sighting comments
CREATE TABLE sighting_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sighting_id UUID NOT NULL REFERENCES sightings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sighting_comments_sighting_id ON sighting_comments(sighting_id);
CREATE INDEX idx_sighting_comments_user_id ON sighting_comments(user_id);

-- Sighting confirmations (agree with species ID)
CREATE TABLE sighting_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sighting_id UUID NOT NULL REFERENCES sightings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(sighting_id, user_id)
);

CREATE INDEX idx_sighting_confirmations_sighting_id ON sighting_confirmations(sighting_id);

-- Friendships (bidirectional)
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id),
    addressee_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    reference_id UUID,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

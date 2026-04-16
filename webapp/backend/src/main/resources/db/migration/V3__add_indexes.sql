-- =========================
-- SPRING SESSION INDEXES
-- =========================

CREATE INDEX idx_session_expiry
    ON spring_session(expiry_time);

CREATE INDEX idx_session_user
    ON spring_session(principal_name);

-- =========================
-- RESET TOKENS INDEXES
-- =========================

CREATE INDEX idx_reset_token
    ON reset_tokens(reset_token);

CREATE INDEX idx_reset_user
    ON reset_tokens(user_id);

-- =========================
-- AUTHORITIES INDEXES
-- =========================

CREATE INDEX idx_authorities_user
    ON authorities(user_id);
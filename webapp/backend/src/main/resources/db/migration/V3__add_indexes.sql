CREATE INDEX idx_session_expiry ON spring_session(expiry_time);
CREATE INDEX idx_session_user ON spring_session(principal_name);
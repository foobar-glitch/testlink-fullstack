-- =========================
-- SPRING SESSION TABLE
-- =========================
CREATE TABLE spring_session (
    primary_id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    creation_time BIGINT,
    last_access_time BIGINT,
    max_inactive_interval INTEGER,
    expiry_time BIGINT,
    principal_name TEXT
);

-- =========================
-- SESSION ATTRIBUTES
-- =========================
CREATE TABLE spring_session_attributes (
   session_primary_id UUID NOT NULL,
   attribute_name TEXT NOT NULL,
   attribute_bytes BYTEA NOT NULL,

   PRIMARY KEY (session_primary_id, attribute_name),

   CONSTRAINT fk_session_attr
       FOREIGN KEY (session_primary_id)
           REFERENCES spring_session(primary_id)
           ON DELETE CASCADE
);
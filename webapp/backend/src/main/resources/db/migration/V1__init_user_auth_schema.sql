-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE users (
                       user_id BIGSERIAL PRIMARY KEY,
                       public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
                       username VARCHAR(50) NOT NULL,
                       email VARCHAR(255) NOT NULL,
                       password_hash TEXT NOT NULL,
                       enabled BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMPTZ DEFAULT NOW(),
                       updated_at TIMESTAMPTZ,

                       CONSTRAINT uq_users_public_uuid UNIQUE (public_uuid),
                       CONSTRAINT uq_users_username UNIQUE (username),
                       CONSTRAINT uq_users_email UNIQUE (email)
);

-- =========================
-- AUTHORITIES TABLE
-- =========================
CREATE TABLE authorities (
                             authority_id BIGSERIAL PRIMARY KEY,
                             public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
                             user_id BIGINT NOT NULL,
                             authority VARCHAR(50) NOT NULL,
                             created_at TIMESTAMPTZ DEFAULT NOW(),
                             updated_at TIMESTAMPTZ,

                             CONSTRAINT uq_authorities_public_uuid UNIQUE (public_uuid),

                             CONSTRAINT fk_authorities_user
                                 FOREIGN KEY (user_id)
                                     REFERENCES users(user_id)
                                     ON DELETE CASCADE,

                             CONSTRAINT uq_user_authority UNIQUE (user_id, authority)
);

-- =========================
-- RESET TOKENS TABLE
-- =========================
CREATE TABLE reset_tokens (
                              reset_id BIGSERIAL PRIMARY KEY,
                              public_uuid UUID DEFAULT gen_random_uuid() NOT NULL,
                              user_id BIGINT NOT NULL,
                              reset_token VARCHAR(255) NOT NULL UNIQUE,
                              created_at TIMESTAMPTZ DEFAULT NOW(),
                              expired_at TIMESTAMPTZ NOT NULL,

                              CONSTRAINT uq_reset_tokens_public_uuid UNIQUE (public_uuid),

                              CONSTRAINT fk_reset_user
                                  FOREIGN KEY (user_id)
                                      REFERENCES users(user_id)
                                      ON DELETE CASCADE
);

-- =========================
-- SPRING SESSION TABLES
-- =========================
CREATE TABLE spring_session (
                                primary_id CHAR(36) NOT NULL,
                                session_id CHAR(36) NOT NULL,
                                creation_time BIGINT NOT NULL,
                                last_access_time BIGINT NOT NULL,
                                max_inactive_interval INT NOT NULL,
                                expiry_time BIGINT NOT NULL,
                                principal_name VARCHAR(100),

                                CONSTRAINT spring_session_pk PRIMARY KEY (primary_id)
);

CREATE UNIQUE INDEX spring_session_ix1 ON spring_session(session_id);
CREATE INDEX spring_session_ix2 ON spring_session(expiry_time);
CREATE INDEX spring_session_ix3 ON spring_session(principal_name);

-- =========================
-- SPRING SESSION ATTRIBUTES
-- =========================
CREATE TABLE spring_session_attributes (
                                           session_primary_id CHAR(36) NOT NULL,
                                           attribute_name VARCHAR(200) NOT NULL,
                                           attribute_bytes BYTEA NOT NULL,

                                           CONSTRAINT spring_session_attributes_pk
                                               PRIMARY KEY (session_primary_id, attribute_name),

                                           CONSTRAINT spring_session_attributes_fk
                                               FOREIGN KEY (session_primary_id)
                                                   REFERENCES spring_session(primary_id)
                                                   ON DELETE CASCADE
);

CREATE INDEX spring_session_attributes_ix1
    ON spring_session_attributes(session_primary_id);

-- =========================
-- PERFORMANCE INDEXES (FINAL CLEAN SET)
-- =========================

-- AUTH PERFORMANCE
CREATE INDEX idx_authorities_user ON authorities(user_id);

-- RESET TOKEN PERFORMANCE
CREATE INDEX idx_reset_tokens_user ON reset_tokens(user_id);
CREATE INDEX idx_reset_tokens_expiry ON reset_tokens(expired_at);
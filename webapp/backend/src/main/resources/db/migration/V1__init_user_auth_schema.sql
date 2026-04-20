-- Enable pgcrypto if you are on an older version of Postgres (pre-13)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE users (
                       user_id BIGSERIAL PRIMARY KEY,
                       public_uuid UUID DEFAULT gen_random_uuid() NOT NULL, -- Publicly exposed
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
                             public_uuid UUID DEFAULT gen_random_uuid() NOT NULL, -- Publicly exposed
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
                              public_uuid UUID DEFAULT gen_random_uuid() NOT NULL, -- Publicly exposed
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
-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE users (
   user_id BIGSERIAL PRIMARY KEY,
   username VARCHAR(50) UNIQUE NOT NULL,
   email VARCHAR(255) UNIQUE NOT NULL,
   password_hash TEXT NOT NULL,
   enabled BOOLEAN DEFAULT TRUE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ
);

-- =========================
-- AUTHORITIES TABLE
-- =========================
CREATE TABLE authorities (
 authority_id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL,
 authority VARCHAR(50) NOT NULL,
 created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ,

 CONSTRAINT fk_authorities_user
     FOREIGN KEY (user_id)
         REFERENCES users(user_id)
         ON DELETE CASCADE
);

-- =========================
-- RESET TOKENS TABLE
-- =========================
CREATE TABLE reset_tokens (
  reset_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  reset_token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expired_at TIMESTAMPTZ NOT NULL,

  CONSTRAINT fk_reset_user
      FOREIGN KEY (user_id)
          REFERENCES users(user_id)
          ON DELETE CASCADE
);
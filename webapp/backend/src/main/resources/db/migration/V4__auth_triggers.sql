-- =========================
-- UPDATED_AT TRIGGER FUNCTION
-- =========================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$;

-- =========================
-- USERS TRIGGER
-- =========================

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- =========================
-- AUTHORITIES TRIGGER
-- =========================

DROP TRIGGER IF EXISTS trg_authorities_updated_at ON authorities;

CREATE TRIGGER trg_authorities_updated_at
    BEFORE UPDATE ON authorities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
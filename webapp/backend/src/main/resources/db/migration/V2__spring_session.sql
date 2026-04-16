CREATE TABLE spring_session (
    primary_id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    creation_time BIGINT,
    expiry_time BIGINT,
    principal_name TEXT
);

CREATE TABLE spring_session_attributes (
    session_primary_id UUID REFERENCES spring_session(primary_id),
    attribute_name TEXT,
    attribute_bytes BYTEA,
    PRIMARY KEY (session_primary_id, attribute_name)
);
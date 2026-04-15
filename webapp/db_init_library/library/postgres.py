import psycopg2
from psycopg2 import pool
from typing import Any
from dataclasses import dataclass
from psycopg2 import sql


@dataclass
class PostgresConfig:
    host: str
    port: int
    rootPassword: str
    userName: str
    userPassword: str
    dbName: str
    usersTable: str
    authorityTable: str
    resetTable: str
    registerTable: str

class PostgresConnection:
    def __init__(self, host: str, port: int, user: str, password: str, database: str):
        self.dbPool: pool.SimpleConnectionPool = pool.SimpleConnectionPool(
        1, 20,
        host=host,
        port=port,
        user=user,
        password=password,
        database=database
        )
    
    def getConn(self):
        return self.dbPool.getconn()
    
    def releaseConn(self, conn) -> None:
        self.dbPool.putconn(conn)
        
def init_db(config: PostgresConfig) -> PostgresConnection:
    USERS_TABLE = config.usersTable
    AUTHORITY_TABLE = config.authorityTable
    RESET_TABLE = config.resetTable
    REGISTER_TABLE = config.registerTable

    # -------------------------
    # Connect as admin (postgres)
    # -------------------------
    root_connection = psycopg2.connect(
        host=config.host,
        port=config.port,
        user="postgres",
        password=config.rootPassword,
        database="postgres"
    )
    root_connection.autocommit = True
    cursor = root_connection.cursor()

    # -------------------------
    # Create DB + user
    # -------------------------
    cursor.execute(f"CREATE DATABASE {config.dbName};")
    cursor.execute(f"CREATE USER {config.userName} WITH PASSWORD %s;", (config.userPassword,))
    cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {config.dbName} TO {config.userName};")

    cursor.close()
    root_connection.close()

    postgresConnection = PostgresConnection(config.host, config.port, config.userName, config.userPassword, config.dbName)

    # -------------------------
    # Connect as app user
    # -------------------------

    userConnection = postgresConnection.getConn()


    cursor = userConnection.cursor()

    # -------------------------
    # TABLES
    # -------------------------

    create_user_table = f"""
    CREATE TABLE IF NOT EXISTS {USERS_TABLE} (
        user_id BIGSERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """

    create_table_authorities = f"""
    CREATE TABLE IF NOT EXISTS {AUTHORITY_TABLE} (
        authority_id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        authority VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_authorities_user
            FOREIGN KEY (user_id)
            REFERENCES {USERS_TABLE}(user_id)
            ON DELETE CASCADE
    );
    """

    create_reset_table = f"""
    CREATE TABLE IF NOT EXISTS {RESET_TABLE} (
        reset_id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        reset_token VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expired_at TIMESTAMP NOT NULL,
        CONSTRAINT fk_reset_user
            FOREIGN KEY (user_id)
            REFERENCES {USERS_TABLE}(user_id)
            ON DELETE CASCADE
    );
    """

    create_session_table = """
    CREATE TABLE IF NOT EXISTS SPRING_SESSION (
        primary_id UUID PRIMARY KEY,
        session_id UUID NOT NULL,
        creation_time BIGINT NOT NULL,
        last_access_time BIGINT NOT NULL,
        max_inactive_interval BIGINT NOT NULL,
        expiry_time BIGINT NOT NULL,
        principal_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """

    create_session_attributes = """
    CREATE TABLE IF NOT EXISTS SPRING_SESSION_ATTRIBUTES (
        session_primary_id UUID NOT NULL,
        attribute_name VARCHAR(200) NOT NULL,
        attribute_bytes BYTEA NOT NULL,
        PRIMARY KEY (session_primary_id, attribute_name),
        CONSTRAINT fk_session
            FOREIGN KEY (session_primary_id)
            REFERENCES SPRING_SESSION(primary_id)
            ON DELETE CASCADE
    );
    """

    idx1 = """
    CREATE INDEX IF NOT EXISTS idx_spring_session_expiry
    ON SPRING_SESSION (expiry_time);
    """

    idx2 = """
    CREATE INDEX IF NOT EXISTS idx_spring_session_principal
    ON SPRING_SESSION (principal_name);
    """

    create_temp_user_table = """
    CREATE TABLE IF NOT EXISTS temp_users (
        temp_user_id BIGSERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """

    create_register_table = f"""
    CREATE TABLE IF NOT EXISTS {REGISTER_TABLE} (
        register_id BIGSERIAL PRIMARY KEY,
        temp_user_id BIGINT NOT NULL,
        register_token VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expired_at TIMESTAMP NOT NULL,
        CONSTRAINT fk_register_temp_user
            FOREIGN KEY (temp_user_id)
            REFERENCES temp_users(temp_user_id)
            ON DELETE CASCADE
    );
    """

    # -------------------------
    # EXECUTE
    # -------------------------
    cursor.execute(create_user_table)
    cursor.execute(create_table_authorities)
    cursor.execute(create_session_table)
    cursor.execute(create_session_attributes)
    cursor.execute(idx1)
    cursor.execute(idx2)
    cursor.execute(create_reset_table)
    cursor.execute(create_temp_user_table)
    cursor.execute(create_register_table)

    userConnection.commit()
    cursor.close()
    postgresConnection.releaseConn(userConnection)
    return postgresConnection
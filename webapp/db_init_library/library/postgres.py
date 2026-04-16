import psycopg2
from psycopg2 import pool, sql
from dataclasses import dataclass


# -------------------------
# CONFIG
# -------------------------
@dataclass
class PostgresConfig:
    host: str
    port: int
    root_password: str
    user_name: str
    user_password: str
    db_name: str
    users_table: str
    authority_table: str
    reset_table: str
    register_table: str


# -------------------------
# CONNECTION POOL
# -------------------------
class PostgresConnection:
    def __init__(self, host: str, port: int, user: str, password: str, database: str):
        self.pool = pool.SimpleConnectionPool(
            1, 20,
            host=host,
            port=port,
            user=user,
            password=password,
            database=database
        )

    def get_conn(self):
        return self.pool.getconn()

    def release_conn(self, conn):
        self.pool.putconn(conn)
    
    def close(self):
        """
        Closes all connections in the pool.
        This is the REAL 'shutdown' of the DB layer.
        """
        if self.pool:
            self.pool.closeall()


# -------------------------
# ADMIN: CREATE DB + USER
# -------------------------
def init_admin_db(config: PostgresConfig):
    conn = psycopg2.connect(
        host=config.host,
        port=config.port,
        user="postgres",
        password=config.root_password,
        database="postgres"
    )
    conn.autocommit = True

    try:
        cur = conn.cursor()

        cur.execute(
            "CREATE DATABASE {};".format(config.db_name)
        )

        cur.execute(
            "CREATE USER {} WITH PASSWORD %s;".format(config.user_name),
            (config.user_password,)
        )

        cur.execute(
            "GRANT ALL PRIVILEGES ON DATABASE {} TO {};".format(
                config.db_name, config.user_name
            )
        )

        cur.close()
    finally:
        conn.close()


# -------------------------
# CREATE TABLES (SAFE SQL)
# -------------------------
def create_tables(conn, config: PostgresConfig):
    cur = conn.cursor()

    users_table = sql.Identifier(config.users_table)
    authority_table = sql.Identifier(config.authority_table)
    reset_table = sql.Identifier(config.reset_table)
    register_table = sql.Identifier(config.register_table)

    cur.execute(
        sql.SQL("""
        CREATE TABLE IF NOT EXISTS {} (
            user_id BIGSERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            enabled BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """).format(users_table)
    )

    cur.execute(
        sql.SQL("""
        CREATE TABLE IF NOT EXISTS {} (
            authority_id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL,
            authority VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES {}(user_id) ON DELETE CASCADE
        );
        """).format(authority_table, users_table)
    )

    cur.execute(
        sql.SQL("""
        CREATE TABLE IF NOT EXISTS {} (
            reset_id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL,
            reset_token VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expired_at TIMESTAMP NOT NULL,
            FOREIGN KEY (user_id) REFERENCES {}(user_id) ON DELETE CASCADE
        );
        """).format(reset_table, users_table)
    )

    cur.execute("""
        CREATE TABLE IF NOT EXISTS SPRING_SESSION (
            primary_id UUID PRIMARY KEY,
            session_id UUID NOT NULL,
            creation_time BIGINT NOT NULL,
            last_access_time BIGINT NOT NULL,
            max_inactive_interval BIGINT NOT NULL,
            expiry_time BIGINT NOT NULL,
            principal_name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS SPRING_SESSION_ATTRIBUTES (
            session_primary_id UUID NOT NULL,
            attribute_name VARCHAR(200) NOT NULL,
            attribute_bytes BYTEA NOT NULL,
            PRIMARY KEY (session_primary_id, attribute_name),
            FOREIGN KEY (session_primary_id)
                REFERENCES SPRING_SESSION(primary_id)
                ON DELETE CASCADE
        );
    """)

    cur.execute(
        sql.SQL("""
        CREATE TABLE IF NOT EXISTS {} (
            temp_user_id BIGSERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """).format(sql.Identifier("temp_users"))
    )

    cur.execute(
        sql.SQL("""
        CREATE TABLE IF NOT EXISTS {} (
            register_id BIGSERIAL PRIMARY KEY,
            temp_user_id BIGINT NOT NULL,
            register_token VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expired_at TIMESTAMP NOT NULL,
            FOREIGN KEY (temp_user_id)
                REFERENCES temp_users(temp_user_id)
                ON DELETE CASCADE
        );
        """).format(register_table)
    )

    cur.close()


# -------------------------
# MAIN INIT FUNCTION
# -------------------------
def init_db(config: PostgresConfig) -> PostgresConnection:
    # 1. create DB + user
    init_admin_db(config)

    # 2. create connection pool for app user
    db = PostgresConnection(
        host=config.host,
        port=config.port,
        user=config.user_name,
        password=config.user_password,
        database=config.db_name
    )

    # 3. initialize schema
    conn = db.get_conn()
    try:
        create_tables(conn, config)
        conn.commit()
    finally:
        db.release_conn(conn)

    return db
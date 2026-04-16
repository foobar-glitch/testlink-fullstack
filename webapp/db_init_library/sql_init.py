from dotenv import load_dotenv
import os
from library.postgres import PostgresConfig, init_db

load_dotenv("../../.env")


def requireEnv(envName: str) -> str:
    envValue = os.getenv(envName)
    if envValue==None:
        raise ValueError
    return envValue

def give_postgres_env() -> PostgresConfig:
    SQL_HOST = requireEnv('POSTGRES_HOST')
    SQL_PORT = int(requireEnv('POSTGRES_PORT'), 10)
    ROOT_USER_PASSWORD = requireEnv('POSTGRES_ROOT_PASSWORD')

    USER_NAME = requireEnv('POSTGRES_USER')
    USER_PASSWORD = requireEnv('POSTGRES_USER_PASSWORD')
    

    DB_NAME = requireEnv('POSTGRES_DATABASE')
    USERS_TABLE = requireEnv('POSTGRES_USER_TABLE')
    AUTHORITY_TABLE = requireEnv('POSTGRES_AUTHORITY_TABLE')
    RESET_TABLE = requireEnv('POSTGRES_RESET_TABLE')
    REGISTER_TABLE = requireEnv('POSTGRES_REGISTER_TABLE')

    return PostgresConfig(SQL_HOST, SQL_PORT, ROOT_USER_PASSWORD, USER_NAME, USER_PASSWORD, DB_NAME, USERS_TABLE, 
            AUTHORITY_TABLE, RESET_TABLE, REGISTER_TABLE
            )


if __name__=="__main__":
    config = give_postgres_env()
    postgresConnection = init_db(config)

    postgresConnection.close()
    
    
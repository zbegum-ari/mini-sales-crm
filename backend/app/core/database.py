from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./crm_v2.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def run_startup_migrations():
    inspector = inspect(engine)

    if "companies" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("companies")}

    with engine.begin() as connection:
        if "company_size" not in columns:
            connection.execute(text("ALTER TABLE companies ADD COLUMN company_size VARCHAR"))

        if "status" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE companies "
                    "ADD COLUMN status VARCHAR NOT NULL DEFAULT 'Lead'"
                )
            )
        else:
            connection.execute(
                text("UPDATE companies SET status = 'Lead' WHERE status IS NULL OR status = ''")
            )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

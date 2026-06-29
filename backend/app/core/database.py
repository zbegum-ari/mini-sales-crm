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

    table_names = inspector.get_table_names()

    if "companies" not in table_names:
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

    if "organizations" not in table_names:
        return

    with engine.begin() as connection:
        organization_columns = {
            column["name"] for column in inspector.get_columns("organizations")
        }
        if "status" not in organization_columns:
            connection.execute(
                text(
                    "ALTER TABLE organizations "
                    "ADD COLUMN status VARCHAR NOT NULL DEFAULT 'active'"
                )
            )
        else:
            connection.execute(
                text(
                    "UPDATE organizations SET status = 'active' "
                    "WHERE status IS NULL OR status = ''"
                )
            )

        if "users" in table_names:
            user_columns = {column["name"] for column in inspector.get_columns("users")}
            if "status" not in user_columns:
                connection.execute(
                    text(
                        "ALTER TABLE users "
                        "ADD COLUMN status VARCHAR NOT NULL DEFAULT 'active'"
                    )
                )
            connection.execute(
                text(
                    "UPDATE users SET status = CASE "
                    "WHEN status IS NULL OR status = '' THEN "
                    "  CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END "
                    "ELSE status END"
                )
            )
            connection.execute(
                text(
                    "UPDATE users SET is_active = CASE "
                    "WHEN status = 'active' THEN 1 ELSE 0 END"
                )
            )

        demo_organization_id = (
            connection.execute(
                text(
                    "SELECT id FROM organizations "
                    "WHERE name = 'Demo Organization' "
                    "LIMIT 1"
                )
            ).scalar()
        )

        if demo_organization_id is None:
            connection.execute(
                text(
                    "INSERT INTO organizations (name, status, created_at, updated_at) "
                    "VALUES ('Demo Organization', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
                )
            )
            demo_organization_id = (
                connection.execute(
                    text(
                        "SELECT id FROM organizations "
                        "WHERE name = 'Demo Organization' "
                        "LIMIT 1"
                    )
                ).scalar()
            )

        migrations = {
            "companies": [
                text("ALTER TABLE companies ADD COLUMN organization_id INTEGER"),
                text(
                    "UPDATE companies SET organization_id = :demo_id "
                    "WHERE organization_id IS NULL"
                ),
            ],
            "contacts": [
                text("ALTER TABLE contacts ADD COLUMN organization_id INTEGER"),
                text(
                    "UPDATE contacts "
                    "SET organization_id = ("
                    "  SELECT companies.organization_id "
                    "  FROM companies "
                    "  WHERE companies.id = contacts.company_id"
                    ") "
                    "WHERE organization_id IS NULL"
                ),
                text(
                    "UPDATE contacts SET organization_id = :demo_id "
                    "WHERE organization_id IS NULL"
                ),
            ],
            "deals": [
                text("ALTER TABLE deals ADD COLUMN organization_id INTEGER"),
                text(
                    "UPDATE deals "
                    "SET organization_id = ("
                    "  SELECT companies.organization_id "
                    "  FROM companies "
                    "  WHERE companies.id = deals.company_id"
                    ") "
                    "WHERE organization_id IS NULL"
                ),
                text(
                    "UPDATE deals SET organization_id = :demo_id "
                    "WHERE organization_id IS NULL"
                ),
            ],
            "activities": [
                text("ALTER TABLE activities ADD COLUMN organization_id INTEGER"),
                text(
                    "UPDATE activities "
                    "SET organization_id = ("
                    "  SELECT companies.organization_id "
                    "  FROM companies "
                    "  WHERE companies.id = activities.company_id"
                    ") "
                    "WHERE organization_id IS NULL"
                ),
                text(
                    "UPDATE activities SET organization_id = :demo_id "
                    "WHERE organization_id IS NULL"
                ),
            ],
            "tasks": [
                text("ALTER TABLE tasks ADD COLUMN organization_id INTEGER"),
                text(
                    "UPDATE tasks "
                    "SET organization_id = ("
                    "  SELECT companies.organization_id "
                    "  FROM companies "
                    "  WHERE companies.id = tasks.company_id"
                    ") "
                    "WHERE organization_id IS NULL"
                ),
                text(
                    "UPDATE tasks SET organization_id = :demo_id "
                    "WHERE organization_id IS NULL"
                ),
            ],
        }

        for table_name, statements in migrations.items():
            if table_name not in table_names:
                continue

            table_columns = {
                column["name"] for column in inspector.get_columns(table_name)
            }

            if "organization_id" in table_columns:
                connection.execute(
                    text(
                        f"UPDATE {table_name} SET organization_id = :demo_id "
                        "WHERE organization_id IS NULL"
                    ),
                    {"demo_id": demo_organization_id},
                )
                continue

            for statement in statements:
                connection.execute(statement, {"demo_id": demo_organization_id})


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

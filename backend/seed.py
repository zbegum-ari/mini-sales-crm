from datetime import date, timedelta

import app.models  # noqa: F401
from app.core.database import Base, SessionLocal, engine, run_startup_migrations
from app.models.activity import Activity
from app.models.company import Company
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.task import Task


def get_or_create_company(db, company_data):
    company = db.query(Company).filter(Company.name == company_data["name"]).first()
    if company:
        return company

    company = Company(**company_data)
    db.add(company)
    db.flush()
    return company


def get_or_create_contact(db, contact_data):
    contact = db.query(Contact).filter(Contact.email == contact_data["email"]).first()
    if contact:
        return contact

    contact = Contact(**contact_data)
    db.add(contact)
    db.flush()
    return contact


def get_or_create_deal(db, deal_data):
    deal = (
        db.query(Deal)
        .filter(Deal.company_id == deal_data["company_id"], Deal.title == deal_data["title"])
        .first()
    )
    if deal:
        return deal

    deal = Deal(**deal_data)
    db.add(deal)
    db.flush()
    return deal


def get_or_create_activity(db, activity_data):
    activity = (
        db.query(Activity)
        .filter(
            Activity.company_id == activity_data["company_id"],
            Activity.deal_id == activity_data["deal_id"],
            Activity.activity_type == activity_data["activity_type"],
            Activity.note == activity_data["note"],
        )
        .first()
    )
    if activity:
        return activity

    activity = Activity(**activity_data)
    db.add(activity)
    db.flush()
    return activity


def get_or_create_task(db, task_data):
    task = (
        db.query(Task)
        .filter(Task.company_id == task_data["company_id"], Task.title == task_data["title"])
        .first()
    )
    if task:
        return task

    task = Task(**task_data)
    db.add(task)
    db.flush()
    return task


def seed():
    Base.metadata.create_all(bind=engine)
    run_startup_migrations()

    today = date.today()
    db = SessionLocal()

    try:
        companies = {
            "BeeEdu": get_or_create_company(
                db,
                {
                    "name": "BeeEdu",
                    "industry": "Education Technology",
                    "company_size": "11-50",
                    "status": "Active",
                    "website": "https://www.beeedu.example",
                    "phone": "02125550101",
                    "email": "hello@beeedu.example",
                    "notes": "Learning-project sample account for CRM demos.",
                },
            ),
            "Northwind Retail": get_or_create_company(
                db,
                {
                    "name": "Northwind Retail",
                    "industry": "Retail",
                    "company_size": "51-200",
                    "status": "Lead",
                    "website": "https://www.northwind.example",
                    "phone": "02125550102",
                    "email": "sales@northwind.example",
                    "notes": "Interested in improving store operations reporting.",
                },
            ),
            "Atlas Labs": get_or_create_company(
                db,
                {
                    "name": "Atlas Labs",
                    "industry": "Healthcare",
                    "company_size": "201-500",
                    "status": "Customer",
                    "website": "https://www.atlaslabs.example",
                    "phone": "02125550103",
                    "email": "team@atlaslabs.example",
                    "notes": "Existing customer with expansion potential.",
                },
            ),
        }

        get_or_create_contact(
            db,
            {
                "company_id": companies["BeeEdu"].id,
                "first_name": "Aylin",
                "last_name": "Demir",
                "email": "aylin.demir@beeedu.example",
                "phone": "05551234567",
                "job_title": "Operations Manager",
                "notes": "Primary decision maker for the evaluation process.",
            },
        )
        get_or_create_contact(
            db,
            {
                "company_id": companies["Northwind Retail"].id,
                "first_name": "Kerem",
                "last_name": "Yildiz",
                "email": "kerem.yildiz@northwind.example",
                "phone": "05552345678",
                "job_title": "Regional Director",
                "notes": "Requested a follow-up after the proposal review.",
            },
        )
        get_or_create_contact(
            db,
            {
                "company_id": companies["Atlas Labs"].id,
                "first_name": "Selin",
                "last_name": "Kaya",
                "email": "selin.kaya@atlaslabs.example",
                "phone": "05553456789",
                "job_title": "Customer Success Lead",
                "notes": "Handles post-sale coordination and renewals.",
            },
        )

        deals = {
            "BeeEdu - Helpdesk rollout": get_or_create_deal(
                db,
                {
                    "company_id": companies["BeeEdu"].id,
                    "title": "Helpdesk rollout",
                    "value": 12500,
                    "pipeline_stage": "Proposal",
                    "expected_close_date": today + timedelta(days=21),
                    "notes": "Proposal shared. Waiting for internal approval.",
                },
            ),
            "Northwind Retail - Analytics package": get_or_create_deal(
                db,
                {
                    "company_id": companies["Northwind Retail"].id,
                    "title": "Analytics package",
                    "value": 22000,
                    "pipeline_stage": "Negotiation",
                    "expected_close_date": today + timedelta(days=14),
                    "notes": "Pricing and onboarding timeline under discussion.",
                },
            ),
            "Atlas Labs - Renewal expansion": get_or_create_deal(
                db,
                {
                    "company_id": companies["Atlas Labs"].id,
                    "title": "Renewal expansion",
                    "value": 18000,
                    "pipeline_stage": "Won",
                    "expected_close_date": today - timedelta(days=5),
                    "notes": "Upsell package confirmed and signed.",
                },
            ),
            "BeeEdu - Legacy migration": get_or_create_deal(
                db,
                {
                    "company_id": companies["BeeEdu"].id,
                    "title": "Legacy migration",
                    "value": 9000,
                    "pipeline_stage": "Lost",
                    "expected_close_date": today - timedelta(days=20),
                    "notes": "Opportunity closed after budget was redirected.",
                },
            ),
        }

        get_or_create_activity(
            db,
            {
                "company_id": companies["BeeEdu"].id,
                "deal_id": deals["BeeEdu - Helpdesk rollout"].id,
                "activity_type": "Meeting",
                "note": "Reviewed the rollout scope and agreed on next steps.",
                "activity_date": today - timedelta(days=2),
            },
        )
        get_or_create_activity(
            db,
            {
                "company_id": companies["Northwind Retail"].id,
                "deal_id": deals["Northwind Retail - Analytics package"].id,
                "activity_type": "Call",
                "note": "Discussed pricing options and implementation timeline.",
                "activity_date": today - timedelta(days=1),
            },
        )
        get_or_create_activity(
            db,
            {
                "company_id": companies["Atlas Labs"].id,
                "deal_id": None,
                "activity_type": "Note",
                "note": "Customer success team asked for a quarterly check-in plan.",
                "activity_date": today,
            },
        )

        get_or_create_task(
            db,
            {
                "company_id": companies["BeeEdu"].id,
                "deal_id": deals["BeeEdu - Helpdesk rollout"].id,
                "title": "Send revised proposal",
                "description": "Update pricing details and share the latest proposal PDF.",
                "due_date": today + timedelta(days=3),
                "status": "Open",
            },
        )
        get_or_create_task(
            db,
            {
                "company_id": companies["Northwind Retail"].id,
                "deal_id": deals["Northwind Retail - Analytics package"].id,
                "title": "Follow up on contract review",
                "description": "Check if legal team has completed the review.",
                "due_date": today - timedelta(days=2),
                "status": "Open",
            },
        )
        get_or_create_task(
            db,
            {
                "company_id": companies["Atlas Labs"].id,
                "deal_id": deals["Atlas Labs - Renewal expansion"].id,
                "title": "Schedule onboarding kickoff",
                "description": "Set the onboarding date with the customer success team.",
                "due_date": today + timedelta(days=5),
                "status": "Completed",
            },
        )

        db.commit()
        print("Seed data is ready.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()

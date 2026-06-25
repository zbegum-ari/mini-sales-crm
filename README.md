# Mini Sales CRM v1

Mini Sales CRM v1 is a beginner-friendly local full-stack CRM learning project. It uses a React frontend and a FastAPI backend to manage core sales data such as companies, contacts, deals, activities, tasks, and a simple dashboard summary.

## Tech Stack

- React
- Vite
- Tailwind CSS
- FastAPI
- SQLite
- SQLAlchemy

## Features Implemented

- Companies CRUD
- Contacts CRUD
- Deals CRUD
- Activities CRUD
- Tasks CRUD
- Dashboard summary metrics
- Search and filtering
- Custom inline validation UI

## Project Structure

```text
mini-sales-crm/
├── README.md
├── backend/
│   ├── requirements.txt
│   ├── seed.py
│   └── app/
│       ├── main.py
│       ├── core/
│       │   └── database.py
│       ├── models/
│       │   ├── activity.py
│       │   ├── company.py
│       │   ├── contact.py
│       │   ├── deal.py
│       │   └── task.py
│       ├── schemas/
│       │   ├── activity.py
│       │   ├── company.py
│       │   ├── contact.py
│       │   ├── deal.py
│       │   └── task.py
│       └── api/
│           └── routes/
│               ├── activities.py
│               ├── companies.py
│               ├── contacts.py
│               ├── dashboard.py
│               ├── deals.py
│               ├── health.py
│               └── tasks.py
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── services/
        │   └── api.js
        └── components/
            ├── ActivityForm.jsx
            ├── ActivityList.jsx
            ├── CompanyForm.jsx
            ├── CompanyList.jsx
            ├── ContactForm.jsx
            ├── ContactList.jsx
            ├── Dashboard.jsx
            ├── DealForm.jsx
            ├── DealList.jsx
            ├── TaskForm.jsx
            └── TaskList.jsx
```

## Backend Setup for macOS

```bash
cd mini-sales-crm
python3 -m venv .venv
source .venv/bin/activate
cd backend
pip install -r requirements.txt
```

## Frontend Setup for macOS

```bash
cd mini-sales-crm/frontend
npm install
```

## How To Run The Backend

```bash
cd mini-sales-crm/backend
source ../.venv/bin/activate
uvicorn app.main:app --reload
```

The backend runs on `http://localhost:8000`.

## How To Run The Frontend

```bash
cd mini-sales-crm/frontend
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Local URLs

- Frontend: [http://localhost:5173](http://localhost:5173/)
- Backend health: [http://localhost:8000/health](http://localhost:8000/health)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Seed Sample Data

If you want a quick local demo dataset:

```bash
cd mini-sales-crm/backend
source ../.venv/bin/activate
python seed.py
```

The seed script adds sample companies, contacts, deals, activities, and tasks. It is written to avoid duplicating the same sample records when run multiple times.

## Manual Testing Guide

1. Start the backend.
2. Start the frontend.
3. Confirm the header shows the backend as connected.
4. Open the `Companies` tab and create, edit, search, filter, and delete companies.
5. Open the `Contacts` tab and create, search, filter, edit, and delete contacts linked to companies.
6. Open the `Deals` tab and create, filter by pipeline stage, edit, and delete deals.
7. Open the `Activities` tab and add timeline activities linked to a company or related deal.
8. Open the `Tasks` tab and create tasks, filter by status, show overdue tasks, complete tasks, and delete tasks.
9. Open the `Dashboard` tab and click `Refresh` to verify summary metrics update.
10. Open `http://localhost:8000/docs` to review the generated API documentation.

## Search And Filtering

- Companies: search by company name and filter by status
- Contacts: search by first name, last name, or email, and filter by company
- Deals: filter by pipeline stage
- Activities: filter by company and activity type
- Tasks: filter by company, filter by status, and show overdue tasks

## Validation Notes

- Required fields are marked with `*`
- Forms use custom inline validation
- Browser-native validation popups are disabled with `noValidate`
- Invalid fields show a red border and inline error message

## Intentionally Out Of Scope

- Authentication
- Multi-user support
- Deployment
- Docker
- Email/calendar integration
- File uploads
- Advanced reporting

## Learning Notes

- Frontend and backend communication with `fetch`
- REST API design with FastAPI routes
- SQLite persistence for local development
- SQLAlchemy relationships between CRM entities
- Using Codex carefully to iterate in small, testable milestones

## Screenshots

Suggested screenshots for final review:

- Dashboard
- Companies
- Contacts
- Deals
- Activities
- Tasks
- Validation example
- API docs at [http://localhost:8000/docs](http://localhost:8000/docs)

If screenshots are added later, place them in a `screenshots/` folder and reference them from this section.

## Acceptance Checklist

- [x] Frontend starts locally
- [x] Backend starts locally
- [x] `/health` works
- [x] Companies can be created, viewed, edited, and deleted
- [x] Contacts can be created, viewed, edited, and deleted
- [x] Deals can be created, viewed, edited, and deleted
- [x] Activities can be added to companies and deals
- [x] Tasks can be created and completed
- [x] Dashboard displays summary data
- [x] Search and filters work
- [x] Code is organized and understandable
- [x] README includes setup instructions

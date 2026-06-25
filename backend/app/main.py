from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models
from app.api.routes.activities import router as activities_router
from app.api.routes.companies import router as companies_router
from app.api.routes.contacts import router as contacts_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.deals import router as deals_router
from app.api.routes.health import router as health_router
from app.api.routes.tasks import router as tasks_router
from app.core.database import Base, engine, run_startup_migrations


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_startup_migrations()
    yield


app = FastAPI(title="Mini Sales CRM API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(companies_router)
app.include_router(contacts_router)
app.include_router(deals_router)
app.include_router(activities_router)
app.include_router(tasks_router)
app.include_router(dashboard_router)

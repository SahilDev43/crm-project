from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.db.health import check_database

configure_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    database_ok = await check_database()

    if database_ok:
        print("✅ Database Connected")
    else:
        print("❌ Database Connection Failed")

    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.include_router(
    api_router,
    prefix=settings.API_V1_STR,
)

@app.get("/")
async def root():
    return {
        "message": "CRM API Running"
    }

@app.get("/health")
async def health():
    return {
        "application": "healthy",
        "database": await check_database(),
    }
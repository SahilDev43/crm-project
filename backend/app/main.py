from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

import app.db.models
from app.api import api_router
from app.common.exceptions import AppException
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


# Create FastAPI application ONLY ONCE
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)


# Serve uploaded files
app.mount(
    "/storage",
    StaticFiles(directory="storage"),
    name="storage",
)


# Register API routes
app.include_router(
    api_router,
    prefix=settings.API_V1_STR,
)


# Global application exception handler
@app.exception_handler(AppException)
async def app_exception_handler(
    request: Request,
    exc: AppException,
) -> JSONResponse:

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail
        },
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
from fastapi import FastAPI

from app.api import api_router
from app.core.config import settings
from app.core.logging import configure_logging


configure_logging()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
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
        "status": "healthy"
    }
from sqlalchemy import text

from app.db.session import AsyncSessionFactory

async def check_database() -> bool:
    """Return True if the database connection succeeds."""

    try:
        async with AsyncSessionFactory() as session:
            await session.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
from sqlalchemy.ext.asyncio import AsyncSession

class UnitOfWork:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            await self.db.rollback()
        else:
            await self.db.commit()

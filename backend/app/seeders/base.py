from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession

class BaseSeeder(ABC):
    """Base class for all database seeder."""

    @abstractmethod
    async def run(self, db: AsyncSession) -> None:
        """
        Execute the seeder.
        """

        pass
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.payroll.repository import PayrollRepository


def get_payroll_repository(
    db: AsyncSession = Depends(get_db),
) -> PayrollRepository:

    return PayrollRepository(db)
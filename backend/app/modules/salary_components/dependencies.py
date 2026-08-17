from fastapi import Depends

from app.db.session import get_db
from app.modules.salary_components.repository import (
    SalaryComponentRepository,
)
from app.modules.salary_components.service import (
    SalaryComponentService,
)


def get_salary_component_service(
    db=Depends(get_db),
) -> SalaryComponentService:
    repository = SalaryComponentRepository(db)

    return SalaryComponentService(repository)
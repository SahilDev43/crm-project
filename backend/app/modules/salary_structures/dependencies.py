from fastapi import Depends

from app.db.session import get_db
from app.modules.salary_structures.repository import (
    SalaryStructureRepository,
)
from app.modules.salary_structures.service import (
    SalaryStructureService,
)


def get_salary_structure_service(
    db=Depends(get_db),
) -> SalaryStructureService:
    repository = SalaryStructureRepository(db)

    return SalaryStructureService(repository)

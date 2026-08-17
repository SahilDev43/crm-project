from fastapi import Depends

from app.db.session import get_db
from app.modules.employee_salaries.repository import (
    EmployeeSalaryRepository,
)
from app.modules.employee_salaries.service import (
    EmployeeSalaryService,
)


def get_employee_salary_service(
    db=Depends(get_db),
) -> EmployeeSalaryService:

    repository = EmployeeSalaryRepository(db)

    return EmployeeSalaryService(repository)
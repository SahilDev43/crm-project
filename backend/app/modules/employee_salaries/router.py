from fastapi import APIRouter, Depends, Query, status

from app.core.jwt import get_current_user
from app.modules.permissions.dependencies import (
    require_permission,
)

from app.modules.employee_salaries.dependencies import (
    get_employee_salary_service,
)
from app.modules.employee_salaries.schema import (
    EmployeeSalaryCreate,
    EmployeeSalaryUpdate,
    EmployeeSalaryResponse,
    EmployeeSalaryListResponse,
)
from app.modules.employee_salaries.service import (
    EmployeeSalaryService,
)


router = APIRouter(
    prefix="/employee-salaries",
    tags=["Employee Salaries"],
)

@router.post(
    "",
    response_model=EmployeeSalaryResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(
            require_permission(
                "employee_salaries.create"
            )
        )
    ],
)
async def create_employee_salary(
    data: EmployeeSalaryCreate,
    service: EmployeeSalaryService = Depends(
        get_employee_salary_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.create(
        data=data,
        company_id=current_user.company_id,
    )

@router.get(
    "",
    response_model=EmployeeSalaryListResponse,
    dependencies=[
        Depends(
            require_permission(
                "employee_salaries.view"
            )
        )
    ],
)
async def get_employee_salaries(
    user_id: int | None = Query(
        default=None,
        ge=1,
    ),
    status: int | None = Query(
        default=None,
        ge=1,
        le=2,
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    service: EmployeeSalaryService = Depends(
        get_employee_salary_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.get_all(
        company_id=current_user.company_id,
        user_id=user_id,
        status=status,
        page=page,
        page_size=page_size,
    )

@router.get(
    "/{salary_id}",
    response_model=EmployeeSalaryResponse,
    dependencies=[
        Depends(
            require_permission(
                "employee_salaries.view"
            )
        )
    ],
)
async def get_employee_salary(
    salary_id: int,
    service: EmployeeSalaryService = Depends(
        get_employee_salary_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.get_by_id(
        salary_id=salary_id,
        company_id=current_user.company_id,
    )

@router.get(
    "/user/{user_id}",
    response_model=EmployeeSalaryListResponse,
    dependencies=[
        Depends(
            require_permission(
                "employee_salaries.view"
            )
        )
    ],
)
async def get_employee_salary_history(
    user_id: int,
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    service: EmployeeSalaryService = Depends(
        get_employee_salary_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.get_by_user(
        user_id=user_id,
        company_id=current_user.company_id,
        page=page,
        page_size=page_size,
    )

@router.patch(
    "/{salary_id}",
    response_model=EmployeeSalaryResponse,
    dependencies=[
        Depends(
            require_permission(
                "employee_salaries.update"
            )
        )
    ],
)
async def update_employee_salary(
    salary_id: int,
    data: EmployeeSalaryUpdate,
    service: EmployeeSalaryService = Depends(
        get_employee_salary_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.update(
        salary_id=salary_id,
        data=data,
        company_id=current_user.company_id,
    )

@router.delete(
    "/{salary_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(
            require_permission(
                "employee_salaries.delete"
            )
        )
    ],
)
async def delete_employee_salary(
    salary_id: int,
    service: EmployeeSalaryService = Depends(
        get_employee_salary_service
    ),
    current_user=Depends(get_current_user),
):
    await service.delete(
        salary_id=salary_id,
        company_id=current_user.company_id,
    )
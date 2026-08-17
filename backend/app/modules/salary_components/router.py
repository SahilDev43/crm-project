from fastapi import APIRouter, Depends, Query, status

from app.core.jwt import get_current_user
from app.modules.permissions.dependencies import require_permission

from app.modules.salary_components.dependencies import (
    get_salary_component_service,
)
from app.modules.salary_components.schema import (
    SalaryComponentCreate,
    SalaryComponentUpdate,
    SalaryComponentResponse,
    SalaryComponentListResponse,
)
from app.modules.salary_components.service import (
    SalaryComponentService,
)


router = APIRouter(
    prefix="/salary-components",
    tags=["Salary Components"],
)

@router.post(
    "",
    response_model=SalaryComponentResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(
            require_permission(
                "salary_components.create"
            )
        )
    ],
)
async def create_salary_component(
    data: SalaryComponentCreate,
    service: SalaryComponentService = Depends(
        get_salary_component_service
    ),
):
    return await service.create(data)

@router.get(
    "",
    response_model=SalaryComponentListResponse,
    dependencies=[
        Depends(
            require_permission(
                "salary_components.view"
            )
        )
    ],
)
async def get_salary_components(
    search: str | None = Query(
        default=None,
        min_length=1,
    ),
    component_type: int | None = Query(
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
    service: SalaryComponentService = Depends(
        get_salary_component_service
    ),
):
    return await service.get_all(
        search=search,
        component_type=component_type,
        page=page,
        page_size=page_size,
    )

@router.get(
    "/{component_id}",
    response_model=SalaryComponentResponse,
    dependencies=[
        Depends(
            require_permission(
                "salary_components.view"
            )
        )
    ],
)
async def get_salary_component(
    component_id: int,
    service: SalaryComponentService = Depends(
        get_salary_component_service
    ),
):
    return await service.get_by_id(
        component_id
    )

@router.patch(
    "/{component_id}",
    response_model=SalaryComponentResponse,
    dependencies=[
        Depends(
            require_permission(
                "salary_components.update"
            )
        )
    ],
)
async def update_salary_component(
    component_id: int,
    data: SalaryComponentUpdate,
    service: SalaryComponentService = Depends(
        get_salary_component_service
    ),
):
    return await service.update(
        component_id=component_id,
        data=data,
    )

@router.delete(
    "/{component_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(
            require_permission(
                "salary_components.delete"
            )
        )
    ],
)
async def delete_salary_component(
    component_id: int,
    service: SalaryComponentService = Depends(
        get_salary_component_service
    ),
):
    await service.delete(component_id)
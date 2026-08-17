from fastapi import APIRouter, Depends, Query, status

from app.core.jwt import get_current_user
from app.modules.permissions.dependencies import require_permission

from app.modules.salary_structures.dependencies import (
    get_salary_structure_service,
)
from app.modules.salary_structures.schema import (
    SalaryStructureCreate,
    SalaryStructureUpdate,
    SalaryStructureResponse,
    SalaryStructureListResponse,
    SalaryStructureComponentCreate,
    SalaryStructureComponentResponse,
)
from app.modules.salary_structures.service import (
    SalaryStructureService,
)


router = APIRouter(
    prefix="/salary-structures",
    tags=["Salary Structures"],
)

@router.post(
    "",
    response_model=SalaryStructureResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(
            require_permission(
                "salary_structures.create"
            )
        )
    ],
)
async def create_salary_structure(
    data: SalaryStructureCreate,
    service: SalaryStructureService = Depends(
        get_salary_structure_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.create(
        data=data,
        company_id=current_user.company_id,
    )

@router.get(
    "",
    response_model=SalaryStructureListResponse,
    dependencies=[
        Depends(
            require_permission(
                "salary_structures.view"
            )
        )
    ],
)
async def get_salary_structures(
    search: str | None = Query(
        default=None,
        min_length=1,
    ),
    is_active: bool | None = None,
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    service: SalaryStructureService = Depends(
        get_salary_structure_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.get_all(
        company_id=current_user.company_id,
        search=search,
        is_active=is_active,
        page=page,
        page_size=page_size,
    )

@router.get(
    "/{structure_id}",
    response_model=SalaryStructureResponse,
    dependencies=[
        Depends(
            require_permission(
                "salary_structures.view"
            )
        )
    ],
)
async def get_salary_structure(
    structure_id: int,
    service: SalaryStructureService = Depends(
        get_salary_structure_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.get_by_id(
        structure_id=structure_id,
        company_id=current_user.company_id,
    )

@router.patch(
    "/{structure_id}",
    response_model=SalaryStructureResponse,
    dependencies=[
        Depends(
            require_permission(
                "salary_structures.update"
            )
        )
    ],
)
async def update_salary_structure(
    structure_id: int,
    data: SalaryStructureUpdate,
    service: SalaryStructureService = Depends(
        get_salary_structure_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.update(
        structure_id=structure_id,
        data=data,
        company_id=current_user.company_id,
    )

@router.delete(
    "/{structure_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(
            require_permission(
                "salary_structures.delete"
            )
        )
    ],
)
async def delete_salary_structure(
    structure_id: int,
    service: SalaryStructureService = Depends(
        get_salary_structure_service
    ),
    current_user=Depends(get_current_user),
):
    await service.delete(
        structure_id=structure_id,
        company_id=current_user.company_id,
    )

@router.get(
    "/{structure_id}/components",
    response_model=list[SalaryStructureComponentResponse],
    dependencies=[
        Depends(
            require_permission(
                "salary_structures.view"
            )
        )
    ],
)
async def get_salary_structure_components(
    structure_id: int,
    service: SalaryStructureService = Depends(
        get_salary_structure_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.get_components(
        structure_id=structure_id,
        company_id=current_user.company_id,
    )

@router.post(
    "/{structure_id}/components",
    response_model=SalaryStructureComponentResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(
            require_permission(
                "salary_structures.update"
            )
        )
    ],
)
async def add_salary_structure_component(
    structure_id: int,
    data: SalaryStructureComponentCreate,
    service: SalaryStructureService = Depends(
        get_salary_structure_service
    ),
    current_user=Depends(get_current_user),
):
    return await service.add_component(
        structure_id=structure_id,
        data=data,
        company_id=current_user.company_id,
    )

@router.delete(
    "/{structure_id}/components/{component_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(
            require_permission(
                "salary_structures.update"
            )
        )
    ],
)
async def remove_salary_structure_component(
    structure_id: int,
    component_id: int,
    service: SalaryStructureService = Depends(
        get_salary_structure_service
    ),
    current_user=Depends(get_current_user),
):
    await service.remove_component(
        structure_id=structure_id,
        component_id=component_id,
        company_id=current_user.company_id,
    )
from fastapi import APIRouter
from app.modules.users.router import router as users_router
from app.modules.roles.router import router as roles_router
from app.modules.auth.router import router as auth_router
from app.modules.role_permissions.router import (
    router as role_permission_router,
)
from app.modules.permissions.router import (
    router as permissions_router,
)
from app.modules.companies.router import router as companies_router
from app.modules.leads.router import router as leads_router
from app.modules.leads.public_router import (
    router as public_leads_router,
)
from app.modules.deals.router import router as deals_router
from app.modules.teams.router import router as teams_router
from app.modules.attendance.router import router as attendance_router
from app.modules.salary_components.router import router as salary_component_router
from app.modules.salary_structures.router import (
    router as salary_structure_router,
)
from app.modules.employee_salaries.router import (
    router as employee_salary_router,
)
from app.modules.payroll.router import router as payroll_router
from app.modules.invoices.router import router as invoices_router
from app.modules.reports.router import router as reports_router

api_router = APIRouter()

api_router.include_router(users_router)
api_router.include_router(roles_router)
api_router.include_router(role_permission_router)
api_router.include_router(auth_router)
api_router.include_router(permissions_router)
api_router.include_router(companies_router)
api_router.include_router(leads_router)
api_router.include_router(public_leads_router)
api_router.include_router(deals_router)
api_router.include_router(teams_router)
api_router.include_router(attendance_router)
api_router.include_router(salary_component_router)
api_router.include_router(salary_structure_router)
api_router.include_router(employee_salary_router)
api_router.include_router(payroll_router)
api_router.include_router(invoices_router)
api_router.include_router(reports_router)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.permissions.model import Permission
from app.seeders.base import BaseSeeder

class PermissionSeeder(BaseSeeder):
    """Seeder for default permissions."""

    DEFAULT_PERMISSIONS = [
        #Users
        {
            "name": "users.view",
            "description": "View users"
        },
        {
            "name": "users.create",
            "description": "Create users"
        },
        {
            "name": "users.update",
            "description": "Update users"
        },
        {
            "name": "users.delete",
            "description": "Delete users"
        },

        #Roles
        {
            "name": "roles.view",
            "description": "View Roles"
        },
        {
            "name": "roles.create",
            "description": "Create roles"
        },
        {
            "name": "roles.update",
            "description": "Update roles"
        },
        {
            "name": "roles.delete",
            "description": "Delete roles"
        },

        #Permissions
        {
            "name": "permissions.view",
            "description": "View permissions"
        },
        {
            "name": "permissions.assign",
            "description": "Assign permissions"
        },
        {
            "name": "permissions.create",
            "description": "Create permissions"
        },
        {
            "name": "permissions.update",
            "description": "Update permissions"
        },
        {
            "name": "permissions.delete",
            "description": "Delete permissions"
        },

        #Payroll
        {
            "name": "payroll.view",
            "description": "View payrolls"
        },
        {
            "name": "payroll.process",
            "description": "Process payroll"
        },
        {
            "name": "payroll.update",
            "description": "Update payroll"
        },
        {
            "name": "payroll.pay",
            "description": "Mark payroll as paid"
        },
        {
            "name": "payroll.delete",
            "description": "Delete payroll"
        },

        #Salary Components
        {
            "name": "salary_components.view",
            "description": "View salary components"
        },
        {
            "name": "salary_components.create",
            "description": "Create salary components"
        },
        {
            "name": "salary_components.update",
            "description": "Update salary components"
        },
        {
            "name": "salary_components.delete",
            "description": "Delete salary components"
        },

        #Salary Structures
        {
            "name": "salary_structures.view",
            "description": "View salary structures"
        },
        {
            "name": "salary_structures.create",
            "description": "Create salary structures"
        },
        {
            "name": "salary_structures.update",
            "description": "Update salary structures"
        },
        {
            "name": "salary_structures.delete",
            "description": "Delete salary structures"
        },

        #Employee Salaries
        {
            "name": "employee_salaries.view",
            "description": "View employee salaries"
        },
        {
            "name": "employee_salaries.create",
            "description": "Create employee salaries"
        },
        {
            "name": "employee_salaries.update",
            "description": "Update employee salaries"
        },
        {
            "name": "employee_salaries.delete",
            "description": "Delete employee salaries"
        }
    ]

    async def run(self,db: AsyncSession) -> None:
        for permission_data in self.DEFAULT_PERMISSIONS:

            result = await db.execute(
                select(Permission).where(Permission.name == permission_data["name"])
            )

            permission = result.scalar_one_or_none()

            if permission:
                continue

            db.add(Permission(**permission_data))

        await db.commit()
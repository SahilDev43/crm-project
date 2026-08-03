from pydantic import BaseModel, ConfigDict

class RolePermissionResponse(BaseModel):

    id: int
    role_id: int
    permission_id: int

    model_config = ConfigDict(from_attributes=True)
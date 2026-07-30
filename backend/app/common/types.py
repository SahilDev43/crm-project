from typing import Annotated
from fastapi import Depends

from app.core.jwt import get_current_user
from app.modules.users.model import User

CurrentUser = Annotated[
    User,
    Depends(get_current_user)
]
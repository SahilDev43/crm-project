from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class AttendanceBase(BaseModel):
    attendance_date: date
    status: int = 1
    remarks: str | None = None


class AttendanceCreate(AttendanceBase):
    user_id: int
    company_id: int


class AttendanceUpdate(BaseModel):
    status: int | None = None
    remarks: str | None = None


class AttendanceSessionResponse(BaseModel):
    id: int
    attendance_id: int
    user_id: int

    punch_in_at: datetime
    punch_out_at: datetime | None = None

    total_time: int | None = None
    auto_closed: bool

    in_ip_address: str | None = None
    out_ip_address: str | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )

class AttendanceUserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str

    model_config = ConfigDict(
        from_attributes=True
    )

class AttendanceManagementResponse(BaseModel):
    id: int
    attendance_date: date

    company_id: int
    user_id: int

    user: AttendanceUserResponse | None = None

    total_time: int
    session_count: int

    status: int
    remarks: str | None = None

    created_at: datetime
    updated_at: datetime


class AttendanceResponse(AttendanceBase):
    id: int

    company_id: int
    user_id: int

    total_time: int

    user: AttendanceUserResponse | None = None
    session_count: int = 0

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class AttendanceDetailResponse(AttendanceResponse):
    sessions: list[AttendanceSessionResponse] = []


class AttendanceListResponse(BaseModel):
    items: list[AttendanceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PunchInRequest(BaseModel):
    pass


class PunchOutRequest(BaseModel):
    pass
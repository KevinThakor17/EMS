from datetime import date
from pydantic import BaseModel, Field


class EmployeeCreate(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str
    title: str = "Employee"
    department: str = "General"
    role: str = "employee"
    manager_id: int | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class EmployeeOut(BaseModel):
    id: int
    email: str
    full_name: str
    title: str
    department: str
    role: str
    manager_id: int | None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    role: str
    employee: EmployeeOut


class AttendanceMarkRequest(BaseModel):
    status: str = "present"


class LeaveRequestCreate(BaseModel):
    reason: str
    start_date: date
    end_date: date


class LeaveStatusUpdate(BaseModel):
    status: str


class HolidayCreate(BaseModel):
    name: str
    holiday_date: date
    description: str = ""


class ProjectCreate(BaseModel):
    code: str
    name: str
    description: str = ""
    start_date: date
    end_date: date | None = None


class ProjectMemberAdd(BaseModel):
    employee_id: int
    allocation_percent: int = Field(default=100, ge=1, le=100)


class TimeLogCreate(BaseModel):
    project_id: int
    work_date: date
    hours: float = Field(gt=0, le=24)
    description: str


class AdminEmployeeCreate(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str
    title: str = "Employee"
    department: str = "General"
    role: str = "employee"
    manager_id: int | None = None
    is_active: bool = True


class AdminEmployeeUpdate(BaseModel):
    full_name: str | None = None
    title: str | None = None
    department: str | None = None
    role: str | None = None
    manager_id: int | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=6)


class AdminLeaveCreate(BaseModel):
    employee_id: int
    reason: str
    start_date: date
    end_date: date
    status: str = "approved"

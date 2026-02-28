from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_employee, get_db
from app.core.security import hash_password
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.holiday import CompanyHoliday
from app.models.leave import LeaveRequest
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.time_log import TimeLog
from app.schemas import (
    AttendanceMarkRequest,
    AdminEmployeeCreate,
    AdminEmployeeUpdate,
    AdminLeaveCreate,
    HolidayCreate,
    LeaveRequestCreate,
    LeaveStatusUpdate,
    ProjectCreate,
    ProjectMemberAdd,
    TimeLogCreate,
)

router = APIRouter(prefix="/ems", tags=["Employee Management"])


def _employee_label(employee: Employee) -> dict:
    return {
        "id": employee.id,
        "name": employee.full_name,
        "title": employee.title,
        "department": employee.department,
    }


def _assert_admin(employee: Employee) -> None:
    if employee.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can perform this action")


@router.get("/dashboard")
def dashboard(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    today = date.today()

    today_leaves = (
        db.query(LeaveRequest, Employee)
        .join(Employee, LeaveRequest.employee_id == Employee.id)
        .filter(
            LeaveRequest.status == "approved",
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today,
            LeaveRequest.employee_id != current_employee.id,
        )
        .all()
    )

    upcoming_leaves = (
        db.query(LeaveRequest, Employee)
        .join(Employee, LeaveRequest.employee_id == Employee.id)
        .filter(
            LeaveRequest.status == "approved",
            LeaveRequest.start_date > today,
            LeaveRequest.start_date <= today + timedelta(days=14),
            LeaveRequest.employee_id != current_employee.id,
        )
        .order_by(LeaveRequest.start_date.asc())
        .all()
    )

    holidays = (
        db.query(CompanyHoliday)
        .filter(CompanyHoliday.holiday_date >= today)
        .order_by(CompanyHoliday.holiday_date.asc())
        .limit(5)
        .all()
    )

    my_projects = (
        db.query(Project)
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .filter(ProjectMember.employee_id == current_employee.id)
        .order_by(Project.name.asc())
        .all()
    )

    return {
        "employee": {
            "id": current_employee.id,
            "name": current_employee.full_name,
            "title": current_employee.title,
            "department": current_employee.department,
            "role": current_employee.role,
        },
        "today_leaves": [
            {
                "leave_id": leave.id,
                "employee": emp.full_name,
                "reason": leave.reason,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
            }
            for leave, emp in today_leaves
        ],
        "upcoming_leaves": [
            {
                "leave_id": leave.id,
                "employee": emp.full_name,
                "reason": leave.reason,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
            }
            for leave, emp in upcoming_leaves
        ],
        "upcoming_holidays": holidays,
        "my_projects": my_projects,
    }


@router.get("/employees")
def list_employees(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    employees = db.query(Employee).order_by(Employee.full_name.asc()).all()
    return [_employee_label(emp) for emp in employees]


@router.get("/admin/employees")
def admin_list_employees(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    _assert_admin(current_employee)
    employees = db.query(Employee).order_by(Employee.full_name.asc()).all()
    return [
        {
            "id": emp.id,
            "email": emp.email,
            "full_name": emp.full_name,
            "title": emp.title,
            "department": emp.department,
            "role": emp.role,
            "manager_id": emp.manager_id,
            "joined_on": emp.joined_on,
            "is_active": emp.is_active,
        }
        for emp in employees
    ]


@router.post("/admin/employees")
def admin_create_employee(
    payload: AdminEmployeeCreate,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    _assert_admin(current_employee)
    if db.query(Employee).filter(Employee.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Employee email already exists")

    if payload.manager_id and not db.query(Employee).filter(Employee.id == payload.manager_id).first():
        raise HTTPException(status_code=404, detail="Manager not found")

    employee = Employee(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        title=payload.title,
        department=payload.department,
        role=payload.role,
        manager_id=payload.manager_id,
        joined_on=date.today(),
        is_active=payload.is_active,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.put("/admin/employees/{employee_id}")
def admin_update_employee(
    employee_id: int,
    payload: AdminEmployeeUpdate,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    _assert_admin(current_employee)
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    changes = payload.model_dump(exclude_unset=True)

    if changes.get("manager_id") == employee_id:
        raise HTTPException(status_code=400, detail="Employee cannot be their own manager")
    if "manager_id" in changes and changes["manager_id"] and not db.query(Employee).filter(
        Employee.id == changes["manager_id"]
    ).first():
        raise HTTPException(status_code=404, detail="Manager not found")

    for field in ("full_name", "title", "department", "role", "manager_id", "is_active"):
        if field in changes:
            setattr(employee, field, changes[field])
    if "password" in changes and changes["password"]:
        employee.password_hash = hash_password(changes["password"])

    db.commit()
    db.refresh(employee)
    return employee


@router.post("/admin/leaves")
def admin_create_leave(
    payload: AdminLeaveCreate,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    _assert_admin(current_employee)
    employee = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="end_date cannot be before start_date")
    if payload.status not in {"pending", "approved", "rejected"}:
        raise HTTPException(status_code=400, detail="Invalid status")

    leave = LeaveRequest(
        employee_id=payload.employee_id,
        reason=payload.reason,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status,
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave


@router.get("/profile")
def my_profile(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    manager = None
    if current_employee.manager_id:
        manager = db.query(Employee).filter(Employee.id == current_employee.manager_id).first()

    return {
        "id": current_employee.id,
        "email": current_employee.email,
        "full_name": current_employee.full_name,
        "title": current_employee.title,
        "department": current_employee.department,
        "role": current_employee.role,
        "joined_on": current_employee.joined_on,
        "manager": manager.full_name if manager else None,
    }


@router.post("/attendance/check-in")
def check_in(
    payload: AttendanceMarkRequest,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    today = date.today()
    attendance = (
        db.query(Attendance)
        .filter(and_(Attendance.employee_id == current_employee.id, Attendance.work_date == today))
        .first()
    )

    now = datetime.utcnow()
    if not attendance:
        attendance = Attendance(
            employee_id=current_employee.id,
            work_date=today,
            status=payload.status,
            check_in=now,
        )
        db.add(attendance)
    else:
        attendance.check_in = attendance.check_in or now
        attendance.status = payload.status

    db.commit()
    db.refresh(attendance)
    return attendance


@router.post("/attendance/check-out")
def check_out(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    today = date.today()
    attendance = (
        db.query(Attendance)
        .filter(and_(Attendance.employee_id == current_employee.id, Attendance.work_date == today))
        .first()
    )

    if not attendance:
        raise HTTPException(status_code=400, detail="Check-in missing for today")

    attendance.check_out = datetime.utcnow()
    db.commit()
    db.refresh(attendance)
    return attendance


@router.get("/attendance")
def attendance_history(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    rows = (
        db.query(Attendance)
        .filter(Attendance.employee_id == current_employee.id)
        .order_by(Attendance.work_date.desc())
        .limit(30)
        .all()
    )
    return rows


@router.post("/leaves")
def apply_leave(
    payload: LeaveRequestCreate,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="end_date cannot be before start_date")

    leave = LeaveRequest(
        employee_id=current_employee.id,
        reason=payload.reason,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status="pending",
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave


@router.get("/leaves")
def my_leaves(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    return (
        db.query(LeaveRequest)
        .filter(LeaveRequest.employee_id == current_employee.id)
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )


@router.get("/leaves/all")
def all_leaves(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    if current_employee.role not in {"admin", "manager"}:
        raise HTTPException(status_code=403, detail="Only managers/admin can access all leaves")

    leaves = (
        db.query(LeaveRequest, Employee)
        .join(Employee, LeaveRequest.employee_id == Employee.id)
        .order_by(LeaveRequest.start_date.desc())
        .all()
    )
    return [
        {
            "leave_id": leave.id,
            "employee": emp.full_name,
            "employee_id": emp.id,
            "reason": leave.reason,
            "status": leave.status,
            "start_date": leave.start_date,
            "end_date": leave.end_date,
        }
        for leave, emp in leaves
    ]


@router.put("/leaves/{leave_id}")
def update_leave_status(
    leave_id: int,
    payload: LeaveStatusUpdate,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    if current_employee.role not in {"admin", "manager"}:
        raise HTTPException(status_code=403, detail="Only managers/admin can approve or reject")

    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if payload.status not in {"pending", "approved", "rejected"}:
        raise HTTPException(status_code=400, detail="Invalid status")

    leave.status = payload.status
    db.commit()
    db.refresh(leave)
    return leave


@router.get("/holidays")
def list_holidays(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    return db.query(CompanyHoliday).order_by(CompanyHoliday.holiday_date.asc()).all()


@router.post("/holidays")
def create_holiday(
    payload: HolidayCreate,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    if current_employee.role not in {"admin", "manager"}:
        raise HTTPException(status_code=403, detail="Only managers/admin can add holidays")

    item = CompanyHoliday(
        name=payload.name,
        holiday_date=payload.holiday_date,
        description=payload.description,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/team")
def team_view(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    if current_employee.role not in {"admin", "manager"}:
        return []

    query = db.query(Employee).filter(Employee.is_active == True)
    if current_employee.role == "manager":
        query = query.filter(Employee.manager_id == current_employee.id)

    team_members = query.order_by(Employee.full_name.asc()).all()
    manager_map = {emp.id: emp.full_name for emp in db.query(Employee).all()}

    return [
        {
            **_employee_label(emp),
            "manager": manager_map.get(emp.manager_id),
        }
        for emp in team_members
    ]


@router.get("/projects")
def list_projects(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.name.asc()).all()
    result = []

    for project in projects:
        members = (
            db.query(ProjectMember, Employee)
            .join(Employee, ProjectMember.employee_id == Employee.id)
            .filter(ProjectMember.project_id == project.id)
            .all()
        )
        result.append(
            {
                "id": project.id,
                "code": project.code,
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "start_date": project.start_date,
                "end_date": project.end_date,
                "members": [
                    {
                        "employee_id": emp.id,
                        "employee_name": emp.full_name,
                        "allocation_percent": member.allocation_percent,
                    }
                    for member, emp in members
                ],
            }
        )

    return result


@router.post("/projects")
def create_project(
    payload: ProjectCreate,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    if current_employee.role not in {"admin", "manager"}:
        raise HTTPException(status_code=403, detail="Only managers/admin can create projects")

    project = Project(
        code=payload.code,
        name=payload.name,
        description=payload.description,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status="active",
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.post("/projects/{project_id}/members")
def add_project_member(
    project_id: int,
    payload: ProjectMemberAdd,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    if current_employee.role not in {"admin", "manager"}:
        raise HTTPException(status_code=403, detail="Only managers/admin can add members")

    if not db.query(Project).filter(Project.id == project_id).first():
        raise HTTPException(status_code=404, detail="Project not found")

    if not db.query(Employee).filter(Employee.id == payload.employee_id).first():
        raise HTTPException(status_code=404, detail="Employee not found")

    exists = (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id, ProjectMember.employee_id == payload.employee_id)
        .first()
    )
    if exists:
        raise HTTPException(status_code=400, detail="Employee already assigned")

    member = ProjectMember(
        project_id=project_id,
        employee_id=payload.employee_id,
        allocation_percent=payload.allocation_percent,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.post("/time-logs")
def create_time_log(
    payload: TimeLogCreate,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    assignment = (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == payload.project_id, ProjectMember.employee_id == current_employee.id)
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=403, detail="You are not a member of this project")

    time_log = TimeLog(
        employee_id=current_employee.id,
        project_id=payload.project_id,
        work_date=payload.work_date,
        hours=payload.hours,
        description=payload.description,
    )
    db.add(time_log)
    db.commit()
    db.refresh(time_log)
    return time_log


@router.get("/time-logs")
def list_my_time_logs(current_employee: Employee = Depends(get_current_employee), db: Session = Depends(get_db)):
    logs = (
        db.query(TimeLog, Project)
        .join(Project, TimeLog.project_id == Project.id)
        .filter(TimeLog.employee_id == current_employee.id)
        .order_by(TimeLog.work_date.desc(), TimeLog.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": log.id,
            "project": project.name,
            "project_code": project.code,
            "work_date": log.work_date,
            "hours": log.hours,
            "description": log.description,
            "created_at": log.created_at,
        }
        for log, project in logs
    ]

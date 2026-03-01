from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.holiday import CompanyHoliday
from app.models.leave import LeaveRequest
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.time_log import TimeLog

def seed_initial_data(db: Session) -> None:
    if db.query(Employee).count() > 0:
        return

    admin = Employee(
        email="admin@company.com",
        password_hash=hash_password("admin123"),
        full_name="Admin User",
        title="HR Manager",
        department="HR",
        role="admin",
        joined_on=date.today() - timedelta(days=730),
    )
    dev_lead = Employee(
        email="lead@company.com",
        password_hash=hash_password("lead123"),
        full_name="Team Lead",
        title="Engineering Manager",
        department="Engineering",
        role="manager",
        joined_on=date.today() - timedelta(days=900),
    )
    engineer = Employee(
        email="employee@company.com",
        password_hash=hash_password("employee123"),
        full_name="Demo Employee",
        title="Software Engineer",
        department="Engineering",
        role="employee",
        joined_on=date.today() - timedelta(days=400),
    )
    analyst = Employee(
        email="analyst@company.com",
        password_hash=hash_password("analyst123"),
        full_name="Business Analyst",
        title="Analyst",
        department="Operations",
        role="employee",
        joined_on=date.today() - timedelta(days=500),
    )

    db.add_all([admin, dev_lead, engineer, analyst])
    db.flush()

    engineer.manager_id = dev_lead.id
    analyst.manager_id = dev_lead.id

    project_1 = Project(
        code="EMS-PLATFORM",
        name="Employee Management Platform",
        description="Core platform modernization and automations",
        status="active",
        start_date=date.today() - timedelta(days=120),
    )
    project_2 = Project(
        code="MOB-APP",
        name="Mobile Self Service",
        description="Self-service app for attendance and leave",
        status="active",
        start_date=date.today() - timedelta(days=60),
    )
    db.add_all([project_1, project_2])
    db.flush()

    db.add_all([
        ProjectMember(project_id=project_1.id, employee_id=dev_lead.id, allocation_percent=40),
        ProjectMember(project_id=project_1.id, employee_id=engineer.id, allocation_percent=80),
        ProjectMember(project_id=project_2.id, employee_id=analyst.id, allocation_percent=70),
    ])

    db.add_all([
        CompanyHoliday(name="Spring Festival", holiday_date=date.today() + timedelta(days=10), description="Company-wide holiday"),
        CompanyHoliday(name="Founders Day", holiday_date=date.today() + timedelta(days=35), description="Annual celebration"),
    ])

    db.add_all([
        LeaveRequest(
            employee_id=analyst.id,
            reason="Family function",
            status="pending",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=1),
        ),
        LeaveRequest(
            employee_id=dev_lead.id,
            reason="Medical appointment",
            status="pending",
            start_date=date.today() + timedelta(days=4),
            end_date=date.today() + timedelta(days=4),
        ),
    ])

    db.add_all([
        Attendance(employee_id=engineer.id, work_date=date.today(), status="present"),
        Attendance(employee_id=analyst.id, work_date=date.today(), status="present"),
    ])

    db.add_all([
        TimeLog(
            employee_id=engineer.id,
            project_id=project_1.id,
            work_date=date.today() - timedelta(days=1),
            hours=7.5,
            description="Implemented attendance API validations and unit tests",
        ),
        TimeLog(
            employee_id=analyst.id,
            project_id=project_2.id,
            work_date=date.today() - timedelta(days=1),
            hours=6,
            description="Prepared requirement checklist and sprint stories",
        ),
    ])

    db.commit()

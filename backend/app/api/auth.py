from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_employee, get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.employee import Employee
from app.schemas import EmployeeCreate, EmployeeOut, LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=EmployeeOut)
def register(payload: EmployeeCreate, db: Session = Depends(get_db)):
    if db.query(Employee).filter(Employee.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Employee email already exists")

    employee = Employee(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        title=payload.title,
        department=payload.department,
        role=payload.role,
        manager_id=payload.manager_id,
        joined_on=date.today(),
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.email == payload.email).first()
    if not employee or not verify_password(payload.password, employee.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": employee.email, "role": employee.role, "employee_id": employee.id})
    return {"access_token": token, "role": employee.role, "employee": employee}


@router.get("/me", response_model=EmployeeOut)
def me(current_employee: Employee = Depends(get_current_employee)):
    return current_employee

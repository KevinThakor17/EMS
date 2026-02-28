from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.models.employee import Employee

security = HTTPBearer(auto_error=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_employee(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Employee:
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing authorization token")

    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Token payload is invalid")

    employee = db.query(Employee).filter(Employee.email == email, Employee.is_active == True).first()
    if not employee:
        raise HTTPException(status_code=401, detail="Employee not found or inactive")

    return employee

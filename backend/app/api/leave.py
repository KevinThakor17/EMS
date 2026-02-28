from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.leave import Leave

router = APIRouter(prefix="/leave", tags=["Leave"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/apply")
def apply_leave(reason: str, user_id: int, db: Session = Depends(get_db)):
    leave = Leave(reason=reason, user_id=user_id)
    db.add(leave)
    db.commit()
    return {"message": "Leave applied"}

@router.get("/all")
def get_all(db: Session = Depends(get_db)):
    return db.query(Leave).all()

@router.put("/approve/{leave_id}")
def approve_leave(leave_id: int, db: Session = Depends(get_db)):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Not found")
    leave.status = "approved"
    db.commit()
    return {"message": "Approved"}

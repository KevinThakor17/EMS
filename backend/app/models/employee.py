from sqlalchemy import Boolean, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(100), default="Employee")
    department: Mapped[str] = mapped_column(String(100), default="General")
    role: Mapped[str] = mapped_column(String(50), default="employee")
    manager_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), nullable=True)
    joined_on: Mapped[Date] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    manager = relationship("Employee", remote_side=[id], backref="direct_reports")

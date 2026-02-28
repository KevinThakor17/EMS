from datetime import date

from sqlalchemy import Date, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CompanyHoliday(Base):
    __tablename__ = "company_holidays"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    holiday_date: Mapped[date] = mapped_column(Date, unique=True, index=True)
    description: Mapped[str] = mapped_column(String(255), default="")

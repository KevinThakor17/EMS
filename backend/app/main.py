from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, ems
from app.core.database import Base, SessionLocal, engine
from app.core.seed import seed_initial_data
import app.models  # noqa: F401

app = FastAPI(title="Employee Management System API")

Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_initial_data(db)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(ems.router)


@app.get("/")
def healthcheck():
    return {"message": "Employee Management System API is running"}

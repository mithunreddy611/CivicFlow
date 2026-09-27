from app.routes.auth import router as auth_router
from app.routes.issues import router as issues_router
from app.routes.officer import router as officer_router
from app.routes.citizen import router as citizen_router
from app.routes.admin import router as admin_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine

# Import all models so SQLAlchemy knows about them
from app.models import (
    User,
    Department,
    Officer,
    Issue,
    ResolutionProof,
    IssueHistory,
)


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="CivicFlow API",
    description="Smart Civic Issue Reporting and Resolution System",
    version="1.0.0",
)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(issues_router)
app.include_router(officer_router)
app.include_router(citizen_router)
app.include_router(admin_router)
@app.get("/")
def root():
    return {
        "message": "CivicFlow API is running",
        "status": "ok",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }
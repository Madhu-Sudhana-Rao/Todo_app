from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine
from app.exceptions.handlers import register_exception_handlers
from app.routers import auth, todos, dashboard
from app.models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Asynchronous lifespan manager. Handles startup database schemas creation
    for SQLite fallback, which simplifies local development.
    """
    if "sqlite" in settings.DATABASE_URL:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bind exception handlers
register_exception_handlers(app)

# Register route prefixes
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(todos.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)

@app.get("/")
async def health_check():
    """Application health status check endpoint."""
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "api_docs": f"{settings.API_V1_STR}/docs"
    }

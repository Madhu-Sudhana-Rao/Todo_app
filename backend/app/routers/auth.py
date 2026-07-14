from datetime import timedelta
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.dependencies import get_current_user
from app.auth.jwt import create_access_token, decode_token
from app.database.session import get_db
from app.exceptions.handlers import UnauthorizedException
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserUpdate,
    UpdatePassword,
    UserResponse,
    Token,
    TokenRefreshRequest,
    TokenRefreshResponse,
)
from app.services.user import user_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    return await user_service.register_user(db, user_in)

@router.post("/login", response_model=Token)
async def login(login_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate and obtain JWT access & refresh tokens."""
    user = await user_service.authenticate_user(db, login_in.username, login_in.password)
    
    access_token = create_access_token(user.id)
    refresh_token = create_access_token(user.id, expires_delta=timedelta(days=30))
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh(refresh_in: TokenRefreshRequest):
    """Obtain a new access token using a valid refresh token."""
    user_id = decode_token(refresh_in.refresh_token)
    if not user_id:
        raise UnauthorizedException("Invalid refresh token.", code="INVALID_REFRESH_TOKEN")
        
    access_token = create_access_token(user_id)
    new_refresh = create_access_token(user_id, expires_delta=timedelta(days=30))
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get profile information for the authenticated user."""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_me(
    update_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update profile information (e.g. username, email, avatar)."""
    return await user_service.update_profile(db, current_user, update_in)

@router.put("/password", response_model=UserResponse)
async def change_password(
    update_in: UpdatePassword,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the password of the authenticated user."""
    return await user_service.update_password(db, current_user, update_in)

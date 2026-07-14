from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.jwt import decode_token
from app.database.session import get_db
from app.exceptions.handlers import UnauthorizedException
from app.models.user import User
from app.repositories.user import user_repository
from app.core.config import settings

# Route path for authentication login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Dependency injection function to resolve current user using Bearer tokens.
    Raises UnauthorizedException if validation fails.
    """
    if not token:
        raise UnauthorizedException("Authentication credentials are required.", code="CREDENTIALS_MISSING")

    user_id_str = decode_token(token)
    if not user_id_str:
        raise UnauthorizedException("Could not validate credentials.", code="INVALID_CREDENTIALS")
    
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise UnauthorizedException("Invalid credential format.", code="INVALID_CREDENTIALS")
        
    user = await user_repository.get(db, user_id)
    if not user:
        raise UnauthorizedException("User does not exist.", code="USER_NOT_FOUND")
        
    return user

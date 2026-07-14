from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.jwt import get_password_hash, verify_password
from app.exceptions.handlers import BadRequestException, UnauthorizedException
from app.models.user import User
from app.models.activity import UserActivityLog
from app.repositories.user import user_repository
from app.schemas.user import UserRegister, UserUpdate, UpdatePassword

class UserService:
    async def register_user(self, db: AsyncSession, user_in: UserRegister) -> User:
        """Register a new user and hash their password."""
        # Check if email exists
        existing_email = await user_repository.get_by_email(db, user_in.email)
        if existing_email:
            raise BadRequestException("Email is already registered.", code="EMAIL_EXISTS")
        
        # Check if username exists
        existing_username = await user_repository.get_by_username(db, user_in.username)
        if existing_username:
            raise BadRequestException("Username is already taken.", code="USERNAME_TAKEN")
            
        hashed_password = get_password_hash(user_in.password)
        user_data = {
            "username": user_in.username,
            "email": user_in.email,
            "password_hash": hashed_password
        }
        user = await user_repository.create(db, obj_in=user_data)
        
        # Log activity
        log = UserActivityLog(user_id=user.id, action="Registered account")
        db.add(log)
        
        await db.commit()
        await db.refresh(user)
        return user

    async def authenticate_user(self, db: AsyncSession, username_or_email: str, password: str) -> User:
        """Authenticate user by email or username."""
        # Try username first, then email
        user = await user_repository.get_by_username(db, username_or_email)
        if not user:
            user = await user_repository.get_by_email(db, username_or_email)
            
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid username/email or password.", code="INVALID_CREDENTIALS")
            
        # Log login activity
        log = UserActivityLog(user_id=user.id, action="Logged in")
        db.add(log)
        await db.commit()
        
        return user

    async def update_profile(self, db: AsyncSession, user: User, update_in: UserUpdate) -> User:
        """Update username, email, or avatar url."""
        update_data = {}
        if update_in.username is not None and update_in.username != user.username:
            # Check username uniqueness
            exist = await user_repository.get_by_username(db, update_in.username)
            if exist:
                raise BadRequestException("Username already taken.", code="USERNAME_TAKEN")
            update_data["username"] = update_in.username

        if update_in.email is not None and update_in.email != user.email:
            # Check email uniqueness
            exist = await user_repository.get_by_email(db, update_in.email)
            if exist:
                raise BadRequestException("Email already in use.", code="EMAIL_IN_USE")
            update_data["email"] = update_in.email

        if update_in.avatar_url is not None:
            update_data["avatar_url"] = update_in.avatar_url

        if update_data:
            user = await user_repository.update(db, db_obj=user, obj_in=update_data)
            
            # Log activity
            log = UserActivityLog(user_id=user.id, action="Updated profile details")
            db.add(log)
            await db.commit()
            await db.refresh(user)
            
        return user

    async def update_password(self, db: AsyncSession, user: User, update_in: UpdatePassword) -> User:
        """Change user password."""
        if not verify_password(update_in.old_password, user.password_hash):
            raise BadRequestException("Incorrect old password.", code="INCORRECT_OLD_PASSWORD")
            
        hashed_password = get_password_hash(update_in.new_password)
        await user_repository.update(db, db_obj=user, obj_in={"password_hash": hashed_password})
        
        # Log activity
        log = UserActivityLog(user_id=user.id, action="Changed password")
        db.add(log)
        await db.commit()
        await db.refresh(user)
        return user

user_service = UserService()

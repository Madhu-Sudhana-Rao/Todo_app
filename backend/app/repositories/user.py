from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """Fetch user record by email address."""
        query = select(User).filter(User.email == email)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        """Fetch user record by username."""
        query = select(User).filter(User.username == username)
        result = await db.execute(query)
        return result.scalars().first()

user_repository = UserRepository()

from typing import Generic, Type, TypeVar, List, Optional, Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        """Fetch a single record by primary key id."""
        query = select(self.model).filter(self.model.id == id)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Fetch multiple records with offset and limit pagination."""
        query = select(self.model).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: Dict[str, Any]) -> ModelType:
        """Create a new record in the database."""
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        await db.flush()  # Populates ID on db_obj without committing yet
        return db_obj

    async def update(self, db: AsyncSession, *, db_obj: ModelType, obj_in: Dict[str, Any]) -> ModelType:
        """Update fields on an existing database record."""
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.add(db_obj)
        await db.flush()
        return db_obj

    async def remove(self, db: AsyncSession, *, id: Any) -> Optional[ModelType]:
        """Remove a record by its primary key ID."""
        db_obj = await self.get(db, id)
        if db_obj:
            await db.delete(db_obj)
            await db.flush()
        return db_obj

import datetime
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy import select, and_, or_, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.todo import Todo
from app.repositories.base import BaseRepository

class TodoRepository(BaseRepository[Todo]):
    def __init__(self):
        super().__init__(Todo)

    async def get_by_user(
        self,
        db: AsyncSession,
        *,
        owner_id: int,
        search: Optional[str] = None,
        completed: Optional[bool] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        favorite: Optional[bool] = None,
        archived: Optional[bool] = False,
        deleted: Optional[bool] = False,
        due_today: Optional[bool] = None,
        overdue: Optional[bool] = None,
        sort_by: Optional[str] = "newest",  # "newest", "oldest", "due_date", "priority"
        skip: int = 0,
        limit: int = 10,
    ) -> Tuple[List[Todo], int]:
        """Fetch todos for a user filtered, sorted, and paginated, along with total count."""
        query = select(Todo).filter(Todo.owner_id == owner_id)
        count_query = select(func.count(Todo.id)).filter(Todo.owner_id == owner_id)

        # Filters
        filters = []
        if completed is not None:
            filters.append(Todo.completed == completed)
        if priority:
            filters.append(Todo.priority == priority)
        if category:
            filters.append(Todo.category == category)
        if tag:
            # Simple substring matching for tags list
            filters.append(Todo.tags.like(f"%{tag}%"))
        if favorite is not None:
            filters.append(Todo.favorite == favorite)
        if archived is not None:
            filters.append(Todo.archived == archived)
        if deleted is not None:
            filters.append(Todo.deleted == deleted)
        
        now = datetime.datetime.utcnow()
        # Local date boundary
        today_start = datetime.datetime(now.year, now.month, now.day)
        today_end = today_start + datetime.timedelta(days=1)
        
        if due_today:
            filters.append(and_(Todo.due_date >= today_start, Todo.due_date < today_end))
        if overdue:
            filters.append(and_(Todo.due_date < today_start, Todo.completed == False))
            
        if search:
            search_filter = or_(
                Todo.title.ilike(f"%{search}%"),
                Todo.description.ilike(f"%{search}%"),
                Todo.category.ilike(f"%{search}%")
            )
            filters.append(search_filter)

        if filters:
            query = query.filter(*filters)
            count_query = count_query.filter(*filters)

        # Get total count
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0

        # Sorting
        if sort_by == "oldest":
            query = query.order_by(Todo.created_at.asc())
        elif sort_by == "due_date":
            # Nulls last for due dates
            query = query.order_by(Todo.due_date.asc().nullslast())
        elif sort_by == "priority":
            # Priority order mapping
            priority_order = case(
                (Todo.priority == "high", 1),
                (Todo.priority == "medium", 2),
                (Todo.priority == "low", 3),
                else_=4
            )
            query = query.order_by(priority_order, Todo.created_at.desc())
        else:  # newest
            query = query.order_by(Todo.created_at.desc())

        # Pagination
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        todos = result.scalars().all()

        return todos, total

    async def get_dashboard_stats(self, db: AsyncSession, owner_id: int) -> Dict[str, Any]:
        """Aggregate counts, overdue items, completion percentage, and tasks due today."""
        now = datetime.datetime.utcnow()
        today_start = datetime.datetime(now.year, now.month, now.day)
        today_end = today_start + datetime.timedelta(days=1)

        # total tasks
        total_res = await db.execute(
            select(func.count(Todo.id)).filter(Todo.owner_id == owner_id, Todo.deleted == False, Todo.archived == False)
        )
        total = total_res.scalar() or 0
        
        # completed tasks
        comp_res = await db.execute(
            select(func.count(Todo.id)).filter(Todo.owner_id == owner_id, Todo.deleted == False, Todo.archived == False, Todo.completed == True)
        )
        completed = comp_res.scalar() or 0
        
        # pending tasks
        pend_res = await db.execute(
            select(func.count(Todo.id)).filter(Todo.owner_id == owner_id, Todo.deleted == False, Todo.archived == False, Todo.completed == False)
        )
        pending = pend_res.scalar() or 0

        # overdue tasks
        overdue_res = await db.execute(
            select(func.count(Todo.id)).filter(Todo.owner_id == owner_id, Todo.deleted == False, Todo.archived == False, Todo.completed == False, Todo.due_date < today_start)
        )
        overdue = overdue_res.scalar() or 0

        # due today tasks
        due_res = await db.execute(
            select(func.count(Todo.id)).filter(Todo.owner_id == owner_id, Todo.deleted == False, Todo.archived == False, Todo.due_date >= today_start, Todo.due_date < today_end)
        )
        due_today = due_res.scalar() or 0

        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "overdue": overdue,
            "due_today": due_today,
            "completion_percentage": round((completed / total * 100), 1) if total > 0 else 0.0
        }

todo_repository = TodoRepository()

import datetime
import io
from typing import List, Optional, Tuple, Dict, Any
import pandas as pd
from sqlalchemy import select, and_, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.exceptions.handlers import NotFoundException, ForbiddenException, BadRequestException
from app.models.todo import Todo
from app.models.activity import UserActivityLog
from app.repositories.todo import todo_repository
from app.schemas.todo import TodoCreate, TodoUpdate

class TodoService:
    async def get_todo_or_raise(self, db: AsyncSession, id: int, owner_id: int) -> Todo:
        """Fetch todo or raise NotFound/Forbidden."""
        todo = await todo_repository.get(db, id)
        if not todo:
            raise NotFoundException("Task not found.", code="TASK_NOT_FOUND")
        if todo.owner_id != owner_id:
            raise ForbiddenException("You do not have permission to access this task.", code="FORBIDDEN")
        return todo

    async def create_todo(self, db: AsyncSession, owner_id: int, todo_in: TodoCreate) -> Todo:
        """Create a new task and log the activity."""
        # Convert tags list to comma-separated string
        tags_str = ",".join(todo_in.tags) if todo_in.tags else None
        
        todo_data = {
            "title": todo_in.title,
            "description": todo_in.description,
            "priority": todo_in.priority or "medium",
            "due_date": todo_in.due_date,
            "category": todo_in.category or "Inbox",
            "tags": tags_str,
            "owner_id": owner_id
        }
        todo = await todo_repository.create(db, obj_in=todo_data)
        
        # Log activity
        log = UserActivityLog(user_id=owner_id, action="Created task", todo_title=todo.title)
        db.add(log)
        
        await db.commit()
        await db.refresh(todo)
        return todo

    async def update_todo(self, db: AsyncSession, owner_id: int, id: int, todo_in: TodoUpdate) -> Todo:
        """Update fields of an existing task."""
        todo = await self.get_todo_or_raise(db, id, owner_id)
        
        update_data = todo_in.model_dump(exclude_unset=True)
        
        # If tags are provided, convert to comma-separated string
        if "tags" in update_data and update_data["tags"] is not None:
            update_data["tags"] = ",".join(update_data["tags"])
            
        # Check completion transition
        was_completed = todo.completed
        is_completed = update_data.get("completed", was_completed)
        
        todo = await todo_repository.update(db, db_obj=todo, obj_in=update_data)
        
        # Log completion transitions
        if not was_completed and is_completed:
            log = UserActivityLog(user_id=owner_id, action="Completed task", todo_title=todo.title)
            db.add(log)
        elif was_completed and not is_completed:
            log = UserActivityLog(user_id=owner_id, action="Marked task pending", todo_title=todo.title)
            db.add(log)
        else:
            log = UserActivityLog(user_id=owner_id, action="Updated task details", todo_title=todo.title)
            db.add(log)
            
        await db.commit()
        await db.refresh(todo)
        return todo

    async def delete_todo(self, db: AsyncSession, owner_id: int, id: int, permanent: bool = False) -> Optional[Todo]:
        """Soft delete (trash bin) or permanently delete a task."""
        todo = await self.get_todo_or_raise(db, id, owner_id)
        
        if permanent:
            await todo_repository.remove(db, id=id)
            log = UserActivityLog(user_id=owner_id, action="Permanently deleted task", todo_title=todo.title)
            db.add(log)
            await db.commit()
            return None
        else:
            todo = await todo_repository.update(db, db_obj=todo, obj_in={"deleted": True})
            log = UserActivityLog(user_id=owner_id, action="Moved task to Trash", todo_title=todo.title)
            db.add(log)
            await db.commit()
            await db.refresh(todo)
            return todo

    async def restore_todo(self, db: AsyncSession, owner_id: int, id: int) -> Todo:
        """Restore a soft-deleted task from Trash."""
        todo = await self.get_todo_or_raise(db, id, owner_id)
        if not todo.deleted:
            raise BadRequestException("Task is not in the Trash.", code="TASK_NOT_DELETED")
            
        todo = await todo_repository.update(db, db_obj=todo, obj_in={"deleted": False})
        log = UserActivityLog(user_id=owner_id, action="Restored task from Trash", todo_title=todo.title)
        db.add(log)
        
        await db.commit()
        await db.refresh(todo)
        return todo

    async def toggle_complete(self, db: AsyncSession, owner_id: int, id: int) -> Todo:
        """Toggle task completion status."""
        todo = await self.get_todo_or_raise(db, id, owner_id)
        new_status = not todo.completed
        
        todo = await todo_repository.update(db, db_obj=todo, obj_in={"completed": new_status})
        
        action = "Completed task" if new_status else "Marked task pending"
        log = UserActivityLog(user_id=owner_id, action=action, todo_title=todo.title)
        db.add(log)
        
        await db.commit()
        await db.refresh(todo)
        return todo

    async def toggle_favorite(self, db: AsyncSession, owner_id: int, id: int) -> Todo:
        """Toggle favorite task status."""
        todo = await self.get_todo_or_raise(db, id, owner_id)
        new_fav = not todo.favorite
        
        todo = await todo_repository.update(db, db_obj=todo, obj_in={"favorite": new_fav})
        
        action = "Favorited task" if new_fav else "Unfavorited task"
        log = UserActivityLog(user_id=owner_id, action=action, todo_title=todo.title)
        db.add(log)
        
        await db.commit()
        await db.refresh(todo)
        return todo

    async def toggle_archive(self, db: AsyncSession, owner_id: int, id: int) -> Todo:
        """Toggle archived task status."""
        todo = await self.get_todo_or_raise(db, id, owner_id)
        new_archived = not todo.archived
        
        todo = await todo_repository.update(db, db_obj=todo, obj_in={"archived": new_archived})
        
        action = "Archived task" if new_archived else "Unarchived task"
        log = UserActivityLog(user_id=owner_id, action=action, todo_title=todo.title)
        db.add(log)
        
        await db.commit()
        await db.refresh(todo)
        return todo

    async def get_dashboard_details(self, db: AsyncSession, owner_id: int) -> Dict[str, Any]:
        """Aggregate stats, recent activity logs, and productivity trends."""
        # 1. Fetch count stats
        stats = await todo_repository.get_dashboard_stats(db, owner_id)

        # 2. Fetch recent activity logs
        activities_query = (
            select(UserActivityLog)
            .filter(UserActivityLog.user_id == owner_id)
            .order_by(UserActivityLog.created_at.desc())
            .limit(10)
        )
        act_res = await db.execute(activities_query)
        recent_activities = act_res.scalars().all()

        # 3. Fetch productivity trends (last 7 days completed tasks counts)
        now = datetime.datetime.utcnow()
        today_start = datetime.datetime(now.year, now.month, now.day)
        
        productivity_stats = []
        for i in range(6, -1, -1):
            date_val = today_start - datetime.timedelta(days=i)
            next_date_val = date_val + datetime.timedelta(days=1)
            
            res = await db.execute(
                select(func.count(Todo.id)).filter(
                    Todo.owner_id == owner_id,
                    Todo.completed == True,
                    Todo.updated_at >= date_val,
                    Todo.updated_at < next_date_val,
                    Todo.deleted == False
                )
            )
            count = res.scalar() or 0
            productivity_stats.append({
                "date": date_val.strftime("%Y-%m-%d"),
                "completed_count": count
            })

        stats["recent_activities"] = recent_activities
        stats["productivity_stats"] = productivity_stats
        return stats

    async def export_todos_csv(self, db: AsyncSession, owner_id: int) -> str:
        """Export user tasks to a CSV string."""
        todos_res = await db.execute(
            select(Todo).filter(Todo.owner_id == owner_id, Todo.deleted == False)
        )
        todos = todos_res.scalars().all()
        
        data = []
        for t in todos:
            data.append({
                "title": t.title,
                "description": t.description or "",
                "completed": t.completed,
                "priority": t.priority,
                "due_date": t.due_date.strftime("%Y-%m-%d %H:%M:%S") if t.due_date else "",
                "category": t.category,
                "tags": t.tags or "",
                "favorite": t.favorite,
                "archived": t.archived
            })
            
        df = pd.DataFrame(data)
        # Handle empty Dataframe headers
        if df.empty:
            df = pd.DataFrame(columns=["title", "description", "completed", "priority", "due_date", "category", "tags", "favorite", "archived"])
        return df.to_csv(index=False)

    async def import_todos_csv(self, db: AsyncSession, owner_id: int, csv_content: str) -> int:
        """Import user tasks from a CSV string."""
        try:
            df = pd.read_csv(io.StringIO(csv_content))
        except Exception as e:
            raise BadRequestException(f"Invalid CSV structure: {str(e)}", code="INVALID_CSV")

        required_cols = ["title"]
        for col in required_cols:
            if col not in df.columns:
                raise BadRequestException(f"Missing required CSV column: {col}", code="INVALID_CSV")

        imported_count = 0
        for _, row in df.iterrows():
            title = str(row["title"])
            if not title or pd.isna(row["title"]) or not title.strip():
                continue
            
            description = str(row["description"]) if "description" in df.columns and pd.notna(row["description"]) else None
            completed = bool(row["completed"]) if "completed" in df.columns and pd.notna(row["completed"]) else False
            priority = str(row["priority"]) if "priority" in df.columns and pd.notna(row["priority"]) else "medium"
            if priority not in ["low", "medium", "high"]:
                priority = "medium"
                
            due_date = None
            if "due_date" in df.columns and pd.notna(row["due_date"]) and str(row["due_date"]).strip():
                due_val = str(row["due_date"]).strip()
                try:
                    due_date = datetime.datetime.strptime(due_val, "%Y-%m-%d %H:%M:%S")
                except ValueError:
                    try:
                        due_date = datetime.datetime.strptime(due_val, "%Y-%m-%d")
                    except ValueError:
                        pass
            
            category = str(row["category"]) if "category" in df.columns and pd.notna(row["category"]) else "Inbox"
            tags = str(row["tags"]) if "tags" in df.columns and pd.notna(row["tags"]) else None
            favorite = bool(row["favorite"]) if "favorite" in df.columns and pd.notna(row["favorite"]) else False
            archived = bool(row["archived"]) if "archived" in df.columns and pd.notna(row["archived"]) else False
            
            todo = Todo(
                title=title,
                description=description,
                completed=completed,
                priority=priority,
                due_date=due_date,
                category=category,
                tags=tags,
                favorite=favorite,
                archived=archived,
                owner_id=owner_id
            )
            db.add(todo)
            imported_count += 1
            
        if imported_count > 0:
            log = UserActivityLog(user_id=owner_id, action=f"Imported {imported_count} tasks from CSV")
            db.add(log)
            await db.commit()
            
        return imported_count

todo_service = TodoService()

import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, File, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.repositories.todo import todo_repository
from app.schemas.todo import TodoCreate, TodoUpdate, TodoResponse, TodoListResponse
from app.services.todo import todo_service

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("", response_model=TodoListResponse)
async def get_todos(
    search: Optional[str] = Query(None),
    completed: Optional[bool] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    favorite: Optional[bool] = Query(None),
    archived: bool = Query(False),
    deleted: bool = Query(False),
    due_today: Optional[bool] = Query(None),
    overdue: Optional[bool] = Query(None),
    sort_by: str = Query("newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve tasks with optional filters, search, sort options, and pagination."""
    skip = (page - 1) * limit
    todos, total = await todo_repository.get_by_user(
        db,
        owner_id=current_user.id,
        search=search,
        completed=completed,
        priority=priority,
        category=category,
        tag=tag,
        favorite=favorite,
        archived=archived,
        deleted=deleted,
        due_today=due_today,
        overdue=overdue,
        sort_by=sort_by,
        skip=skip,
        limit=limit
    )
    
    pages = math.ceil(total / limit) if total > 0 else 1
    return {
        "todos": todos,
        "total": total,
        "page": page,
        "pages": pages
    }

@router.get("/export-csv")
async def export_todos(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Export user tasks to a CSV file."""
    csv_str = await todo_service.export_todos_csv(db, current_user.id)
    
    # Return as dynamic CSV stream file
    stream = io.StringIO(csv_str)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=todos.csv"
    return response

@router.post("/import-csv", status_code=status.HTTP_201_CREATED)
async def import_todos(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Import tasks from an uploaded CSV file."""
    contents = await file.read()
    csv_content = contents.decode("utf-8")
    
    count = await todo_service.import_todos_csv(db, current_user.id, csv_content)
    return {"success": True, "message": f"Successfully imported {count} tasks.", "imported_count": count}

@router.get("/{id}", response_model=TodoResponse)
async def get_todo(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a single task details."""
    return await todo_service.get_todo_or_raise(db, id, current_user.id)

@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_in: TodoCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new task."""
    return await todo_service.create_todo(db, current_user.id, todo_in)

@router.put("/{id}", response_model=TodoResponse)
async def update_todo(
    id: int,
    todo_in: TodoUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a task's parameters."""
    return await todo_service.update_todo(db, current_user.id, id, todo_in)

@router.delete("/{id}", response_model=dict)
async def delete_todo(
    id: int,
    permanent: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Soft-delete task (send to Trash) or permanently delete it."""
    await todo_service.delete_todo(db, current_user.id, id, permanent)
    return {"success": True, "message": "Task deleted successfully."}

@router.patch("/{id}/complete", response_model=TodoResponse)
async def toggle_todo_complete(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle completed state."""
    return await todo_service.toggle_complete(db, current_user.id, id)

@router.patch("/{id}/favorite", response_model=TodoResponse)
async def toggle_todo_favorite(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle favorited state."""
    return await todo_service.toggle_favorite(db, current_user.id, id)

@router.patch("/{id}/archive", response_model=TodoResponse)
async def toggle_todo_archive(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle archived state."""
    return await todo_service.toggle_archive(db, current_user.id, id)

@router.patch("/{id}/restore", response_model=TodoResponse)
async def restore_todo(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Restore soft-deleted task from the trash bin."""
    return await todo_service.restore_todo(db, current_user.id, id)

import io

import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, field_validator

class TodoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    completed: bool = False
    priority: str = "medium"  # "low", "medium", "high"
    due_date: Optional[datetime.datetime] = None
    category: str = "Inbox"
    tags: Optional[List[str]] = []
    favorite: bool = False
    archived: bool = False

class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    due_date: Optional[datetime.datetime] = None
    category: Optional[str] = "Inbox"
    tags: Optional[List[str]] = []

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    due_date: Optional[datetime.datetime] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    favorite: Optional[bool] = None
    archived: Optional[bool] = None
    deleted: Optional[bool] = None

class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool
    priority: str
    due_date: Optional[datetime.datetime] = None
    category: str
    tags: List[str] = []
    favorite: bool
    archived: bool
    deleted: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime
    owner_id: int

    @field_validator("tags", mode="before")
    @classmethod
    def parse_tags(cls, v: Any) -> List[str]:
        """Convert stored comma-separated string to list of tags."""
        if isinstance(v, str):
            if not v.strip():
                return []
            return [t.strip() for t in v.split(",") if t.strip()]
        return v or []

    class Config:
        from_attributes = True

class TodoListResponse(BaseModel):
    todos: List[TodoResponse]
    total: int
    page: int
    pages: int

# Activity Log Schema
class ActivityLogResponse(BaseModel):
    id: int
    action: str
    todo_title: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Dashboard Stats Response
class DashboardStatsResponse(BaseModel):
    total: int
    completed: int
    pending: int
    overdue: int
    due_today: int
    completion_percentage: float
    recent_activities: List[ActivityLogResponse] = []
    productivity_stats: List[Dict[str, Any]] = []  # Completion counts by date


import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    priority = Column(String, default="medium", nullable=False)  # "low", "medium", "high"
    due_date = Column(DateTime, nullable=True)
    category = Column(String, default="Inbox", nullable=False, index=True)
    tags = Column(String, nullable=True)  # Comma-separated strings, e.g. "work,urgent"
    favorite = Column(Boolean, default=False, nullable=False)
    archived = Column(Boolean, default=False, nullable=False)
    deleted = Column(Boolean, default=False, nullable=False)  # Soft delete for trash bin
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="todos")

import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    semester_id = Column(UUID(as_uuid=True), ForeignKey("semesters.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)
    professor = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    color = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    semester = relationship("Semester", back_populates="subjects")
    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="subject", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="subject", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="subject", cascade="all, delete-orphan")
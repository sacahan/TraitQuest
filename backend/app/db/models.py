from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.session import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id = Column(String, unique=True, nullable=False, index=True)
    display_name = Column(String)
    level = Column(Integer, default=1)
    exp = Column(Integer, default=0)
    hero_class_id = Column(String, nullable=True)
    hero_avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserQuest(Base):
    __tablename__ = "user_quests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    quest_type = Column(String)  # mbti, big5, disc, enneagram, gallup
    interactions = Column(JSONB, default=list)  # List of dialogue objects
    hero_chronicle = Column(Text)  # Hero chronicle summary
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Trait(Base):
    __tablename__ = "traits"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    final_report = Column(JSONB, default=dict)  # Snapshot of hero panel
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class GameDefinition(Base):
    __tablename__ = "game_definitions"
    
    id = Column(String, primary_key=True)  # e.g., "CLS_INTJ"
    category = Column(String, index=True)  # class, race, talent, stance
    name = Column(String)
    metadata_info = Column(JSONB, default=dict) # Metadata for the asset


from sqlalchemy import create_engine, Column, String, Integer, Boolean, ForeignKey, JSON, Float, Text, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import uuid
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./traps.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# --- Educational Hierarchy Models ---

class ClassGrade(Base):
    __tablename__ = "classes"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    class_name = Column(String, unique=True) # "Grade 9", "Grade 10"
    subjects = relationship("Subject", back_populates="grade_class")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    class_id = Column(String, ForeignKey("classes.id"))
    subject_name = Column(String) # "Mathematics", "Physics"
    
    grade_class = relationship("ClassGrade", back_populates="subjects")
    books = relationship("Book", back_populates="subject")

class Book(Base):
    __tablename__ = "books"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    subject_id = Column(String, ForeignKey("subjects.id"))
    book_name = Column(String)
    file_path = Column(String, nullable=True) # Local path to uploaded PDF
    processed = Column(Boolean, default=False) # Whether chapters/topics have been extracted
    
    subject = relationship("Subject", back_populates="books")
    chapters = relationship("Chapter", back_populates="book")

class Chapter(Base):
    __tablename__ = "chapters"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    book_id = Column(String, ForeignKey("books.id"))
    chapter_name = Column(String)
    chapter_number = Column(Integer)
    page_start = Column(Integer) # Page number in PDF
    page_end = Column(Integer)
    content_summary = Column(Text, nullable=True)
    
    book = relationship("Book", back_populates="chapters")
    generated_questions = relationship("GeneratedExamQuestion", back_populates="chapter")

class GeneratedExamQuestion(Base):
    __tablename__ = "generated_questions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chapter_id = Column(String, ForeignKey("chapters.id"))
    
    question_text = Column(Text)
    options = Column(JSON, nullable=True) # For MCQs, stored as JSON list
    correct_answer = Column(Text)
    explanation = Column(Text) # Detailed explanation
    question_type = Column(String) # "MCQ", "Short", "Long"
    topic_tag = Column(String) # Topic identified by AI
    
    difficulty_level = Column(String) # Easy, Medium, Hard
    exam_probability_score = Column(Float, default=0.5) 
    is_most_important = Column(Boolean, default=False)
    reference_page = Column(Integer, nullable=True) # Page number for reference
    
    chapter = relationship("Chapter", back_populates="generated_questions")

def init_db():
    Base.metadata.create_all(bind=engine)

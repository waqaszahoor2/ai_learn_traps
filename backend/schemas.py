
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any

class ClassGradeSchema(BaseModel):
    id: str
    class_name: str
    model_config = ConfigDict(from_attributes=True)

class SubjectSchema(BaseModel):
    id: str
    subject_name: str
    class_id: str
    model_config = ConfigDict(from_attributes=True)

class BookSchema(BaseModel):
    id: str
    book_name: str
    subject_id: str
    processed: bool
    model_config = ConfigDict(from_attributes=True)

class ChapterSchema(BaseModel):
    id: str
    chapter_name: str
    chapter_number: int
    content_summary: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class QuestionSchema(BaseModel):
    id: str
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: Optional[str] = None
    question_type: str
    difficulty_level: str
    reference_page: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

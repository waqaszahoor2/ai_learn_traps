
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from models import SessionLocal, init_db, ClassGrade, Subject, Book, Chapter, GeneratedExamQuestion
from pdf_service import pdf_service
from schemas import BookSchema, ChapterSchema, QuestionSchema, ClassGradeSchema, SubjectSchema
import os

app = FastAPI(title="AI Exam Generator API")

# Mount upload directory to serve PDFs
from fastapi.staticfiles import StaticFiles
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Hierarchical Endpoints ---

@app.get("/classes", response_model=List[ClassGradeSchema])
def get_classes(db: Session = Depends(get_db)):
    return db.query(ClassGrade).all()

@app.get("/subjects/{class_id}", response_model=List[SubjectSchema])
def get_subjects(class_id: str, db: Session = Depends(get_db)):
    return db.query(Subject).filter(Subject.class_id == class_id).all()

@app.post("/upload_book")
async def upload_book(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    subject_id: str = Form(...),
    db: Session = Depends(get_db)
):
    # Save Upload
    book = await pdf_service.save_upload(file=file, subject_id=subject_id, db=db)
    
    # Launch Background Processing
    background_tasks.add_task(pdf_service.process_pdf, book.id, db)
    
    return {"message": "Upload successful. Processing started.", "book_id": book.id}

@app.get("/books/{subject_id}", response_model=List[BookSchema])
def get_books(subject_id: str, db: Session = Depends(get_db)):
    return db.query(Book).filter(Book.subject_id == subject_id).all()

@app.get("/chapters/{book_id}", response_model=List[ChapterSchema])
def get_chapters(book_id: str, db: Session = Depends(get_db)):
    return db.query(Chapter).filter(Chapter.book_id == book_id).all()

@app.get("/questions/{chapter_id}", response_model=List[QuestionSchema])
def get_questions(chapter_id: str, db: Session = Depends(get_db)):
    qs = db.query(GeneratedExamQuestion).filter(GeneratedExamQuestion.chapter_id == chapter_id).all()
    # Pydantic will handle JSON field logic via `from_attributes` hopefully if the DB model has it as JSON
    return qs

@app.post("/seed")
def seed(db: Session = Depends(get_db)):
    if db.query(ClassGrade).first():
        return {"msg": "Already seeded"}
        
    classes = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"]
    subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"]
    
    for c in classes:
        cg = ClassGrade(class_name=c)
        db.add(cg)
        db.commit()
        db.refresh(cg)
        
        for s in subjects:
            sub = Subject(class_id=cg.id, subject_name=s)
            db.add(sub)
        db.commit()
    return {"msg": "Seeded"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

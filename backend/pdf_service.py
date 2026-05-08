
import pdfplumber
import os
import shutil
import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from models import Book, Chapter
from ai_service import ai_service, AIService
from fastapi import UploadFile

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

class PDFService:
    def __init__(self):
        pass

    async def save_upload(self, file: UploadFile, subject_id: str, db: Session) -> Book:
        """
        Saves PDF to disk and creates initial DB entry.
        """
        file_loc = os.path.join(UPLOAD_DIR, f"{subject_id}_{file.filename}")
        with open(file_loc, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Create Book entry
        book = Book(
            subject_id=subject_id,
            book_name=file.filename,
            file_path=file_loc,
            processed=False
        )
        db.add(book)
        db.commit()
        db.refresh(book)
        return book

    def process_pdf(self, book_id: str, db: Session):
        """
        Background task:
        1. Extract text from PDF.
        2. Identify Chapters via TOC or Regex.
        3. If no chapters detected, treat whole file as one chapter.
        4. Generate questions for each chapter.
        """
        book = db.query(Book).filter(Book.id == book_id).first()
        if not book or not book.file_path:
            return

        print(f"Processing Book: {book.book_name}")
        
        full_text = []
        page_map = {} # page_num -> text

        with pdfplumber.open(book.file_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                page_map[i+1] = text
                full_text.append((i+1, text))
        
        # --- Heuristic Chapter Detection ---
        # Look for "Chapter X" in large font or centered text.
        # Since pdfplumber gives layout info, we could use that. Here we use regex on text.
        
        chapters = []
        current_chapter = None
        current_start_page = 1
        
        chapter_pattern = re.compile(r"^(Chapter|Unit)\s+(\d+)", re.IGNORECASE)
        
        for p_num, text in full_text:
            lines = text.split('\n')
            for line in lines[:5]: # Check first few lines of page for header
                match = chapter_pattern.match(line.strip())
                if match:
                    # New Chapter Found
                    if current_chapter:
                        # Close previous
                        current_chapter['end'] = p_num - 1
                        chapters.append(current_chapter)
                    
                    current_chapter = {
                        'name': line.strip(),
                        'number': int(match.group(2)),
                        'start': p_num,
                        'end': p_num, # minimal
                        'content': []
                    }
                    break
            
            if current_chapter:
                current_chapter['content'].append(text)
            else:
                # If no chapter yet, buffer content (maybe Prologue)
                pass

        # Close last check
        if current_chapter:
            current_chapter['end'] = len(page_map)
            chapters.append(current_chapter)
        
        # If no chapters found, make one giant chapter
        if not chapters:
            chapters.append({
                'name': "Full Document",
                'number': 1,
                'start': 1,
                'end': len(page_map),
                'content': list(page_map.values())
            })

        # --- Save Chapters & Generate Questions ---
        for chap_data in chapters:
            content_str = "\n".join(chap_data['content'])
            
            # Create DB Chapter
            db_chap = Chapter(
                book_id=book.id,
                chapter_name=chap_data['name'],
                chapter_number=chap_data['number'],
                page_start=chap_data['start'],
                page_end=chap_data['end'],
                content_summary=content_str[:500] if content_str else ""
            )
            db.add(db_chap)
            db.commit()
            db.refresh(db_chap)
            
            # Generate Questions
            # Pass text + page mapping to AI service
            questions = ai_service.generate_questions_from_text(content_str, chap_data['start'])
            
            from models import GeneratedExamQuestion
            
            for q in questions:
                # Clean up empty optional fields
                opts = q.get('options')
                # Ensure JSON serializable lists
                
                db_q = GeneratedExamQuestion(
                    chapter_id=db_chap.id,
                    question_text=q['question'],
                    options=opts,
                    correct_answer=q['answer'],
                    explanation=q.get('explanation', ''),
                    question_type=q['type'],
                    topic_tag=q.get('topic', 'General'),
                    difficulty_level=q.get('difficulty', 'Medium'),
                    reference_page=q.get('ref_page'),
                    exam_probability_score=0.8 if q['type'] == 'MCQ' else 0.6,
                    is_most_important=True
                )
                db.add(db_q)
            db.commit()

        book.processed = True
        db.add(book)
        db.commit()
        print(f"Finished processing {book.book_name}")

pdf_service = PDFService()

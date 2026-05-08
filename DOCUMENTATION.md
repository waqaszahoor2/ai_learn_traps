# Intelligent Textbook-Based Exam Question Generator System

## 1. System Architecture

### Overview
The system is designed as a client-server application. The backend handles data storage, textbook processing, and AI question generation. The frontend (mobile app) provides an intuitive interface for students to select their curriculum and generate practice exams.

### Components
1.  **Mobile App (Frontend)**:
    *   Built with React Native (Expo).
    *   Responsibility: User Interface, State Management, API Communication.
    *   Key Screens: Class Selection, Subject Selection, Book Selection, Chapter Selection, Exam Generator.

2.  **Backend API**:
    *   Built with Python (FastAPI).
    *   Responsibility: Business Logic, Database Orchestration, AI Processing.
    *   Key Endpoints: `/classes`, `/subjects`, `/books`, `/generate-exam`.

3.  **Database**:
    *   SQLite (Dev) / MySQL (Prod).
    *   Responsibility: Relational Data Storage.
    *   Schema:
        *   `ClassGrade` -> `Subject` -> `Book` -> `Chapter`
        *   `TextbookQuestion` -> `GeneratedExamQuestion`
        *   `User` -> `StudentResponse`

4.  **AI Engine**:
    *   Python-based (Spacy/NLTK simulated).
    *   Responsibility: Pattern Recognition, Question Variant Generation, Probability Scoring.

### Flowchart
[User] -> [Select Class] -> [Select Subject] -> [Select Book] -> [Select Chapter] -> [Request Exam]
                                                                        |
                                                                        v
                                                                 [Backend API]
                                                                        |
                                                                 [Check DB for Questions]
                                                                 /            \
                                                            [Yes]              [No]
                                                              |                  |
                                                          [Return]         [Simulate Extraction]
                                                                             |
                                                                       [Generate Variants]
                                                                             |
                                                                       [Save to DB]
                                                                             |
                                                                        [Return]

## 2. Deployment Instructions

### Backend (Python)
1.  Navigate to `backend/` directory.
2.  Create a virtual environment: `python -m venv venv`.
3.  Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux).
4.  Install dependencies: `pip install fastapi uvicorn sqlalchemy spacy`.
5.  Run the server: `python main.py` or `uvicorn main:app --reload`.
6.  Access API Docs at: `http://localhost:8000/docs`.

### Frontend (Mobile)
1.  Navigate to `mobile/` directory.
2.  Install dependencies: `npm install`.
3.  Ensure your device/emulator is connected.
4.  Run: `npx expo start`.
5.  Press `a` for Android or `i` for iOS.
    *   *Note*: Ensure `src/api.ts` points to the correct IP (10.0.2.2 for Android Emulator, localhost for iOS simulator).

## 3. Database Schema

The system uses a relational model designed for hierarchical educational data.

- **Classes**: Represents academic years (Class 9, 10, etc.).
- **Subjects**: Linked to Classes (Math, Physics).
- **Books**: Specific textbooks for a subject.
- **Chapters**: Granular units of a book.
- **TextbookQuestions**: Raw questions extracted or simulated from the book context.
- **GeneratedExamQuestions**: AI-enhanced variants with metadata:
    - `exam_probability_score`: Likelihood of appearing in board exams (0.0 - 1.0).
    - `difficulty_level`: "Easy", "Medium", "Hard".
    - `is_most_important`: Boolean flag for high-priority questions.

## 4. AI Logic & Academic Defense

### Algorithm Strategy
The Question Generator uses a hybrid approach:
1.  **Keyword Extraction**: Identifies core entities in a chapter summary (e.g., "Newton's Laws", "DNA").
2.  **Template Matching**: Maps key concepts to question templates ("Define {concept}", "Calculate {val} given {concept}").
3.  **Probabilistic Scoring**: Assigns importance based on keyword frequency in "past papers" (simulated dataset) and complexity of the topic.

### Evaluation Metrics
For a Final Year Project (FYP), evaluate the system using:
1.  **Relevance**: Do generated questions align with the chapter topic? (Human evaluation).
2.  **Difficulty Distribution**: Does the system generate a balanced mix of Easy/Medium/Hard questions?
3.  **Latency**: Time taken to generate an exam set (Target: < 2 seconds).

## 5. Security & Legal
-   This system uses **Simulated Data** for demonstration.
-   No copyrighted textbooks are stored or processed without authorization.
-   The "Textbook Extraction" module is a simulation to prove the architectural concept without infringing on IP.

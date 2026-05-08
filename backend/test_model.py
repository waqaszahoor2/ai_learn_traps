
import sys
import os
import json

# Add backend directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_service import ai_service

def test_ai_model():
    print("=== Testing AI Exam Generator Model ===")
    
    # 1. Simulate Textbook Extraction
    chapter_name = "Chapter 4: Newton's Laws of Motion"
    print(f"\n[input] Simulating extraction for: '{chapter_name}'")
    
    extracted_questions = ai_service.simulate_textbook_extraction(chapter_name)
    print(f"[output] Extracted {len(extracted_questions)} base questions from textbook logic.")
    
    for i, q in enumerate(extracted_questions, 1):
        print(f"\n--- Question {i} (Base) ---")
        print(f"Type: {q['type']}")
        print(f"Text: {q['text']}")
        print(f"Answer: {q['answer']}")
        
        # 2. Generate Exam Variant
        print(f"\n  >>> Generating Exam Variant...")
        variant = ai_service.generate_exam_variant(q['text'], q['answer'], q['type'])
        
        print(f"  Generated Question: {variant['question']}")
        print(f"  Difficulty: {variant['difficulty']}")
        print(f"  Probability Score: {variant['probability']}")
        print(f"  Is Important: {variant['is_important']}")
        if variant.get('options'):
            print(f"  Options: {variant['options']}")
        print(f"  Correct Answer: {variant['answer']}")

if __name__ == "__main__":
    test_ai_model()

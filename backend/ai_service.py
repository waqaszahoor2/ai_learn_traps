
import random
from typing import List, Dict, Any

class AIService:
    def __init__(self):
        self.nlp = None

    def _load_nlp(self):
        if not self.nlp:
            import spacy
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except:
                self.nlp = None

    def extract_topics(self, text: str) -> List[str]:
        self._load_nlp()
        if not self.nlp:
            return ["General"]
            
        doc = self.nlp(text)
        topics = [ent.text for ent in doc.ents if ent.label_ in ["ORG", "PERSON", "GPE", "WORK_OF_ART", "EVENT", "LAW"]]
        noun_chunks = [chunk.text for chunk in doc.noun_chunks if len(chunk.text.split()) < 4]
        
        all_candidates = topics + noun_chunks
        from collections import Counter
        counts = Counter(all_candidates)
        
        return [item for item, _ in counts.most_common(10)]

    def generate_questions_from_text(self, text: str, page_num: int) -> List[Dict[str, Any]]:
        self._load_nlp()
        if not self.nlp:
            return []
            
        doc = self.nlp(text)
        questions = []
        
        sentences = list(doc.sents)
        valid_sentences = [s for s in sentences if 10 < len(s.text.split()) < 40]
        
        # --- 1. Generate MCQs (Cloze) ---
        for sent in random.sample(valid_sentences, min(len(valid_sentences), 5)):
            tokens = [t for t in sent if t.pos_ in ["NOUN", "PROPN"] and not t.is_stop]
            if not tokens:
                continue
                
            target = random.choice(tokens)
            masked_text = sent.text.replace(target.text, "______")
            
            # Generate options
            all_nouns = [t.text for t in doc if t.pos_ in ["NOUN", "PROPN"] and t.text != target.text]
            distractors = random.sample(all_nouns, min(len(all_nouns), 3)) if len(all_nouns) >= 3 else ["None", "All", "Other"]
            options = [target.text] + distractors
            random.shuffle(options)
            
            questions.append({
                "type": "MCQ",
                "question": f"Complete the statement: {masked_text}",
                "options": options,
                "answer": target.text,
                "explanation": f"In the context: '{sent.text}'",
                "difficulty": "Easy",
                "topic": target.text,
                "ref_page": page_num
            })

        # --- 2. Generate Short Questions (Definitions) ---
        def_patterns = ["is a", "is defined as", "refers to", "known as"]
        for sent in valid_sentences:
            for pat in def_patterns:
                if pat in sent.text.lower():
                    parts = sent.text.lower().split(pat)
                    subject = parts[0].strip()
                    if len(subject.split()) < 5:
                        questions.append({
                            "type": "Short",
                            "question": f"Define or explain what '{subject}' refers to.",
                            "options": None,
                            "answer": sent.text,
                            "explanation": "Definition found in text.",
                            "difficulty": "Medium",
                            "topic": subject, 
                            "ref_page": page_num
                        })
                        break

        # --- 3. Generate Long Questions ---
        topics = self.extract_topics(text)
        for topic in topics[:2]:
            questions.append({
                "type": "Long",
                "question": f"Explain the significance of {topic} in detail based on this chapter.",
                "options": None,
                "answer": f"Refer to page {page_num} for details on {topic}.",
                "explanation": "Long answer questions require synthesizing information.",
                "difficulty": "Hard",
                "topic": topic,
                "ref_page": page_num
            })
            
        return questions

ai_service = AIService()

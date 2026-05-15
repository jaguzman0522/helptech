import re
from typing import List, Dict, Optional
from pydantic import BaseModel

class Keyword(BaseModel):
    term: str
    weight: float = 1.0

class CategoryRule(BaseModel):
    id: int
    name: str
    keywords: List[Keyword]

class DepartmentRule(BaseModel):
    id: int
    name: str
    categories: List[CategoryRule]

# BASE RULES
BASE_RULES = [
    DepartmentRule(
        id=1, name="IT",
        categories=[
            CategoryRule(id=3, name="Hardware / Printing", keywords=[
                Keyword(term='impresion', weight=2), Keyword(term='toner', weight=2),
                Keyword(term='computadora', weight=2), Keyword(term='pantalla', weight=2),
                Keyword(term='servidor', weight=3), Keyword(term='ups', weight=2)
            ]),
            CategoryRule(id=2, name="Networks", keywords=[
                Keyword(term='wifi', weight=3), Keyword(term='internet', weight=3),
                Keyword(term='lento', weight=2), Keyword(term='conexion', weight=2)
            ]),
            CategoryRule(id=4, name="Software / System", keywords=[
                Keyword(term='ventasmart', weight=5), Keyword(term='error', weight=1),
                Keyword(term='login', weight=2), Keyword(term='factura', weight=3),
                Keyword(term='inventario', weight=3), Keyword(term='caja', weight=4)
            ])
        ]
    ),
    DepartmentRule(
        id=2, name="Maintenance",
        categories=[
            CategoryRule(id=7, name="Electricity", keywords=[
                Keyword(term='luz', weight=2), Keyword(term='corto', weight=3),
                Keyword(term='breaker', weight=3), Keyword(term='voltaje', weight=2)
            ]),
            CategoryRule(id=8, name="HVAC", keywords=[
                Keyword(term='aire', weight=3), Keyword(term='frio', weight=2),
                Keyword(term='ac', weight=3), Keyword(term='calor', weight=2)
            ])
        ]
    )
]

class RuleClassifier:
    def __init__(self):
        # Panic Words (Immediate High Priority)
        self.PANIC_WORDS = {
            "humo": "CRITICAL", "fuego": "CRITICAL", "incendio": "CRITICAL",
            "corto": "CRITICAL", "inundacion": "CRITICAL", "explosion": "CRITICAL",
            "robado": "HIGH", "urgente": "HIGH", "bloqueado": "HIGH"
        }

    def normalize(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r'[áéíóú]', lambda x: {'á':'a','é':'e','í':'i','ó':'o','ú':'u'}[x.group()], text)
        return re.sub(r'[^a-z0-9\s]', ' ', text)

    def get_stem(self, word: str) -> str:
        if len(word) > 4:
            return word[:int(len(word) * 0.7)]
        return word

    def classify(self, text: str) -> Dict:
        text_norm = self.normalize(text)
        ticket_words = text_norm.split()
        
        best_depto = 1
        best_cat = 8
        max_score = 0
        detected_priority = "MEDIUM"

        # 1. Panic Filter
        for word in ticket_words:
            if word in self.PANIC_WORDS:
                detected_priority = self.PANIC_WORDS[word]

        # 2. Scoring with Stems
        for depto in BASE_RULES:
            for cat in depto.categories:
                score = 0
                for kw in cat.keywords:
                    term_norm = self.normalize(kw.term)
                    # Exact Match
                    if term_norm in text_norm:
                        score += kw.weight
                    # Partial Match (Stem)
                    else:
                        stem = self.get_stem(term_norm)
                        if stem in text_norm:
                            score += kw.weight * 0.5
                
                if score > max_score:
                    max_score = score
                    best_depto = depto.id
                    best_cat = cat.id

        confidence = min(100, int((max_score / 5) * 100)) if max_score > 0 else 0
        
        return {
            "department_id": best_depto,
            "category_id": best_cat,
            "priority": detected_priority,
            "confidence": confidence,
            "method": "deterministic_rules"
        }

rule_classifier = RuleClassifier()

rule_classifier = RuleClassifier()

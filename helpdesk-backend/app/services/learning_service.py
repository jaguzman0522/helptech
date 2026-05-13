import json
import os
from typing import Dict
from app.services.rule_classifier import REGLAS_BASE

APRENDIZAJE_PATH = "c:/Users/HDCO-HEALTH/Documents/helpdesk-tech/helpdesk-backend/data/aprendizaje.json"

class LearningService:
    def __init__(self):
        os.makedirs(os.path.dirname(APRENDIZAJE_PATH), exist_ok=True)
        if not os.path.exists(APRENDIZAJE_PATH):
            with open(APRENDIZAJE_PATH, "w") as f:
                json.dump({}, f)

    def registrar_correccion(self, texto_original: str, categoria_id: int, motivo: str = ""):
        """
        Registra palabras clave, dando peso doble a las palabras del motivo del experto.
        """
        try:
            with open(APRENDIZAJE_PATH, "r") as f:
                aprendizaje = json.load(f)
            
            str_cat_id = str(categoria_id)
            if str_cat_id not in aprendizaje:
                aprendizaje[str_cat_id] = {"keywords": {}}
            
            # 1. Procesar texto original (Peso 1)
            palabras_orig = [p for p in texto_original.lower().split() if len(p) > 3]
            for p in palabras_orig:
                current = aprendizaje[str_cat_id]["keywords"].get(p, 0)
                aprendizaje[str_cat_id]["keywords"][p] = current + 1
            
            # 2. Procesar motivo del experto (Peso Doble +2)
            if motivo:
                palabras_motivo = [p for p in motivo.lower().split() if len(p) > 3]
                for p in palabras_motivo:
                    current = aprendizaje[str_cat_id]["keywords"].get(p, 0)
                    aprendizaje[str_cat_id]["keywords"][p] = current + 2
            
            with open(APRENDIZAJE_PATH, "w") as f:
                json.dump(aprendizaje, f, indent=2)
                
            return True
        except Exception as e:
            print(f"Error registrando aprendizaje: {e}")
            return False

learning_service = LearningService()

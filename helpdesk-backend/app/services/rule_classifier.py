import re
from typing import List, Dict, Optional
from pydantic import BaseModel

class Keyword(BaseModel):
    termino: str
    peso: float = 1.0

class CategoriaRegla(BaseModel):
    id: int
    nombre: str
    keywords: List[Keyword]

class DepartamentoRegla(BaseModel):
    id: int
    nombre: str
    categorias: List[CategoriaRegla]

# REGLAS MIGRADAS Y MEJORADAS
REGLAS_BASE = [
    DepartamentoRegla(
        id=1, nombre="TI",
        categorias=[
            CategoriaRegla(id=3, nombre="Hardware / Impresión", keywords=[
                Keyword(termino='impresion', peso=2), Keyword(termino='toner', peso=2),
                Keyword(termino='computadora', peso=2), Keyword(termino='pantalla', peso=2),
                Keyword(termino='servidor', peso=3), Keyword(termino='ups', peso=2)
            ]),
            CategoriaRegla(id=2, nombre="Redes", keywords=[
                Keyword(termino='wifi', peso=3), Keyword(termino='internet', peso=3),
                Keyword(termino='lento', peso=2), Keyword(termino='conexion', peso=2)
            ]),
            CategoriaRegla(id=4, nombre="Software / Sistema", keywords=[
                Keyword(termino='ventasmart', peso=5), Keyword(termino='error', peso=1),
                Keyword(termino='login', peso=2), Keyword(termino='factura', peso=3),
                Keyword(termino='inventario', peso=3), Keyword(termino='caja', peso=4)
            ])
        ]
    ),
    DepartamentoRegla(
        id=2, nombre="Mantenimiento",
        categorias=[
            CategoriaRegla(id=7, nombre="Electricidad", keywords=[
                Keyword(termino='luz', peso=2), Keyword(termino='corto', peso=3),
                Keyword(termino='breaker', peso=3), Keyword(termino='voltaje', peso=2)
            ]),
            CategoriaRegla(id=8, nombre="Climatización", keywords=[
                Keyword(termino='aire', peso=3), Keyword(termino='frio', peso=2),
                Keyword(termino='ac', peso=3), Keyword(termino='calor', peso=2)
            ])
        ]
    )
]

class RuleClassifier:
    def __init__(self):
        # Palabras de Pánico (Prioridad Crítica Inmediata)
        self.PANIC_WORDS = {
            "humo": "CRITICA", "fuego": "CRITICA", "incendio": "CRITICA",
            "corto": "CRITICA", "inundacion": "CRITICA", "explosion": "CRITICA",
            "robado": "ALTA", "urgente": "ALTA", "bloqueado": "ALTA"
        }

    def normalizar(self, texto: str) -> str:
        texto = texto.lower()
        texto = re.sub(r'[áéíóú]', lambda x: {'á':'a','é':'e','í':'i','ó':'o','ú':'u'}[x.group()], texto)
        return re.sub(r'[^a-z0-9\s]', ' ', texto)

    def obtener_raiz(self, palabra: str) -> str:
        if len(palabra) > 4:
            return palabra[:int(len(palabra) * 0.7)]
        return palabra

    def clasificar(self, texto: str) -> Dict:
        texto_norm = self.normalizar(texto)
        palabras_ticket = texto_norm.split()
        
        mejor_depto = 1
        mejor_cat = 8
        puntuacion_max = 0
        prioridad_detectada = "MEDIA"

        # 1. Filtro de Pánico (Prioridad)
        for palabra in palabras_ticket:
            if palabra in self.PANIC_WORDS:
                prioridad_detectada = self.PANIC_WORDS[palabra]

        # 2. Scoring con Raíces
        for depto in REGLAS_BASE:
            for cat in depto.categorias:
                puntos = 0
                for kw in cat.keywords:
                    termino_norm = self.normalizar(kw.termino)
                    # Coincidencia Exacta
                    if termino_norm in texto_norm:
                        puntos += kw.peso
                    # Coincidencia Parcial (Raíz)
                    else:
                        raiz = self.obtener_raiz(termino_norm)
                        if raiz in texto_norm:
                            puntos += kw.peso * 0.5
                
                if puntos > puntuacion_max:
                    puntuacion_max = puntos
                    mejor_depto = depto.id
                    mejor_cat = cat.id

        confianza = min(100, int((puntuacion_max / 5) * 100)) if puntuacion_max > 0 else 0
        
        return {
            "departamento_id": mejor_depto,
            "categoria_id": mejor_cat,
            "prioridad": prioridad_detectada,
            "confianza": confianza,
            "metodo": "reglas_deterministas"
        }

rule_classifier = RuleClassifier()

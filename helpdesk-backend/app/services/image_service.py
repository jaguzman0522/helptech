import io
from PIL import Image
from fastapi import UploadFile
import os

class ImageService:
    @staticmethod
    async def optimize_image(file: UploadFile, max_width: int = 1200) -> bytes:
        """
        Lee una imagen, la redimensiona si es necesario y la convierte a WebP
        para ahorrar espacio y mejorar la velocidad de carga.
        """
        # Leer el contenido del archivo
        content = await file.read()
        img = Image.open(io.BytesIO(content))
        
        # Convertir a RGB si es necesario (para evitar problemas con PNG o RGBA en WebP)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        # Redimensionar manteniendo el aspect ratio
        if img.width > max_width:
            aspect_ratio = img.height / img.width
            new_height = int(max_width * aspect_ratio)
            img = img.resize((max_width, new_height), Image.LANCZOS)
            
        # Guardar en memoria como WebP forzado
        output = io.BytesIO()
        # Siempre forzamos el formato WEBP y la calidad 80
        img.save(output, format="WEBP", quality=80, optimize=True, lossless=False)
        return output.getvalue()

    @staticmethod
    async def save_evidence(file: UploadFile, ticket_id: int, type_name: str) -> str:
        """
        Valida, optimiza y guarda una evidencia fotográfica en el servidor local.
        Retorna la URL relativa de la imagen.
        """
        # 1. Validar tamaño (5MB)
        file.file.seek(0, os.SEEK_END)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > 5 * 1024 * 1024:
            raise ValueError("El archivo excede el límite de 5MB.")

        # 2. Optimizar imagen
        optimized_content = await ImageService.optimize_image(file)
        
        # 3. Generar nombre de archivo por auditoría
        timestamp = int(os.times().elapsed * 1000) # Simple timestamp
        import time
        timestamp = int(time.time())
        
        filename = f"ticket-{ticket_id}-{type_name}-{timestamp}.webp"
        filepath = os.path.join("uploads", "evidencias", filename)
        
        # 4. Guardar físicamente
        with open(filepath, "wb") as buffer:
            buffer.write(optimized_content)
            
        return f"/uploads/evidencias/{filename}"

image_service = ImageService()

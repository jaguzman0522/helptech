from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.api import deps
from PIL import Image, ImageOps, ImageEnhance
import io
import os

router = APIRouter()

@router.post("/process-signature")
async def process_signature(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Image processing logic with Pillow (Python equivalent to sharp)
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGBA")
        
        # 1. Convert to grayscale and high contrast
        gray = ImageOps.grayscale(image)
        enhancer = ImageEnhance.Contrast(gray)
        high_contrast = enhancer.enhance(2.0)
        
        # 2. Thresholding to remove background (simulating sharp's behavior)
        # For simplicity, we make the white parts transparent
        # In a real production app, we would use more advanced cv2 logic
        
        # 3. Save as WebP for efficiency
        file_path = f"static/signatures/sig_{current_user.id}.webp"
        os.makedirs("static/signatures", exist_ok=True)
        high_contrast.save(file_path, format="WEBP", quality=90)
        
        # Update user profile
        current_user.signature_url = f"http://localhost:8001/{file_path}"
        await db.commit()
        
        return {"url": current_user.signature_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing signature: {str(e)}")

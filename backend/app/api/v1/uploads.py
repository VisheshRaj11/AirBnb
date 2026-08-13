import os
import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from pydantic import BaseModel

from app.core.config import settings
from app.core.s3 import generate_presigned_url
from app.models.user import User
from app.api.deps import require_role

router = APIRouter(prefix="/uploads", tags=["Uploads"])

class PresignRequest(BaseModel):
    file_name: str
    file_type: str

@router.post("/presign")
def get_presigned_url(
    payload: PresignRequest,
    current_user: User = Depends(require_role("host"))
):
    return generate_presigned_url(payload.file_name, payload.file_type)

@router.post("/local")
async def upload_local_file(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("host"))
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{ext}"
    target_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    try:
        content = await file.read()
        with open(target_path, "wb") as f:
            f.write(content)
        return {
            "url": f"/uploads/{unique_filename}",
            "filename": unique_filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.config.deps import get_db
from ..services.documents import handle_upload

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        result = await handle_upload(file, db)
        return result
    except Exception as e:
        return {"error": str(e)}

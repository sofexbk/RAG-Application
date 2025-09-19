from fastapi import APIRouter
from app.services.qa_utils import ask_with_cache
from app.models.schemas import QARequest

router = APIRouter(prefix="/qa", tags=["qa"])

@router.post("/query")
def query_qa(data: QARequest):

    try:
        return ask_with_cache(data.query, top_k=data.top_k)
    except Exception as e:
        return {"error": str(e)}

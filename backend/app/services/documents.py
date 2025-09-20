import logging
from sqlalchemy.orm import Session
from anthropic import Anthropic
from .ingest import save_upload_file_tmp, extract_text_from_pdf
from .rag import ensure_collection, upsert_document
from .embeddings import embed_texts
from app.models.models import Document
from app.config.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
claude_client = Anthropic(api_key=settings.CLAUDE_API_KEY)

async def handle_upload(file, db: Session):
    logger.info(f"Received file: {file.filename}")
    tmp_path = await save_upload_file_tmp(file)
    logger.info(f"Temporary file saved at: {tmp_path}")

    text = extract_text_from_pdf(tmp_path)
    logger.info(f"Extracted text length: {len(text)} characters")

    doc = Document(title=file.filename, source="upload", uploaded_by=None, text=text)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    logger.info(f"Document saved with ID: {doc.id}")

    # Chunking
    chunks = []
    chunk_size = 1000
    overlap = 200

    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i:i + chunk_size]
        if chunk.strip():
            chunks.append(chunk.strip())

    logger.info(f"Created {len(chunks)} chunks")

    # Create metadata
    metadatas = []
    for i, chunk in enumerate(chunks):
        metadata = {
            "text": chunk,
            "doc_id": doc.id,
            "title": doc.title,
            "filename": file.filename,
            "source": doc.source,
            "chunk_index": i,
            "chunk_id": f"{doc.id}_{i}",
            "created_at": doc.created_at.isoformat() if doc.created_at else None
        }
        metadatas.append(metadata)

    # Vector storage
    ensure_collection(vector_size=384)
    vectors = embed_texts(chunks)
    upsert_document(doc.id, vectors, metadatas)
    logger.info("Document vectors upserted successfully")

    # Generate summary - let Claude detect document language automatically
    claude_response = claude_client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"Create a concise summary of this document. Respond in the document's language, or English if unclear:\n\n{text[:2000]}"
        }]
    )
    summary = claude_response.content[0].text
    logger.info("Claude summary generated")

    return {
        "id": doc.id,
        "title": doc.title,
        "filename": file.filename,
        "chunks": len(chunks),
        "summary": summary,
        "message": "Document uploaded and indexed successfully"
    }
from pathlib import Path
import tempfile
from pypdf import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    text_parts = []
    reader = PdfReader(file_path)
    for page in reader.pages:
        try:
            text_parts.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n".join(text_parts)

async def save_upload_file_tmp(upload_file) -> str:
    suffix = Path(upload_file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await upload_file.read()
        tmp.write(content)
        return tmp.name

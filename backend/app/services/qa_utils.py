from app.config.redis_client import redis_client
from app.services.embeddings import embed_texts
from app.services.rag import search
from anthropic import Anthropic
from app.config.config import settings
import json

client = Anthropic(api_key=settings.CLAUDE_API_KEY)


def ask_with_cache(query: str, top_k: int = 5):
    cache_key = f"qa:{query}:{top_k}"
    cached = redis_client.get(cache_key)

    if cached:
        try:
            cached_data = json.loads(cached)
            return cached_data
        except:
            pass

    vec = embed_texts([query])[0]

    hits = search(vec, top_k=top_k)

    if not hits:
        return {"answer": "Aucun contenu trouvé dans les documents.", "sources": []}

    context_parts = []
    sources = []

    for i, hit in enumerate(hits):
        payload = hit.payload
        text_chunk = payload.get("text", "")

        title = (payload.get("title") or
                 payload.get("document_title") or
                 payload.get("filename") or
                 f"Document {payload.get('doc_id', 'inconnu')}")

        source_info = (payload.get("source") or
                       payload.get("document_source") or
                       "upload")

        doc_id = payload.get("doc_id") or payload.get("document_id", "inconnu")
        chunk_index = payload.get("chunk_index", i)

        if text_chunk:
            context_parts.append(f"[Document: {title}]\n{text_chunk}")

            source_display = {
                "id": f"{doc_id}_{chunk_index}",
                "title": title,
                "source": source_info,
                "document_id": doc_id,
                "chunk_index": chunk_index,
                "chunk_text": text_chunk[:200] + "..." if len(text_chunk) > 200 else text_chunk,
                "score": float(hit.score),
                "match_percentage": f"{int(hit.score * 100)}%",

                "name": title,
                "document_title": title,
                "document_source": source_info,
                "content": text_chunk[:200] + "..." if len(text_chunk) > 200 else text_chunk
            }
            sources.append(source_display)

    if not context_parts:
        return {"answer": "Aucun contenu textuel trouvé.", "sources": []}

    context = "\n\n---\n\n".join(context_parts)

    resp = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""Tu es un assistant qui répond aux questions en se basant uniquement sur les documents fournis.

CONTEXTE DES DOCUMENTS:
{context}

QUESTION: {query}

INSTRUCTIONS:
- Réponds uniquement en français/anglais
- Base-toi UNIQUEMENT sur le contexte fourni
- Si l'information n'est pas dans le contexte, dis-le clairement
- Cite les documents quand c'est pertinent
- Sois précis et concis"""
        }]
    )

    answer = resp.content[0].text

    result = {
        "answer": answer,
        "sources": sources,
        "context_length": len(context),
        "documents_found": len(sources)
    }

    redis_client.setex(cache_key, 3600, json.dumps(result, ensure_ascii=False))

    return result


from anthropic import Anthropic
from app.config.config import settings
from app.config.redis_client import redis_client
from app.services.embeddings import embed_texts
from app.services.rag import search
import json

client = Anthropic(api_key=settings.CLAUDE_API_KEY)


def ask_with_cache(query: str, top_k: int = 5):
    cache_key = f"qa:{query}:{top_k}"
    cached = redis_client.get(cache_key)

    if cached:
        try:
            return json.loads(cached)
        except:
            pass

    vec = embed_texts([query])[0]
    hits = search(vec, top_k=top_k)

    if not hits:
        return {"answer": "No content found in the documents.", "sources": []}

    context_parts = []
    sources = []

    for i, hit in enumerate(hits):
        payload = hit.payload
        text_chunk = payload.get("text", "")

        title = (payload.get("title") or
                 payload.get("document_title") or
                 payload.get("filename") or
                 f"Document {payload.get('doc_id', 'unknown')}")

        doc_id = payload.get("doc_id") or payload.get("document_id", "unknown")
        chunk_index = payload.get("chunk_index", i)

        if text_chunk:
            context_parts.append(f"[Document: {title}]\n{text_chunk}")

            sources.append({
                "id": f"{doc_id}_{chunk_index}",
                "title": title,
                "chunk_text": text_chunk[:200] + "..." if len(text_chunk) > 200 else text_chunk,
                "score": float(hit.score),
                "match_percentage": f"{int(hit.score * 100)}%"
            })

    if not context_parts:
        return {"answer": "No textual content found.", "sources": []}

    context = "\n\n---\n\n".join(context_parts)

    resp = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""Answer based ONLY on the provided context. Respond in the same language as the question.

CONTEXT:
{context}

QUESTION: {query}

Be concise and cite sources when relevant."""
        }]
    )

    result = {
        "answer": resp.content[0].text,
        "sources": sources
    }

    redis_client.setex(cache_key, 3600, json.dumps(result, ensure_ascii=False))
    return result
from openai import OpenAI
from app.config.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def embed_texts(texts: list[str]) -> list[list[float]]:
    embeddings = []
    for text in texts:
        resp = client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
            dimensions=384
        )
        embeddings.append(resp.data[0].embedding)
    return embeddings
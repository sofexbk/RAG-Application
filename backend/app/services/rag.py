from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, Distance, PointStruct
from app.config.config import settings
from typing import List

qclient = QdrantClient(url=settings.QDRANT_URL)
COLLECTION = "documents"

def ensure_collection(vector_size: int = 384):
    try:
        collection_info = qclient.get_collection(COLLECTION)
        vector_config = collection_info.config.params.vectors
        if isinstance(vector_config, dict):
            for config in vector_config.values():
                if config.size != vector_size:
                    raise Exception("Wrong vector size, recreating collection")
        else:
            if vector_config.size != vector_size:
                raise Exception("Wrong vector size, recreating collection")
    except Exception:
        qclient.delete_collection(COLLECTION)
        qclient.recreate_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )

def upsert_document(doc_id: int, vectors: List[List[float]], metadatas: List[dict]):
    points = [
        PointStruct(id=int(f"{doc_id}{i}"), vector=v, payload=metadatas[i])
        for i, v in enumerate(vectors)
    ]
    qclient.upsert(collection_name=COLLECTION, points=points)

def search(query_vec: List[float], top_k: int = 5):
    hits = qclient.search(collection_name=COLLECTION, query_vector=query_vec, limit=top_k)
    return hits
from fastapi import FastAPI
from app.routers import auth as auth_router, documents as doc_router, qa as qa_router
from app.config.db import Base, engine
from app.services.rag import ensure_collection
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RAG FastAPI Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def startup_event():
    ensure_collection()

app.include_router(auth_router.router)
app.include_router(doc_router.router)
app.include_router(qa_router.router)

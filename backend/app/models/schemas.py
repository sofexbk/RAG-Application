from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class QARequest(BaseModel):
    query: str
    top_k: int = 5

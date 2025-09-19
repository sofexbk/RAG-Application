from fastapi.security import OAuth2PasswordBearer
from app.config.db import SessionLocal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


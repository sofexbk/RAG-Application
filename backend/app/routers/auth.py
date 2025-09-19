from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.schemas import UserCreate, Token
from app.models.models import User
from app.services.auth import hash_password, verify_password, create_access_token
from app.config.deps import get_db
from fastapi import status

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
def register(u: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == u.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=u.email, hashed_password=hash_password(u.password))
    db.add(user); db.commit(); db.refresh(user)
    token = create_access_token(str(user.id))
    return {"access_token": token}

@router.post("/token", response_model=Token)
def login(form: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.email).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return {"access_token": token}

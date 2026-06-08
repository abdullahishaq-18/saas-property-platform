from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserRead
from app.services.auth_service import authenticate_user, create_user, get_user_by_email

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Annotated[Session, Depends(get_db)]):
    existing_user = get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists"
        )

    user = create_user(db, payload)
    return Token(access_token=create_access_token(user.id))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Annotated[Session, Depends(get_db)]):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    return Token(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserRead)
def me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

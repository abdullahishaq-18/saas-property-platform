from fastapi import APIRouter

from app.api.v1.endpoints import auth, leads
from app.routes import listings

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(listings.router, prefix="/listings", tags=["listings"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])

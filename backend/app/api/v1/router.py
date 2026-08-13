from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.listings import router as listings_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.wishlists import router as wishlists_router
from app.api.v1.uploads import router as uploads_router
from app.api.v1.users import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(listings_router)
api_router.include_router(bookings_router)
api_router.include_router(reviews_router)
api_router.include_router(wishlists_router)
api_router.include_router(uploads_router)
api_router.include_router(users_router)

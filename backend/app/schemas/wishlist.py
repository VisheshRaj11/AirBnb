from datetime import datetime
from pydantic import BaseModel
from app.schemas.listing import ListingResponse

class WishlistToggleResponse(BaseModel):
    is_saved: bool
    listing_id: int

class WishlistResponse(BaseModel):
    id: int
    user_id: int
    listing_id: int
    created_at: datetime
    listing: ListingResponse

    class Config:
        from_attributes = True

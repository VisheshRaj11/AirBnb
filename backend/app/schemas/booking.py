from datetime import date, datetime
from pydantic import BaseModel
from app.schemas.user import UserResponse
from app.schemas.listing import ListingResponse

class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests_count: int = 1

class BookingResponse(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests_count: int
    nightly_rate_snapshot: int
    nights: int
    subtotal: int
    cleaning_fee: int
    service_fee: int
    total_price: int
    status: str
    created_at: datetime
    listing: ListingResponse
    guest: UserResponse
    has_review: bool = False

    class Config:
        from_attributes = True

class BlockedDateRange(BaseModel):
    check_in: date
    check_out: date

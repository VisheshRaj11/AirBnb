from datetime import datetime
from pydantic import BaseModel
from app.schemas.user import UserResponse
from app.schemas.amenity import AmenityResponse

class ListingPhotoResponse(BaseModel):
    id: int
    url: str
    sort_order: int

    class Config:
        from_attributes = True

class ListingBase(BaseModel):
    title: str
    description: str
    property_type: str
    category: str
    price_per_night: int
    currency: str = "INR"
    address: str
    city: str
    state: str
    country: str = "India"
    lat: float
    lng: float
    max_guests: int = 2
    bedrooms: int = 1
    beds: int = 1
    bathrooms: float = 1.0

class ListingCreate(ListingBase):
    photos: list[str] = []
    amenity_ids: list[int] = []

class ListingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    property_type: str | None = None
    category: str | None = None
    price_per_night: int | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    lat: float | None = None
    lng: float | None = None
    max_guests: int | None = None
    bedrooms: int | None = None
    beds: int | None = None
    bathrooms: float | None = None
    is_active: bool | None = None
    photos: list[str] | None = None
    amenity_ids: list[int] | None = None

class ListingResponse(ListingBase):
    id: int
    host_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    host: UserResponse
    photos: list[ListingPhotoResponse] = []
    amenities: list[AmenityResponse] = []
    rating: float = 0.0
    reviews_count: int = 0
    is_guest_favourite: bool = False

    class Config:
        from_attributes = True

class PaginatedListingResponse(BaseModel):
    items: list[ListingResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int

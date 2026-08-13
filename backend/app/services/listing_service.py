from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.listing import Listing
from app.models.review import Review
from app.models.booking import Booking
from app.models.wishlist import Wishlist
from app.schemas.listing import ListingResponse, ListingPhotoResponse
from app.schemas.user import UserResponse
from app.schemas.amenity import AmenityResponse

def format_listing_response(listing: Listing, db: Session, current_user_id: int | None = None) -> ListingResponse:
    # Compute rating & reviews count
    review_stats = db.query(
        func.coalesce(func.avg(Review.rating), 0.0).label("avg_rating"),
        func.count(Review.id).label("reviews_count")
    ).filter(Review.listing_id == listing.id).first()

    avg_rating = round(float(review_stats.avg_rating), 2) if review_stats else 0.0
    reviews_count = int(review_stats.reviews_count) if review_stats else 0
    
    # Guest favourite badge logic: rating >= 4.8 and reviews_count >= 3
    is_guest_favourite = avg_rating >= 4.8 and reviews_count >= 3

    photos = [
        ListingPhotoResponse(id=p.id, url=p.url, sort_order=p.sort_order)
        for p in sorted(listing.photos, key=lambda x: x.sort_order)
    ]
    
    amenities = [
        AmenityResponse(id=a.id, name=a.name, icon_key=a.icon_key)
        for a in listing.amenities
    ]

    host_res = UserResponse.model_validate(listing.host)

    res = ListingResponse(
        id=listing.id,
        host_id=listing.host_id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        category=listing.category,
        price_per_night=listing.price_per_night,
        currency=listing.currency,
        address=listing.address,
        city=listing.city,
        state=listing.state,
        country=listing.country,
        lat=listing.lat,
        lng=listing.lng,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        is_active=listing.is_active,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
        host=host_res,
        photos=photos,
        amenities=amenities,
        rating=avg_rating,
        reviews_count=reviews_count,
        is_guest_favourite=is_guest_favourite
    )
    return res

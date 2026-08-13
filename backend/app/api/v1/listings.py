from datetime import date, datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, not_

from app.db.session import get_db
from app.models.listing import Listing, ListingPhoto
from app.models.amenity import Amenity
from app.models.booking import Booking
from app.models.review import Review
from app.models.user import User
from app.schemas.listing import (
    ListingResponse,
    PaginatedListingResponse,
    ListingCreate,
    ListingUpdate
)
from app.schemas.booking import BlockedDateRange
from app.schemas.review import ReviewResponse
from app.api.deps import get_current_user, get_current_user_optional, require_role
from app.services.listing_service import format_listing_response

router = APIRouter(prefix="/listings", tags=["Listings"])

@router.get("", response_model=PaginatedListingResponse)
def get_listings(
    location: Optional[str] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    guests: Optional[int] = None,
    price_min: Optional[int] = None,
    price_max: Optional[int] = None,
    property_type: Optional[str] = None,
    category: Optional[str] = None,
    amenities: Optional[List[str]] = Query(None),
    host_only: Optional[bool] = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Listing).filter(Listing.is_active == True)

    # If host_only requested
    if host_only:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required for host listings")
        query = db.query(Listing).filter(Listing.host_id == current_user.id)

    # Filter location
    if location:
        loc_term = f"%{location.strip()}%"
        query = query.filter(
            or_(
                Listing.city.ilike(loc_term),
                Listing.state.ilike(loc_term),
                Listing.address.ilike(loc_term),
                Listing.country.ilike(loc_term),
                Listing.title.ilike(loc_term)
            )
        )

    # Filter guests
    if guests:
        query = query.filter(Listing.max_guests >= guests)

    # Filter price range
    if price_min is not None:
        query = query.filter(Listing.price_per_night >= price_min)
    if price_max is not None:
        query = query.filter(Listing.price_per_night <= price_max)

    # Filter property type
    if property_type and property_type != "All":
        query = query.filter(Listing.property_type == property_type)

    # Filter category
    if category and category != "All":
        query = query.filter(Listing.category == category)

    # Filter amenities
    if amenities:
        for amen in amenities:
            query = query.filter(Listing.amenities.any(Amenity.name.ilike(f"%{amen}%")))

    # Date range availability filter
    if check_in and check_out:
        if check_in >= check_out:
            raise HTTPException(status_code=400, detail="check_in date must be before check_out date")
        
        # Subquery for listings that HAVE an overlapping confirmed booking
        overlapping_subquery = db.query(Booking.listing_id).filter(
            Booking.status == "confirmed",
            not_(
                or_(
                    Booking.check_out <= check_in,
                    Booking.check_in >= check_out
                )
            )
        ).subquery()
        
        query = query.filter(Listing.id.not_in(overlapping_subquery))

    total_count = query.count()
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    listings = query.order_by(Listing.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    formatted_items = [
        format_listing_response(l, db, current_user.id if current_user else None)
        for l in listings
    ]

    return PaginatedListingResponse(
        items=formatted_items,
        total_count=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing_by_id(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return format_listing_response(listing, db, current_user.id if current_user else None)

@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("host"))
):
    new_listing = Listing(
        host_id=current_user.id,
        title=payload.title,
        description=payload.description,
        property_type=payload.property_type,
        category=payload.category,
        price_per_night=payload.price_per_night,
        currency=payload.currency,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        lat=payload.lat,
        lng=payload.lng,
        max_guests=payload.max_guests,
        bedrooms=payload.bedrooms,
        beds=payload.beds,
        bathrooms=payload.bathrooms,
        is_active=True
    )
    
    # Associate amenities
    if payload.amenity_ids:
        amenities = db.query(Amenity).filter(Amenity.id.in_(payload.amenity_ids)).all()
        new_listing.amenities = amenities

    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    # Add photos
    if payload.photos:
        for idx, photo_url in enumerate(payload.photos):
            db_photo = ListingPhoto(
                listing_id=new_listing.id,
                url=photo_url,
                sort_order=idx
            )
            db.add(db_photo)
        db.commit()
        db.refresh(new_listing)

    return format_listing_response(new_listing, db, current_user.id)

@router.put("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("host"))
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own listings")

    for field, val in payload.model_dump(exclude_unset=True).items():
        if field not in ["photos", "amenity_ids"]:
            setattr(listing, field, val)

    if payload.amenity_ids is not None:
        amenities = db.query(Amenity).filter(Amenity.id.in_(payload.amenity_ids)).all()
        listing.amenities = amenities

    if payload.photos is not None:
        db.query(ListingPhoto).filter(ListingPhoto.listing_id == listing.id).delete()
        for idx, photo_url in enumerate(payload.photos):
            db_photo = ListingPhoto(
                listing_id=listing.id,
                url=photo_url,
                sort_order=idx
            )
            db.add(db_photo)

    db.commit()
    db.refresh(listing)
    return format_listing_response(listing, db, current_user.id)

@router.delete("/{listing_id}")
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("host"))
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own listings")

    # Check for future active bookings
    today = date.today()
    active_future_bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed",
        Booking.check_out >= today
    ).count()

    if active_future_bookings > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete listing with {active_future_bookings} active or upcoming booking(s). Please cancel active bookings first."
        )

    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted successfully"}

@router.get("/{listing_id}/availability", response_model=List[BlockedDateRange])
def get_listing_availability(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed"
    ).all()

    return [BlockedDateRange(check_in=b.check_in, check_out=b.check_out) for b in bookings]

@router.get("/{listing_id}/reviews", response_model=List[ReviewResponse])
def get_listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.listing_id == listing_id).order_by(Review.created_at.desc()).all()
    return reviews

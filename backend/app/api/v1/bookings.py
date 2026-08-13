from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, not_

from app.db.session import get_db
from app.models.booking import Booking
from app.models.listing import Listing
from app.models.review import Review
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse
from app.api.deps import get_current_user, require_role
from app.services.listing_service import format_listing_response

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if payload.check_in >= payload.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date must be before check-out date."
        )

    today = date.today()
    if payload.check_in < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date cannot be in the past."
        )

    listing = db.query(Listing).filter(Listing.id == payload.listing_id, Listing.is_active == True).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or inactive")

    if listing.host_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot book your own listing.")

    if payload.guests_count > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"Guest count exceeds maximum allowed ({listing.max_guests})."
        )

    # Overlap validation inside DB check
    overlapping_booking = db.query(Booking).filter(
        Booking.listing_id == payload.listing_id,
        Booking.status == "confirmed",
        not_(
            or_(
                Booking.check_out <= payload.check_in,
                Booking.check_in >= payload.check_out
            )
        )
    ).first()

    if overlapping_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The selected dates overlap with an existing booking. Please choose different dates."
        )

    nights = (payload.check_out - payload.check_in).days
    subtotal = listing.price_per_night * nights
    cleaning_fee = max(500, int(subtotal * 0.08))
    service_fee = max(700, int(subtotal * 0.12))
    total_price = subtotal + cleaning_fee + service_fee

    new_booking = Booking(
        listing_id=listing.id,
        guest_id=current_user.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests_count=payload.guests_count,
        nightly_rate_snapshot=listing.price_per_night,
        nights=nights,
        subtotal=subtotal,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total_price=total_price,
        status="confirmed"
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # Format response
    formatted_listing = format_listing_response(new_booking.listing, db, current_user.id)
    return BookingResponse(
        id=new_booking.id,
        listing_id=new_booking.listing_id,
        guest_id=new_booking.guest_id,
        check_in=new_booking.check_in,
        check_out=new_booking.check_out,
        guests_count=new_booking.guests_count,
        nightly_rate_snapshot=new_booking.nightly_rate_snapshot,
        nights=new_booking.nights,
        subtotal=new_booking.subtotal,
        cleaning_fee=new_booking.cleaning_fee,
        service_fee=new_booking.service_fee,
        total_price=new_booking.total_price,
        status=new_booking.status,
        created_at=new_booking.created_at,
        listing=formatted_listing,
        guest=new_booking.guest,
        has_review=False
    )

@router.get("/me", response_model=List[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookings = db.query(Booking).filter(Booking.guest_id == current_user.id).order_by(Booking.created_at.desc()).all()
    res = []
    for b in bookings:
        has_review = db.query(Review).filter(Review.booking_id == b.id).first() is not None
        formatted_listing = format_listing_response(b.listing, db, current_user.id)
        res.append(
            BookingResponse(
                id=b.id,
                listing_id=b.listing_id,
                guest_id=b.guest_id,
                check_in=b.check_in,
                check_out=b.check_out,
                guests_count=b.guests_count,
                nightly_rate_snapshot=b.nightly_rate_snapshot,
                nights=b.nights,
                subtotal=b.subtotal,
                cleaning_fee=b.cleaning_fee,
                service_fee=b.service_fee,
                total_price=b.total_price,
                status=b.status,
                created_at=b.created_at,
                listing=formatted_listing,
                guest=b.guest,
                has_review=has_review
            )
        )
    return res

@router.get("/host", response_model=List[BookingResponse])
def get_host_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("host"))
):
    # Bookings for listings hosted by current user
    host_listing_ids = db.query(Listing.id).filter(Listing.host_id == current_user.id).subquery()
    bookings = db.query(Booking).filter(Booking.listing_id.in_(host_listing_ids)).order_by(Booking.created_at.desc()).all()

    res = []
    for b in bookings:
        has_review = db.query(Review).filter(Review.booking_id == b.id).first() is not None
        formatted_listing = format_listing_response(b.listing, db, current_user.id)
        res.append(
            BookingResponse(
                id=b.id,
                listing_id=b.listing_id,
                guest_id=b.guest_id,
                check_in=b.check_in,
                check_out=b.check_out,
                guests_count=b.guests_count,
                nightly_rate_snapshot=b.nightly_rate_snapshot,
                nights=b.nights,
                subtotal=b.subtotal,
                cleaning_fee=b.cleaning_fee,
                service_fee=b.service_fee,
                total_price=b.total_price,
                status=b.status,
                created_at=b.created_at,
                listing=formatted_listing,
                guest=b.guest,
                has_review=has_review
            )
        )
    return res

@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Only guest or listing host can cancel
    if booking.guest_id != current_user.id and booking.listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)

    has_review = db.query(Review).filter(Review.booking_id == booking.id).first() is not None
    formatted_listing = format_listing_response(booking.listing, db, current_user.id)
    return BookingResponse(
        id=booking.id,
        listing_id=booking.listing_id,
        guest_id=booking.guest_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests_count=booking.guests_count,
        nightly_rate_snapshot=booking.nightly_rate_snapshot,
        nights=booking.nights,
        subtotal=booking.subtotal,
        cleaning_fee=booking.cleaning_fee,
        service_fee=booking.service_fee,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
        listing=formatted_listing,
        guest=booking.guest,
        has_review=has_review
    )

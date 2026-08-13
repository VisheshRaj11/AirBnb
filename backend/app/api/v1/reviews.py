from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.review import Review
from app.models.booking import Booking
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.guest_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only leave a review for your own stay.")

    today = date.today()
    if booking.check_out > today and booking.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviews can only be created after check-out is complete."
        )

    # Check for existing review on this booking
    existing = db.query(Review).filter(Review.booking_id == payload.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a review for this stay.")

    new_review = Review(
        booking_id=booking.id,
        listing_id=booking.listing_id,
        reviewer_id=current_user.id,
        rating=payload.rating,
        cleanliness_rating=payload.cleanliness_rating,
        accuracy_rating=payload.accuracy_rating,
        checkin_rating=payload.checkin_rating,
        value_rating=payload.value_rating,
        comment=payload.comment
    )

    # Automatically mark booking status as completed if it wasn't already
    booking.status = "completed"

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review

from datetime import datetime, timezone
from sqlalchemy import Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    cleanliness_rating: Mapped[float] = mapped_column(Float, default=5.0)
    accuracy_rating: Mapped[float] = mapped_column(Float, default=5.0)
    checkin_rating: Mapped[float] = mapped_column(Float, default=5.0)
    value_rating: Mapped[float] = mapped_column(Float, default=5.0)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    booking = relationship("Booking", back_populates="review")
    listing = relationship("Listing", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")

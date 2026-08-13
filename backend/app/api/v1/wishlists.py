from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.wishlist import Wishlist
from app.models.listing import Listing
from app.models.user import User
from app.schemas.wishlist import WishlistToggleResponse, WishlistResponse
from app.api.deps import get_current_user
from app.services.listing_service import format_listing_response

router = APIRouter(prefix="/wishlists", tags=["Wishlists"])

@router.get("/me", response_model=List[WishlistResponse])
def get_my_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).order_by(Wishlist.created_at.desc()).all()
    res = []
    for item in items:
        formatted_listing = format_listing_response(item.listing, db, current_user.id)
        res.append(
            WishlistResponse(
                id=item.id,
                user_id=item.user_id,
                listing_id=item.listing_id,
                created_at=item.created_at,
                listing=formatted_listing
            )
        )
    return res

@router.post("/{listing_id}", response_model=WishlistToggleResponse)
def toggle_wishlist(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.listing_id == listing_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return WishlistToggleResponse(is_saved=False, listing_id=listing_id)
    else:
        new_wishlist = Wishlist(user_id=current_user.id, listing_id=listing_id)
        db.add(new_wishlist)
        db.commit()
        return WishlistToggleResponse(is_saved=True, listing_id=listing_id)

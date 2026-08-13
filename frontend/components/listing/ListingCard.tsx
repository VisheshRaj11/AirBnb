'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { Listing } from '@/lib/types';
import { formatPrice, getFullImageUrl, cn } from '@/lib/utils';
import { wishlistsApi } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export interface ListingCardProps {
  listing: Listing;
  isSavedInitial?: boolean;
  onWishlistToggle?: (listingId: number, isSaved: boolean) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isSavedInitial = false,
  onWishlistToggle,
}) => {
  const { user, openAuthModal } = useAuth();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos
    : [{ id: 0, url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80', sort_order: 0 }];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }
    setIsTogglingWishlist(true);
    try {
      const res = await wishlistsApi.toggleWishlist(listing.id);
      setIsSaved(res.is_saved);
      if (onWishlistToggle) {
        onWishlistToggle(listing.id, res.is_saved);
      }
      toast.success(res.is_saved ? 'Saved to Wishlist' : 'Removed from Wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <Link href={`/listing/${listing.id}`} className="group block cursor-pointer">
      <div className="flex flex-col gap-3">
        
        {/* IMAGE CAROUSEL CONTAINER */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-bg-surface shadow-dark-soft group-hover:shadow-dark-elevated transition-all">
          
          <img
            src={getFullImageUrl(photos[currentPhotoIndex]?.url)}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* TOP GRADIENT SCRIM */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

          {/* GUEST FAVOURITE BADGE */}
          {listing.is_guest_favourite && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-surface/90 backdrop-blur-md border border-white/20 text-text-primary text-xs font-semibold shadow-md">
              <Award className="w-3.5 h-3.5 text-brand" />
              <span>Guest favourite</span>
            </div>
          )}

          {/* WISHLIST HEART BUTTON */}
          <button
            onClick={handleHeartClick}
            disabled={isTogglingWishlist}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            className="absolute top-3 right-3 z-10 p-2 text-white hover:scale-110 active:scale-95 transition-transform"
          >
            <Heart
              className={cn(
                'w-6 h-6 stroke-[2] drop-shadow-md transition-colors',
                isSaved ? 'fill-brand text-brand' : 'fill-black/40 text-white hover:fill-white/30'
              )}
            />
          </button>

          {/* CAROUSEL CONTROLS */}
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPhoto}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* DOTS INDICATOR */}
              <div className="absolute bottom-3 inset-x-0 z-10 flex items-center justify-center gap-1.5 pointer-events-none">
                {photos.map((_, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      idx === currentPhotoIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                    )}
                  />
                ))}
              </div>
            </>
          )}

        </div>

        {/* LISTING DETAILS */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-text-primary text-sm line-clamp-1 group-hover:text-brand transition-colors">
              {listing.city}, {listing.state}
            </h3>

            {/* RATING */}
            <div className="flex items-center gap-1 text-xs font-semibold text-text-primary shrink-0">
              <Star className="w-3.5 h-3.5 fill-star text-star" />
              <span>{listing.rating > 0 ? listing.rating.toFixed(2) : 'New'}</span>
              {listing.reviews_count > 0 && (
                <span className="text-text-muted">({listing.reviews_count})</span>
              )}
            </div>
          </div>

          <p className="text-xs text-text-secondary line-clamp-1">{listing.title}</p>
          <p className="text-xs text-text-muted">{listing.property_type} · {listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''}</p>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-bold text-text-primary text-sm">{formatPrice(listing.price_per_night)}</span>
            <span className="text-xs text-text-secondary font-normal">night</span>
          </div>
        </div>

      </div>
    </Link>
  );
};

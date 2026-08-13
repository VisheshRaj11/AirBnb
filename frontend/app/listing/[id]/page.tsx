'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Share,
  Heart,
  Award,
  Shield,
  MapPin,
  X,
  Grid,
  CheckCircle,
  Wifi,
  Waves,
  Utensils,
  Car,
  Wind,
  Tv,
  Briefcase,
  Sun,
  Flame,
  Dumbbell,
  ChevronRight,
} from 'lucide-react';
import { listingsApi, wishlistsApi } from '@/lib/api-client';
import { getFullImageUrl, formatPrice, cn } from '@/lib/utils';
import { BookingCard } from '@/components/booking/BookingCard';
import { ListingMap } from '@/components/map/ListingMap';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

const AMENITY_ICON_MAP: Record<string, any> = {
  wifi: Wifi,
  pool: Waves,
  kitchen: Utensils,
  parking: Car,
  ac: Wind,
  tv: Tv,
  workspace: Briefcase,
  patio: Sun,
  hot_tub: Flame,
  gym: Dumbbell,
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = Number(params.id);
  const { user, openAuthModal } = useAuth();

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => listingsApi.getListingById(listingId),
    enabled: !isNaN(listingId),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', listingId],
    queryFn: () => listingsApi.getReviews(listingId),
    enabled: !isNaN(listingId),
  });

  const { data: wishlists } = useQuery({
    queryKey: ['wishlists'],
    queryFn: () => wishlistsApi.getMyWishlists(),
    enabled: !!user,
  });

  const isSaved = wishlists?.some((w) => w.listing_id === listingId) || false;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Listing link copied to clipboard!');
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await wishlistsApi.toggleWishlist(listingId);
      toast.success(res.is_saved ? 'Saved to Wishlist' : 'Removed from Wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-8 w-2/3 bg-bg-surface rounded-xl skeleton-shimmer" />
        <div className="aspect-[16/9] w-full bg-bg-surface rounded-3xl skeleton-shimmer" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Listing not found</h2>
        <p className="text-sm text-text-secondary mb-6">The listing you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-brand text-white font-semibold rounded-full text-xs"
        >
          Return to Explore
        </button>
      </div>
    );
  }

  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos
    : [{ id: 0, url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200', sort_order: 0 }];

  return (
    <div className="min-h-screen pb-20">
      
      {/* HEADER TITLE & ACTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{listing.title}</h1>
        
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-text-secondary">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-bold text-text-primary">
              <Star className="w-4 h-4 fill-star text-star" />
              <span>{listing.rating > 0 ? listing.rating.toFixed(2) : 'New'}</span>
            </div>
            <span>·</span>
            <span className="font-semibold underline cursor-pointer">{listing.reviews_count} reviews</span>
            {listing.host.is_superhost && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 font-semibold text-brand">
                  <Award className="w-4 h-4" /> Superhost
                </span>
              </>
            )}
            <span>·</span>
            <span className="flex items-center gap-1 underline">
              <MapPin className="w-3.5 h-3.5" /> {listing.address}, {listing.city}, {listing.state}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-bg-surface-hover text-text-primary font-semibold transition"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={handleToggleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-bg-surface-hover text-text-primary font-semibold transition"
            >
              <Heart className={cn('w-4 h-4', isSaved ? 'fill-brand text-brand' : 'text-text-primary')} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PHOTO GALLERY HERO GRID (1 BIG + 4 SMALL) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-2 rounded-3xl overflow-hidden border border-white/10 shadow-dark-soft">
          
          {/* BIG PHOTO (Left Half) */}
          <div
            onClick={() => {
              setSelectedPhotoIdx(0);
              setIsLightboxOpen(true);
            }}
            className="md:col-span-2 aspect-[4/3] md:aspect-auto h-full cursor-pointer relative group overflow-hidden"
          >
            <img
              src={getFullImageUrl(photos[0]?.url)}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* 4 SMALL PHOTOS (Right Half Grid) */}
          <div className="hidden md:grid col-span-2 grid-cols-2 gap-2">
            {photos.slice(1, 5).map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => {
                  setSelectedPhotoIdx(idx + 1);
                  setIsLightboxOpen(true);
                }}
                className="aspect-[4/3] cursor-pointer relative group overflow-hidden"
              >
                <img
                  src={getFullImageUrl(photo.url)}
                  alt={`${listing.title} photo ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          {/* SHOW ALL PHOTOS BUTTON */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2 bg-bg-surface/90 backdrop-blur-md border border-border rounded-xl text-xs font-semibold text-text-primary shadow-dark-elevated hover:bg-bg-surface transition"
          >
            <Grid className="w-4 h-4" />
            <span>Show all photos</span>
          </button>

        </div>
      </div>

      {/* TWO COLUMN LAYOUT: LEFT = DETAILS, RIGHT = STICKY BOOKING CARD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT DETAILS COLUMN (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* HOST & PROPERTY OVERVIEW */}
            <div className="flex items-center justify-between pb-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {listing.property_type} hosted by {listing.host.name}
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  {listing.max_guests} guests · {listing.bedrooms} bedroom{listing.bedrooms > 1 ? 's' : ''} · {listing.beds} bed{listing.beds > 1 ? 's' : ''} · {listing.bathrooms} bath{listing.bathrooms > 1 ? 's' : ''}
                </p>
              </div>
              <img
                src={listing.host.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={listing.host.name}
                className="w-14 h-14 rounded-full object-cover border border-border shrink-0"
              />
            </div>

            {/* HIGHLIGHTS */}
            <div className="space-y-4 pb-6 border-b border-border">
              {listing.host.is_superhost && (
                <div className="flex items-start gap-4">
                  <Award className="w-6 h-6 text-brand shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{listing.host.name} is a Superhost</h3>
                    <p className="text-xs text-text-secondary">Superhosts are experienced, highly rated hosts committed to providing great stays.</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-brand shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Great check-in experience</h3>
                  <p className="text-xs text-text-secondary">100% of recent guests gave the check-in process a 5-star rating.</p>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="pb-6 border-b border-border">
              <h3 className="text-lg font-bold text-text-primary mb-3">About this place</h3>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* AMENITIES GRID */}
            <div className="pb-6 border-b border-border">
              <h3 className="text-lg font-bold text-text-primary mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {listing.amenities.map((a) => {
                  const Icon = AMENITY_ICON_MAP[a.icon_key] || CheckCircle;
                  return (
                    <div key={a.id} className="flex items-center gap-3 text-sm text-text-primary">
                      <Icon className="w-5 h-5 text-text-muted" />
                      <span>{a.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="pb-6 border-b border-border space-y-6">
              <div className="flex items-center gap-2 text-xl font-bold text-text-primary">
                <Star className="w-6 h-6 fill-star text-star" />
                <span>{listing.rating > 0 ? listing.rating.toFixed(2) : 'New'}</span>
                <span>·</span>
                <span>{listing.reviews_count} reviews</span>
              </div>

              {/* RATING BREAKDOWN BARS */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs text-text-secondary">
                <div className="flex items-center justify-between">
                  <span>Cleanliness</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full w-[95%]" />
                    </div>
                    <span className="font-semibold text-text-primary">4.9</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Accuracy</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full w-[98%]" />
                    </div>
                    <span className="font-semibold text-text-primary">5.0</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Check-in</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full w-[100%]" />
                    </div>
                    <span className="font-semibold text-text-primary">5.0</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Value</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full w-[92%]" />
                    </div>
                    <span className="font-semibold text-text-primary">4.8</span>
                  </div>
                </div>
              </div>

              {/* REVIEWS GRID */}
              {reviews && reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-bg-surface border border-border rounded-2xl space-y-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.reviewer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={rev.reviewer.name}
                          className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                        <div>
                          <div className="text-sm font-semibold text-text-primary">{rev.reviewer.name}</div>
                          <div className="text-[11px] text-text-muted">
                            {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">No written reviews yet for this stay.</p>
              )}
            </div>

            {/* LOCATION MAP SECTION */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Where you'll be</h3>
              <p className="text-xs text-text-secondary mb-4">{listing.city}, {listing.state}, {listing.country}</p>
              <div className="h-[350px]">
                <ListingMap listings={[listing]} center={[listing.lat, listing.lng]} />
              </div>
            </div>

          </div>

          {/* RIGHT STICKY BOOKING CARD (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <BookingCard listing={listing} />
            </div>
          </div>

        </div>
      </div>

      {/* FULL SCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between py-2 border-b border-border/60">
            <span className="text-sm font-semibold text-text-primary">
              Photo {selectedPhotoIdx + 1} of {photos.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={getFullImageUrl(photos[selectedPhotoIdx]?.url)}
              alt={listing.title}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-dark-elevated"
            />
          </div>

          <div className="flex justify-center gap-2 py-4 overflow-x-auto">
            {photos.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedPhotoIdx(idx)}
                className={cn(
                  'w-16 h-12 rounded-lg overflow-hidden border-2 transition',
                  idx === selectedPhotoIdx ? 'border-brand scale-105' : 'border-transparent opacity-60'
                )}
              >
                <img src={getFullImageUrl(p.url)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

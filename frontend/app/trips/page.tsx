'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Star, AlertCircle, X, Check, MessageSquarePlus } from 'lucide-react';
import { bookingsApi, reviewsApi } from '@/lib/api-client';
import { getFullImageUrl, formatPrice, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import Link from 'next/link';

export default function MyTripsPage() {
  const { user, openAuthModal } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Review modal state
  const [reviewBookingId, setReviewBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.getMyBookings(),
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Booking cancelled successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to cancel booking');
    },
  });

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBookingId) return;
    setIsSubmittingReview(true);
    try {
      await reviewsApi.createReview({
        booking_id: reviewBookingId,
        rating,
        comment,
      });
      toast.success('Thank you! Your review has been published.');
      setReviewBookingId(null);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to post review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Log in to view your trips</h2>
        <p className="text-sm text-text-secondary mb-6">Manage upcoming stays, past reservations, and leave reviews.</p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 bg-brand text-white font-semibold rounded-full text-xs shadow-brand-glow"
        >
          Log in
        </button>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings?.filter((b) => b.check_out >= todayStr && b.status === 'confirmed') || [];
  const pastBookings = bookings?.filter((b) => b.check_out < todayStr || b.status !== 'confirmed') || [];

  const currentList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-extrabold text-text-primary mb-6">Trips & Reservations</h1>

      {/* TABS HEADER */}
      <div className="flex items-center gap-4 border-b border-border mb-8">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            'pb-3 text-sm font-semibold border-b-2 transition',
            activeTab === 'upcoming' ? 'border-brand text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          Upcoming stays ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={cn(
            'pb-3 text-sm font-semibold border-b-2 transition',
            activeTab === 'past' ? 'border-brand text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          Past & Cancelled ({pastBookings.length})
        </button>
      </div>

      {/* BOOKINGS LIST */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-36 bg-bg-surface rounded-2xl skeleton-shimmer" />
          <div className="h-36 bg-bg-surface rounded-2xl skeleton-shimmer" />
        </div>
      ) : currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentList.map((booking) => (
            <div
              key={booking.id}
              className="bg-bg-surface border border-border rounded-3xl p-5 flex flex-col justify-between shadow-dark-soft space-y-4"
            >
              <div className="flex gap-4">
                <img
                  src={getFullImageUrl(booking.listing.photos[0]?.url)}
                  alt={booking.listing.title}
                  className="w-32 h-28 object-cover rounded-2xl border border-white/10 shrink-0"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-brand uppercase tracking-wider">
                      Ref #{booking.id}
                    </span>
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase',
                        booking.status === 'confirmed'
                          ? 'bg-success/20 text-success'
                          : booking.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                      )}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <Link href={`/listing/${booking.listing_id}`}>
                    <h3 className="font-bold text-text-primary text-sm line-clamp-1 hover:text-brand transition mt-1">
                      {booking.listing.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {booking.listing.city}, {booking.listing.state}
                  </p>

                  <div className="text-xs text-text-muted mt-2">
                    {booking.check_in} → {booking.check_out} ({booking.nights} night{booking.nights > 1 ? 's' : ''})
                  </div>
                </div>
              </div>

              {/* CARD FOOTER ACTIONS */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <span className="font-bold text-text-primary">Total: {formatPrice(booking.total_price)}</span>

                <div className="flex items-center gap-2">
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        toast(`Cancel stay at ${booking.listing.title}?`, {
                          description: `Booking reference #${booking.id}. This action cannot be undone.`,
                          action: {
                            label: 'Confirm Cancel',
                            onClick: () => cancelMutation.mutate(booking.id),
                          },
                          cancel: {
                            label: 'Keep Stay',
                            onClick: () => {},
                          },
                        });
                      }}
                      className="px-3 py-1.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl font-semibold transition text-xs"
                    >
                      Cancel stay
                    </button>
                  )}

                  {booking.status === 'completed' && !booking.has_review && (
                    <button
                      onClick={() => setReviewBookingId(booking.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand text-white hover:bg-brand-hover rounded-xl font-semibold shadow-brand-glow transition"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Leave Review</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-bg-surface rounded-3xl border border-border">
          <Calendar className="w-12 h-12 text-brand mx-auto mb-3" />
          <h3 className="text-lg font-bold text-text-primary mb-1">No trips booked yet</h3>
          <p className="text-xs text-text-secondary mb-6">Time to dust off your bags and start planning your next getaway.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-brand text-white font-semibold rounded-full text-xs shadow-brand-glow inline-block"
          >
            Start searching
          </Link>
        </div>
      )}

      {/* LEAVE A REVIEW MODAL */}
      {reviewBookingId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border rounded-3xl p-6 max-w-md w-full shadow-dark-elevated space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-text-primary text-lg">Leave a Review</h3>
              <button onClick={() => setReviewBookingId(null)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          'w-8 h-8 transition-colors',
                          star <= rating ? 'fill-star text-star' : 'text-text-muted'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Your experience</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe your stay, cleanliness, location, host communication..."
                  className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-3 bg-brand text-white font-bold rounded-xl shadow-brand-glow transition hover:bg-brand-hover"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

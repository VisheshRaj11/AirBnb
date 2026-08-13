'use client';

import React, { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, ShieldCheck, Lock, ArrowLeft, Star, Calendar, Users } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { listingsApi, bookingsApi } from '@/lib/api-client';
import { getFullImageUrl, formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { differenceInCalendarDays, parseISO } from 'date-fns';

function CheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const listingId = Number(params.listingId);

  const checkIn = searchParams.get('check_in') || '';
  const checkOut = searchParams.get('check_out') || '';
  const guests = Number(searchParams.get('guests')) || 1;

  const { user } = useAuth();

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [nameOnCard, setNameOnCard] = useState(user?.name || 'John Doe');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => listingsApi.getListingById(listingId),
    enabled: !isNaN(listingId),
  });

  const nights = checkIn && checkOut
    ? Math.max(1, differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn)))
    : 1;

  const pricePerNight = listing?.price_per_night || 0;
  const subtotal = pricePerNight * nights;
  const cleaningFee = Math.max(500, Math.round(subtotal * 0.08));
  const serviceFee = Math.max(700, Math.round(subtotal * 0.12));
  const totalPrice = subtotal + cleaningFee + serviceFee;

  const handleConfirmAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      toast.error('Invalid dates provided for booking.');
      return;
    }
    setIsSubmitting(true);
    try {
      const newBooking = await bookingsApi.createBooking({
        listing_id: listingId,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guests,
      });

      toast.success(`Booking Confirmed! Reference #${newBooking.id}`);
      router.push('/trips');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 w-1/3 bg-bg-surface rounded-xl skeleton-shimmer" />
        <div className="h-64 w-full bg-bg-surface rounded-3xl skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      
      {/* TOP NAV BAR */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to listing</span>
        </button>

        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-8">Confirm and pay</h1>
      </div>

      {/* TWO COLUMN CHECKOUT LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: PAYMENT DETAILS & TRIP SUMMARY (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* TRIP DETAILS BOX */}
            <div className="p-6 bg-bg-surface border border-border rounded-3xl space-y-4">
              <h2 className="text-lg font-bold text-text-primary border-b border-border pb-3">Your trip</h2>
              
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-xs font-bold text-text-primary">Dates</div>
                  <div className="text-xs text-text-secondary">{checkIn} to {checkOut} ({nights} night{nights > 1 ? 's' : ''})</div>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-xs font-bold text-text-primary">Guests</div>
                  <div className="text-xs text-text-secondary">{guests} guest{guests > 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            {/* MOCKED PAYMENT FORM */}
            <form onSubmit={handleConfirmAndPay} className="p-6 bg-bg-surface border border-border rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-lg font-bold text-text-primary">Pay with Card</h2>
                <div className="flex items-center gap-2 text-text-muted">
                  <CreditCard className="w-5 h-5 text-brand" />
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Name on card</label>
                  <input
                    type="text"
                    required
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Card number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Expiration date</label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Security code (CVC)</label>
                    <input
                      type="password"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="123"
                      className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl shadow-brand-glow transition text-base disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing reservation...' : `Confirm and Pay · ${formatPrice(totalPrice)}`}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-text-muted justify-center">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Protected by 256-bit encryption. Mock payment demonstration.</span>
              </div>
            </form>

          </div>

          {/* RIGHT: ORDER SUMMARY CARD (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="p-6 bg-bg-surface border border-border rounded-3xl shadow-dark-elevated space-y-6 sticky top-28">
              
              <div className="flex gap-4 pb-6 border-b border-border">
                <img
                  src={getFullImageUrl(listing.photos[0]?.url)}
                  alt={listing.title}
                  className="w-28 h-24 object-cover rounded-2xl border border-white/10 shrink-0"
                />
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider">{listing.property_type}</span>
                  <h3 className="font-bold text-text-primary text-sm line-clamp-2 mt-0.5">{listing.title}</h3>
                  <div className="flex items-center gap-1 text-xs font-semibold text-text-primary mt-1">
                    <Star className="w-3.5 h-3.5 fill-star text-star" />
                    <span>{listing.rating > 0 ? listing.rating.toFixed(2) : 'New'}</span>
                    <span className="text-text-muted">({listing.reviews_count} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-text-secondary border-b border-border pb-6">
                <h4 className="font-bold text-text-primary text-sm mb-2">Price details</h4>
                <div className="flex justify-between">
                  <span>{formatPrice(listing.price_per_night)} x {nights} night{nights > 1 ? 's' : ''}</span>
                  <span className="text-text-primary font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span className="text-text-primary font-medium">{formatPrice(cleaningFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Airbnb service fee</span>
                  <span className="text-text-primary font-medium">{formatPrice(serviceFee)}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline text-base font-bold text-text-primary">
                <span>Total (INR)</span>
                <span className="text-xl text-brand">{formatPrice(totalPrice)}</span>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-64 bg-bg-surface rounded-3xl skeleton-shimmer" />
      </div>
    }>
      <CheckoutContent />
    </React.Suspense>
  );
}

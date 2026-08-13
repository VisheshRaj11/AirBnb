'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Star, ShieldCheck, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, differenceInCalendarDays, parseISO, isWithinInterval } from 'date-fns';
import { Listing } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { listingsApi } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export interface BookingCardProps {
  listing: Listing;
}

export const BookingCard: React.FC<BookingCardProps> = ({ listing }) => {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guestsCount, setGuestsCount] = useState(1);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);

  // Fetch blocked date ranges for this listing
  const { data: blockedRanges } = useQuery({
    queryKey: ['availability', listing.id],
    queryFn: () => listingsApi.getAvailability(listing.id),
  });

  // Helper to disable booked dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    if (blockedRanges) {
      for (const range of blockedRanges) {
        const start = parseISO(range.check_in);
        const end = parseISO(range.check_out);
        if (isWithinInterval(date, { start, end })) {
          return true;
        }
      }
    }
    return false;
  };

  const nights = dateRange?.from && dateRange?.to
    ? Math.max(1, differenceInCalendarDays(dateRange.to, dateRange.from))
    : 0;

  const subtotal = listing.price_per_night * (nights || 1);
  const cleaningFee = Math.max(500, Math.round(subtotal * 0.08));
  const serviceFee = Math.max(700, Math.round(subtotal * 0.12));
  const totalPrice = subtotal + cleaningFee + serviceFee;

  const handleReserve = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      setIsDatePickerOpen(true);
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const checkInStr = format(dateRange.from, 'yyyy-MM-dd');
    const checkOutStr = format(dateRange.to, 'yyyy-MM-dd');

    router.push(
      `/checkout/${listing.id}?check_in=${checkInStr}&check_out=${checkOutStr}&guests=${guestsCount}`
    );
  };

  return (
    <div className="w-full bg-bg-surface border border-border rounded-3xl p-6 shadow-dark-elevated space-y-6">
      
      {/* HEADER: PRICE & RATING */}
      <div className="flex items-baseline justify-between border-b border-border/60 pb-4">
        <div>
          <span className="text-2xl font-extrabold text-text-primary">{formatPrice(listing.price_per_night)}</span>
          <span className="text-xs text-text-secondary font-normal ml-1">night</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-text-primary">
          <Star className="w-4 h-4 fill-star text-star" />
          <span>{listing.rating > 0 ? listing.rating.toFixed(2) : 'New'}</span>
          {listing.reviews_count > 0 && (
            <span className="text-text-muted">({listing.reviews_count})</span>
          )}
        </div>
      </div>

      {/* INPUTS CONTAINER: DATES & GUESTS */}
      <div className="border border-border rounded-2xl overflow-hidden bg-bg-base">
        
        {/* DATE SELECTOR BUTTON */}
        <button
          onClick={() => {
            setIsDatePickerOpen(!isDatePickerOpen);
            setIsGuestPickerOpen(false);
          }}
          className="w-full grid grid-cols-2 p-3 text-left border-b border-border hover:bg-bg-surface-hover transition"
        >
          <div className="border-r border-border pr-2">
            <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Check-in</div>
            <div className="text-xs font-medium text-text-secondary truncate mt-0.5">
              {dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Add date'}
            </div>
          </div>
          <div className="pl-2">
            <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Check-out</div>
            <div className="text-xs font-medium text-text-secondary truncate mt-0.5">
              {dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Add date'}
            </div>
          </div>
        </button>

        {/* GUEST SELECTOR BUTTON */}
        <button
          onClick={() => {
            setIsGuestPickerOpen(!isGuestPickerOpen);
            setIsDatePickerOpen(false);
          }}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-bg-surface-hover transition"
        >
          <div>
            <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Guests</div>
            <div className="text-xs font-medium text-text-secondary mt-0.5">
              {guestsCount} guest{guestsCount > 1 ? 's' : ''}
            </div>
          </div>
          {isGuestPickerOpen ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
        </button>

      </div>

      {/* DATE PICKER DROPDOWN */}
      {isDatePickerOpen && (
        <div className="p-4 bg-bg-base border border-border rounded-2xl animate-in fade-in duration-150">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-text-secondary uppercase">Select Stay Dates</span>
            {dateRange?.from && (
              <button
                onClick={() => setDateRange(undefined)}
                className="text-xs text-brand hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <DayPicker
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            disabled={isDateDisabled}
          />
        </div>
      )}

      {/* GUEST STEPPER DROPDOWN */}
      {isGuestPickerOpen && (
        <div className="p-4 bg-bg-base border border-border rounded-2xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-text-primary">Total Guests</div>
              <div className="text-[11px] text-text-muted">Maximum {listing.max_guests} guests allowed</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                disabled={guestsCount <= 1}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-bg-surface-hover disabled:opacity-30"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-semibold text-sm text-text-primary">{guestsCount}</span>
              <button
                onClick={() => setGuestsCount(Math.min(listing.max_guests, guestsCount + 1))}
                disabled={guestsCount >= listing.max_guests}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-bg-surface-hover disabled:opacity-30"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESERVE BUTTON */}
      <button
        onClick={handleReserve}
        aria-label="Reserve stay"
        className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl shadow-brand-glow transition text-base"
      >
        {dateRange?.from && dateRange?.to ? 'Reserve' : 'Check Availability'}
      </button>

      <p className="text-center text-xs text-text-muted">You won't be charged yet</p>

      {/* PRICE BREAKDOWN ACCORDION */}
      {nights > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/60 text-xs text-text-secondary animate-in fade-in">
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

          <div className="pt-3 border-t border-border flex justify-between items-baseline text-sm font-bold text-text-primary">
            <span>Total before taxes</span>
            <span className="text-base text-brand">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 text-[11px] text-text-muted">
        <ShieldCheck className="w-4 h-4 text-success shrink-0" />
        <span>Airbnb Cover protection included for all bookings.</span>
      </div>

    </div>
  );
};

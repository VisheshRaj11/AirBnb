'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar as CalendarIcon, Users, X, Plus, Minus } from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const POPULAR_CITIES = [
  { name: 'Candolim', desc: 'Beachfront nightlife & dining', state: 'Goa' },
  { name: 'North Goa', desc: 'Vibrant markets & coastline', state: 'Goa' },
  { name: 'Nerul', desc: 'Riverside coconut groves', state: 'Goa' },
  { name: 'Anjuna', desc: 'Boho flea markets & cliff views', state: 'Goa' },
  { name: 'Siolim', desc: 'Luxurious villas & quiet retreats', state: 'Goa' },
  { name: 'Lonavala', desc: 'Misty hills & greenery', state: 'Maharashtra' },
  { name: 'South Goa', desc: 'Pristine white sand beaches', state: 'Goa' },
];

export const SearchPill: React.FC = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<'where' | 'when' | 'who' | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveStep(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalGuests = adults + childrenCount;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (dateRange?.from) params.set('check_in', format(dateRange.from, 'yyyy-MM-dd'));
    if (dateRange?.to) params.set('check_out', format(dateRange.to, 'yyyy-MM-dd'));
    if (totalGuests > 1) params.set('guests', totalGuests.toString());

    setActiveStep(null);
    setIsMobileModalOpen(false);
    router.push(`/search?${params.toString()}`);
  };

  const formatDateDisplay = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`;
    }
    if (dateRange?.from) {
      return format(dateRange.from, 'MMM d');
    }
    return 'Add dates';
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-4 z-30" ref={dropdownRef}>
      
      {/* DESKTOP SEARCH PILL */}
      <div className="hidden md:flex items-center bg-bg-surface border border-border rounded-full p-2 pl-6 shadow-dark-soft hover:border-text-muted transition">
        
        {/* WHERE SEGMENT */}
        <button
          onClick={() => setActiveStep(activeStep === 'where' ? null : 'where')}
          className={cn(
            'flex-1 text-left px-4 py-2 rounded-full transition hover:bg-bg-surface-hover',
            activeStep === 'where' && 'bg-bg-surface-hover shadow-sm'
          )}
        >
          <div className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Where</div>
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setActiveStep('where');
            }}
            placeholder="Search destinations"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none truncate"
          />
        </button>

        <div className="h-8 w-px bg-border/60" />

        {/* WHEN SEGMENT */}
        <button
          onClick={() => setActiveStep(activeStep === 'when' ? null : 'when')}
          className={cn(
            'flex-1 text-left px-4 py-2 rounded-full transition hover:bg-bg-surface-hover',
            activeStep === 'when' && 'bg-bg-surface-hover shadow-sm'
          )}
        >
          <div className="text-[11px] font-bold text-text-primary uppercase tracking-wider">When</div>
          <div className="text-sm text-text-primary truncate">
            {formatDateDisplay()}
          </div>
        </button>

        <div className="h-8 w-px bg-border/60" />

        {/* WHO SEGMENT */}
        <button
          onClick={() => setActiveStep(activeStep === 'who' ? null : 'who')}
          className={cn(
            'flex-1 text-left px-4 py-2 rounded-full transition hover:bg-bg-surface-hover',
            activeStep === 'who' && 'bg-bg-surface-hover shadow-sm'
          )}
        >
          <div className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Who</div>
          <div className="text-sm text-text-primary truncate">
            {totalGuests === 1 ? '1 guest' : `${totalGuests} guests`}
            {pets > 0 && `, ${pets} pet${pets > 1 ? 's' : ''}`}
          </div>
        </button>

        {/* SEARCH BUTTON */}
        <button
          onClick={handleSearch}
          className="ml-2 flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-full font-semibold shadow-brand-glow transition-all hover:scale-105 active:scale-95"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-semibold">Search</span>
        </button>

      </div>

      {/* MOBILE COLLAPSED SEARCH BAR */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsMobileModalOpen(true)}
          className="w-full flex items-center gap-3 bg-bg-surface border border-border rounded-full p-3 px-5 shadow-dark-soft hover:bg-bg-surface-hover transition"
        >
          <Search className="w-5 h-5 text-brand" />
          <div className="flex-1 text-left">
            <div className="text-xs font-semibold text-text-primary">
              {location || 'Where to?'}
            </div>
            <div className="text-[11px] text-text-secondary">
              {formatDateDisplay()} · {totalGuests} guest{totalGuests > 1 ? 's' : ''}
            </div>
          </div>
        </button>
      </div>

      {/* DESKTOP EXPANDED DROPDOWN CARD */}
      {activeStep && (
        <div className="hidden md:block absolute top-full left-0 right-0 mt-3 bg-bg-surface border border-border rounded-3xl p-6 shadow-dark-elevated z-50 animate-in fade-in duration-150">
          
          {/* WHERE AUTOCOMPLETE */}
          {activeStep === 'where' && (
            <div>
              <p className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">Popular Destinations</p>
              <div className="grid grid-cols-2 gap-3">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setLocation(c.name);
                      setActiveStep('when');
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-surface-hover text-left transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-bg-base flex items-center justify-center text-brand border border-border">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{c.name}</div>
                      <div className="text-xs text-text-muted">{c.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WHEN RANGE CALENDAR */}
          {activeStep === 'when' && (
            <div className="flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-4 px-2">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select Date Range</p>
                {dateRange?.from && (
                  <button
                    onClick={() => setDateRange(undefined)}
                    className="text-xs text-brand hover:underline font-semibold"
                  >
                    Clear dates
                  </button>
                )}
              </div>
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={{ before: new Date() }}
              />
              <div className="w-full mt-4 flex justify-end">
                <button
                  onClick={() => setActiveStep('who')}
                  className="px-5 py-2 bg-brand text-white font-semibold rounded-full text-xs hover:bg-brand-hover transition"
                >
                  Continue to Guests
                </button>
              </div>
            </div>
          )}

          {/* WHO STEPPER */}
          {activeStep === 'who' && (
            <div className="space-y-4 max-w-md mx-auto">
              {/* Adults */}
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <div>
                  <div className="text-sm font-semibold text-text-primary">Adults</div>
                  <div className="text-xs text-text-muted">Ages 13 or above</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-bg-surface-hover disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-semibold text-text-primary">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-bg-surface-hover"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <div>
                  <div className="text-sm font-semibold text-text-primary">Children</div>
                  <div className="text-xs text-text-muted">Ages 2–12</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    disabled={childrenCount <= 0}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-bg-surface-hover disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-semibold text-text-primary">{childrenCount}</span>
                  <button
                    onClick={() => setChildrenCount(childrenCount + 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-bg-surface-hover"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <div>
                  <div className="text-sm font-semibold text-text-primary">Infants</div>
                  <div className="text-xs text-text-muted">Under 2</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                    disabled={infants <= 0}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-bg-surface-hover disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-semibold text-text-primary">{infants}</span>
                  <button
                    onClick={() => setInfants(infants + 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-bg-surface-hover"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pets */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-semibold text-text-primary">Pets</div>
                  <div className="text-xs text-text-muted">Service animals welcome</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPets(Math.max(0, pets - 1))}
                    disabled={pets <= 0}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-bg-surface-hover disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-semibold text-text-primary">{pets}</span>
                  <button
                    onClick={() => setPets(pets + 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary hover:bg-bg-surface-hover"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="w-full mt-4 py-3 bg-brand text-white font-semibold rounded-xl shadow-brand-glow transition hover:bg-brand-hover"
              >
                Apply & Search
              </button>
            </div>
          )}

        </div>
      )}

      {/* MOBILE FULL SCREEN MODAL */}
      {isMobileModalOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-bg-base flex flex-col p-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <h3 className="text-lg font-bold text-text-primary">Search stays</h3>
            <button
              onClick={() => setIsMobileModalOpen(false)}
              className="p-2 text-text-secondary hover:text-text-primary rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {/* Location input */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">Where</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search city e.g. Candolim, Siolim..."
                className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-brand text-sm"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setLocation(c.name)}
                    className="px-3 py-1.5 bg-bg-surface border border-border rounded-full text-xs text-text-primary"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">When</label>
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={{ before: new Date() }}
              />
            </div>

            {/* Guests */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase">Who</label>
              <div className="flex items-center justify-between p-3 bg-bg-surface border border-border rounded-xl">
                <span className="text-sm font-semibold text-text-primary">Guests</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary"
                  >
                    -
                  </button>
                  <span className="font-semibold text-text-primary">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <button
              onClick={handleSearch}
              className="w-full py-3 bg-brand text-white font-semibold rounded-xl shadow-brand-glow"
            >
              Search
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

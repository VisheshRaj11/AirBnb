'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, Map as MapIcon, Grid, MapPin } from 'lucide-react';
import { listingsApi, wishlistsApi } from '@/lib/api-client';
import { ListingCard } from '@/components/listing/ListingCard';
import { ListingGridSkeleton } from '@/components/listing/ListingSkeleton';
import { FilterDrawer, FilterOptions } from '@/components/filters/FilterDrawer';
import { ListingMap } from '@/components/map/ListingMap';
import { useAuth } from '@/lib/auth-context';

function SearchContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [locationParam, setLocationParam] = useState(searchParams.get('location') || '');
  const [checkInParam, setCheckInParam] = useState(searchParams.get('check_in') || '');
  const [checkOutParam, setCheckOutParam] = useState(searchParams.get('check_out') || '');
  const [guestsParam, setGuestsParam] = useState(searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceMin: undefined,
    priceMax: undefined,
    propertyType: undefined,
    amenities: [],
  });

  const [showMobileMap, setShowMobileMap] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | undefined>(undefined);

  useEffect(() => {
    setLocationParam(searchParams.get('location') || '');
    setCheckInParam(searchParams.get('check_in') || '');
    setCheckOutParam(searchParams.get('check_out') || '');
    setGuestsParam(searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined);
  }, [searchParams]);

  // Fetch listings matching search criteria
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search-listings', locationParam, checkInParam, checkOutParam, guestsParam, filters],
    queryFn: () =>
      listingsApi.getListings({
        location: locationParam || undefined,
        check_in: checkInParam || undefined,
        check_out: checkOutParam || undefined,
        guests: guestsParam,
        price_min: filters.priceMin,
        price_max: filters.priceMax,
        property_type: filters.propertyType,
        amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
        page_size: 50,
      }),
  });

  const { data: wishlists } = useQuery({
    queryKey: ['wishlists'],
    queryFn: () => wishlistsApi.getMyWishlists(),
    enabled: !!user,
  });

  const savedListingIds = new Set(wishlists?.map((w) => w.listing_id) || []);
  const activeFilterCount = (filters.priceMin ? 1 : 0) + (filters.propertyType ? 1 : 0) + filters.amenities.length;

  return (
    <div className="min-h-screen pb-12">
      
      {/* SEARCH HEADER & FILTERS BAR */}
      <div className="sticky top-20 z-30 bg-bg-surface/90 backdrop-blur-md border-b border-border py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div>
            <h1 className="text-lg font-bold text-text-primary">
              {locationParam ? `Stays in ${locationParam}` : 'All Search Results'}
            </h1>
            <p className="text-xs text-text-secondary">
              {searchResults?.total_count || 0} stays found
              {checkInParam && checkOutParam && ` · ${checkInParam} to ${checkOutParam}`}
              {guestsParam && ` · ${guestsParam} guest${guestsParam > 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Drawer Trigger */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-bg-base border border-border hover:border-text-muted rounded-full text-xs font-semibold text-text-primary transition"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Mobile Map Toggle */}
            <button
              onClick={() => setShowMobileMap(!showMobileMap)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-full text-xs font-semibold shadow-brand-glow"
            >
              {showMobileMap ? <Grid className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
              <span>{showMobileMap ? 'Grid' : 'Map'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* TWO-COLUMN DUAL VIEW (GRID LEFT, MAP RIGHT) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LISTINGS GRID (Left Column - 7 Cols on desktop) */}
          <div className={showMobileMap ? 'hidden md:block md:col-span-7' : 'col-span-12 md:col-span-7'}>
            {isLoading ? (
              <ListingGridSkeleton count={8} />
            ) : searchResults?.items && searchResults.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.items.map((listing) => (
                  <div
                    key={listing.id}
                    onMouseEnter={() => setHighlightedId(listing.id)}
                    onMouseLeave={() => setHighlightedId(undefined)}
                  >
                    <ListingCard
                      listing={listing}
                      isSavedInitial={savedListingIds.has(listing.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-bg-surface rounded-3xl border border-border">
                <MapPin className="w-12 h-12 text-brand mx-auto mb-3" />
                <h3 className="text-lg font-bold text-text-primary mb-1">No exact matches found</h3>
                <p className="text-xs text-text-secondary mb-4">
                  Try adjusting your search location, date range, or price filters.
                </p>
                <button
                  onClick={() => {
                    setFilters({ priceMin: undefined, priceMax: undefined, propertyType: undefined, amenities: [] });
                  }}
                  className="px-5 py-2.5 bg-brand text-white font-semibold rounded-full text-xs hover:bg-brand-hover transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* INTERACTIVE LEAFLET MAP (Right Column - 5 Cols on desktop sticky) */}
          <div className={showMobileMap ? 'col-span-12 h-[600px]' : 'hidden md:block md:col-span-5 h-[calc(100vh-140px)] sticky top-36'}>
            <ListingMap
              listings={searchResults?.items || []}
              highlightedListingId={highlightedId}
            />
          </div>

        </div>
      </div>

      {/* FILTER DRAWER */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
      />

    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ListingGridSkeleton count={8} />
      </div>
    }>
      <SearchContent />
    </React.Suspense>
  );
}

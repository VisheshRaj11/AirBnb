'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchPill } from '@/components/search/SearchPill';
import { CategoryRail } from '@/components/category/CategoryRail';
import { ListingCard } from '@/components/listing/ListingCard';
import { ListingGridSkeleton } from '@/components/listing/ListingSkeleton';
import { listingsApi, wishlistsApi } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ExplorePage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);

  // Fetch listings query
  const { data: listingsData, isLoading, error } = useQuery({
    queryKey: ['listings', selectedCategory, page],
    queryFn: () =>
      listingsApi.getListings({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        page,
        page_size: 24,
      }),
  });

  // Fetch user wishlist IDs
  const { data: wishlists } = useQuery({
    queryKey: ['wishlists'],
    queryFn: () => wishlistsApi.getMyWishlists(),
    enabled: !!user,
  });

  const savedListingIds = new Set(wishlists?.map((w) => w.listing_id) || []);

  return (
    <div className="min-h-screen pb-16">
      
      {/* SEARCH PILL SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 pt-2">
        <SearchPill />
      </section>

      {/* CATEGORY RAIL SECTION */}
      <section className="border-b border-border/40 pb-2">
        <CategoryRail
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setPage(1);
          }}
        />
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* HERO SECTION TITLE */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
              <span>{selectedCategory === 'All' ? 'Popular homes in North Goa' : `${selectedCategory} Stays`}</span>
              <Link
                href="/search"
                className="w-10 h-10 rounded-full bg-bg-surface hover:bg-bg-surface-hover border border-border text-text-primary flex items-center justify-center shadow-dark-soft transition-transform hover:scale-105"
                title="See all homes"
              >
                <ArrowRight className="w-5 h-5 text-text-primary" />
              </Link>
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Find handcrafted luxury villas, wooden cabins, and beachfront homes.
            </p>
          </div>
        </div>

        {/* LISTINGS GRID */}
        {isLoading ? (
          <ListingGridSkeleton count={12} />
        ) : error ? (
          <div className="p-12 text-center bg-bg-surface rounded-3xl border border-border">
            <p className="text-red-400 font-semibold mb-2">Failed to load listings</p>
            <p className="text-xs text-text-muted">Please make sure the backend server is running.</p>
          </div>
        ) : listingsData?.items && listingsData.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {listingsData.items.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isSavedInitial={savedListingIds.has(listing.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-bg-surface rounded-3xl border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-2">No listings found</h3>
            <p className="text-sm text-text-secondary mb-4">Try choosing a different category or clearing search filters.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="px-6 py-2.5 bg-brand text-white font-semibold rounded-full text-xs hover:bg-brand-hover transition"
            >
              Reset Category
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

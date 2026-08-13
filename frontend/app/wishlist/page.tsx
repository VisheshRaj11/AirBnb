'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { wishlistsApi } from '@/lib/api-client';
import { ListingCard } from '@/components/listing/ListingCard';
import { ListingGridSkeleton } from '@/components/listing/ListingSkeleton';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function WishlistPage() {
  const { user, openAuthModal } = useAuth();

  const { data: wishlists, isLoading, refetch } = useQuery({
    queryKey: ['wishlists'],
    queryFn: () => wishlistsApi.getMyWishlists(),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Heart className="w-12 h-12 text-brand mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Log in to view your wishlists</h2>
        <p className="text-sm text-text-secondary mb-6">Save your favourite stays and come back to them anytime.</p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 bg-brand text-white font-semibold rounded-full text-xs shadow-brand-glow"
        >
          Log in
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-extrabold text-text-primary mb-2">Wishlists</h1>
      <p className="text-sm text-text-secondary mb-8">Stays you have saved for future trips.</p>

      {isLoading ? (
        <ListingGridSkeleton count={6} />
      ) : wishlists && wishlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {wishlists.map((w) => (
            <ListingCard
              key={w.id}
              listing={w.listing}
              isSavedInitial={true}
              onWishlistToggle={() => refetch()}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-bg-surface rounded-3xl border border-border">
          <Heart className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h3 className="text-lg font-bold text-text-primary mb-1">Your wishlist is empty</h3>
          <p className="text-xs text-text-secondary mb-6">As you search, tap the heart icon on any stay to save it here.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-brand text-white font-semibold rounded-full text-xs shadow-brand-glow inline-block"
          >
            Start exploring
          </Link>
        </div>
      )}
    </div>
  );
}

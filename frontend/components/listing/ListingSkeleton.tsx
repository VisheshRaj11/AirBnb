'use client';

import React from 'react';

export const ListingSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[4/3] w-full rounded-2xl border border-white/10 bg-bg-surface skeleton-shimmer" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-bg-surface skeleton-shimmer" />
        <div className="h-3 w-1/2 rounded bg-bg-surface skeleton-shimmer" />
        <div className="h-4 w-1/3 rounded bg-bg-surface skeleton-shimmer mt-2" />
      </div>
    </div>
  );
};

export const ListingGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingSkeleton key={i} />
      ))}
    </div>
  );
};

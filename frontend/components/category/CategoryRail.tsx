'use client';

import React, { useRef } from 'react';
import {
  Trees,
  Flame,
  Umbrella,
  Mountain,
  Crown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Palmtree,
  Waves,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryRailProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const CATEGORIES = [
  { id: 'All', label: 'All', icon: Sparkles },
  { id: 'Experiences', label: 'Experiences', icon: Flame },
  { id: 'Services', label: 'Services', icon: Crown },
  { id: 'Amazing views', label: 'Amazing views', icon: Mountain },
  { id: 'Cabins', label: 'Cabins', icon: Trees },
  { id: 'Trending', label: 'Trending', icon: Waves },
  { id: 'Beachfront', label: 'Beachfront', icon: Umbrella },
  { id: 'Countryside', label: 'Countryside', icon: Palmtree },
  { id: 'Luxury', label: 'Luxury', icon: Crown },
  { id: 'Iconic cities', label: 'Iconic cities', icon: Building2 },
];

export const CategoryRail: React.FC<CategoryRailProps> = ({
  selectedCategory = 'All',
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 group">
      
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll categories left"
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-bg-surface border border-border text-text-primary shadow-dark-soft opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-surface-hover"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Rail Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-8 overflow-x-auto scrollbar-none scroll-smooth py-2 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              className={cn(
                'flex flex-col items-center gap-2 min-w-max pb-2 border-b-2 transition-all group/chip',
                isSelected
                  ? 'border-brand text-text-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-xl transition-transform group-hover/chip:scale-110',
                  isSelected ? 'bg-bg-surface text-brand' : 'text-text-muted group-hover/chip:text-text-primary'
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll categories right"
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-bg-surface border border-border text-text-primary shadow-dark-soft opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-surface-hover"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOptions {
  priceMin?: number;
  priceMax?: number;
  propertyType?: string;
  amenities: string[];
}

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (newFilters: FilterOptions) => void;
}

const PROPERTY_TYPES = ['All', 'Villa', 'House', 'Apartment', 'Cabin', 'Cottage'];

const AMENITY_OPTIONS = [
  'Fast Wi-Fi',
  'Private Pool',
  'Chef Kitchen',
  'Free Parking',
  'Air Conditioning',
  'Ocean View',
  'BBQ Grill',
  'Hot Tub',
  'Dedicated Workspace',
  'Beach Access',
];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [priceMin, setPriceMin] = useState<number>(filters.priceMin || 1000);
  const [priceMax, setPriceMax] = useState<number>(filters.priceMax || 50000);
  const [selectedPropType, setSelectedPropType] = useState<string>(filters.propertyType || 'All');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(filters.amenities || []);

  if (!isOpen) return null;

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleApply = () => {
    onApplyFilters({
      priceMin,
      priceMax,
      propertyType: selectedPropType === 'All' ? undefined : selectedPropType,
      amenities: selectedAmenities,
    });
    onClose();
  };

  const handleClear = () => {
    setPriceMin(1000);
    setPriceMax(50000);
    setSelectedPropType('All');
    setSelectedAmenities([]);
    onApplyFilters({
      priceMin: undefined,
      priceMax: undefined,
      propertyType: undefined,
      amenities: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-bg-surface border-l border-border h-full flex flex-col shadow-dark-elevated animate-in slide-in-from-right duration-250">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2 text-text-primary font-bold text-lg">
            <SlidersHorizontal className="w-5 h-5 text-brand" />
            <span>Filters</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-bg-surface-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* PRICE RANGE */}
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-2">Price Range (per night)</h3>
            <p className="text-xs text-text-secondary mb-4">Nightly prices before taxes and fees</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1 uppercase">Minimum (₹)</label>
                <input
                  type="number"
                  min={500}
                  max={priceMax}
                  step={500}
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  className="w-full p-2.5 bg-bg-base border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1 uppercase">Maximum (₹)</label>
                <input
                  type="number"
                  min={priceMin}
                  max={100000}
                  step={1000}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full p-2.5 bg-bg-base border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* PROPERTY TYPE */}
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-3">Property Type</h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedPropType(type)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-semibold border transition',
                    selectedPropType === type
                      ? 'bg-brand text-white border-brand shadow-brand-glow'
                      : 'bg-bg-base text-text-secondary border-border hover:border-text-muted'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* AMENITIES */}
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {AMENITY_OPTIONS.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition',
                      isChecked
                        ? 'bg-brand/15 border-brand text-brand'
                        : 'bg-bg-base border-border text-text-secondary hover:text-text-primary hover:border-border/80'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded flex items-center justify-center border transition',
                        isChecked ? 'bg-brand border-brand text-white' : 'border-border bg-bg-surface'
                      )}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-border flex items-center justify-between gap-4">
          <button
            onClick={handleClear}
            className="text-xs font-semibold text-text-primary underline hover:text-brand transition"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl text-sm shadow-brand-glow transition"
          >
            Show Places
          </button>
        </div>

      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, UploadCloud, Trash2 } from 'lucide-react';
import { listingsApi, uploadsApi } from '@/lib/api-client';
import { getFullImageUrl } from '@/lib/utils';
import { toast } from 'sonner';

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = Number(params.id);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => listingsApi.getListingById(listingId),
    enabled: !isNaN(listingId),
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('Villa');
  const [category, setCategory] = useState('Beachfront');
  const [pricePerNight, setPricePerNight] = useState(10000);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description);
      setPropertyType(listing.property_type);
      setCategory(listing.category);
      setPricePerNight(listing.price_per_night);
      setAddress(listing.address);
      setCity(listing.city);
      setState(listing.state);
      setPhotos(listing.photos.map((p) => p.url));
    }
  }, [listing]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await listingsApi.updateListing(listingId, {
        title,
        description,
        property_type: propertyType,
        category,
        price_per_night: Number(pricePerNight),
        address,
        city,
        state,
        photos,
      });
      toast.success('Listing updated successfully!');
      router.push('/host/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-8 w-1/3 bg-bg-surface rounded-xl skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to dashboard</span>
      </button>

      <h1 className="text-3xl font-extrabold text-text-primary mb-8">Edit Listing: {listing.title}</h1>

      <form onSubmit={handleUpdate} className="space-y-6 bg-bg-surface p-6 border border-border rounded-3xl">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Listing Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Description</label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Nightly Price (₹)</label>
            <input
              type="number"
              required
              value={pricePerNight}
              onChange={(e) => setPricePerNight(Number(e.target.value))}
              className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">City</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-3 bg-bg-base border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-2">Listing Photos</label>
          <div className="grid grid-cols-3 gap-4">
            {photos.map((url, idx) => (
              <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group">
                <img src={getFullImageUrl(url)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl shadow-brand-glow transition text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, UploadCloud, CheckCircle, Plus, Trash2, Home, MapPin, Camera, Sparkles, DollarSign } from 'lucide-react';
import { uploadsApi, listingsApi } from '@/lib/api-client';
import { getFullImageUrl, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = ['Beachfront', 'Cabins', 'Amazing views', 'Trending', 'Luxury', 'Iconic cities', 'Countryside'];
const PROPERTY_TYPE_OPTIONS = ['Apartment', 'Villa', 'Cabin', 'House', 'Cottage', 'Penthouse'];

export default function CreateListingWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('Villa');
  const [category, setCategory] = useState('Beachfront');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Goa');
  const [state, setState] = useState('Goa');
  const [country, setCountry] = useState('India');
  const [lat, setLat] = useState(15.5176);
  const [lng, setLng] = useState(73.7628);

  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);
  const [maxGuests, setMaxGuests] = useState(4);
  const [bedrooms, setBedrooms] = useState(2);
  const [beds, setBeds] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [pricePerNight, setPricePerNight] = useState(12000);

  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch amenities list from API
  const { data: amenitiesList } = useQuery({
    queryKey: ['amenities'],
    queryFn: () => uploadsApi.getAmenities(),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map((f) => uploadsApi.uploadFile(f));
      const urls = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...urls]);
      toast.success('Photos uploaded successfully!');
    } catch (err: any) {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const toggleAmenity = (id: number) => {
    if (selectedAmenityIds.includes(id)) {
      setSelectedAmenityIds(selectedAmenityIds.filter((i) => i !== id));
    } else {
      setSelectedAmenityIds([...selectedAmenityIds, id]);
    }
  };

  const handlePublish = async () => {
    if (!title || !description || photos.length === 0) {
      toast.error('Please complete all required fields and upload at least one photo.');
      return;
    }
    setIsPublishing(true);
    try {
      const newListing = await listingsApi.createListing({
        title,
        description,
        property_type: propertyType,
        category,
        price_per_night: Number(pricePerNight),
        address,
        city,
        state,
        country,
        lat: Number(lat),
        lng: Number(lng),
        max_guests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        beds: Number(beds),
        bathrooms: Number(bathrooms),
        photos,
        amenity_ids: selectedAmenityIds,
      });

      toast.success('Congratulations! Your listing is now live.');
      router.push(`/listing/${newListing.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to publish listing.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* HEADER WIZARD PROGRESS */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
          className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 1 ? 'Cancel' : 'Back'}</span>
        </button>

        <div className="text-xs font-bold text-brand uppercase tracking-wider">
          Step {step} of 5
        </div>
      </div>

      {/* STEP 1: BASICS */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-text-primary">Tell us about your place</h2>
          
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Listing Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunset Villa with Private Infinity Pool"
              className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Description</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your space, atmosphere, neighborhood, and special features..."
              className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
              >
                {PROPERTY_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-text-primary">Where is your place located?</h2>
          
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Street Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 102 Beach Road, Near Fort"
              className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Country</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PHOTOS */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-text-primary">Add photos of your space</h2>
          <p className="text-xs text-text-secondary">Upload high-resolution photos via S3 presigned URLs or local server storage.</p>

          <div className="border-2 border-dashed border-border rounded-3xl p-8 text-center bg-bg-surface hover:border-brand transition">
            <UploadCloud className="w-10 h-10 text-brand mx-auto mb-2" />
            <p className="text-xs font-bold text-text-primary mb-1">Click or drag images to upload</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="photo-upload-input"
            />
            <label
              htmlFor="photo-upload-input"
              className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-brand-hover inline-block mt-2"
            >
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </label>
          </div>

          {/* PREVIEW THUMBNAILS */}
          <div className="grid grid-cols-3 gap-4">
            {photos.map((url, idx) => (
              <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group">
                <img src={getFullImageUrl(url)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: AMENITIES & CAPACITY */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-text-primary">Amenities & Guest Capacity</h2>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-3 uppercase">Select Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenitiesList?.map((amen) => {
                const isSelected = selectedAmenityIds.includes(amen.id);
                return (
                  <button
                    key={amen.id}
                    type="button"
                    onClick={() => toggleAmenity(amen.id)}
                    className={cn(
                      'p-3 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between',
                      isSelected ? 'bg-brand/15 border-brand text-brand' : 'bg-bg-surface border-border text-text-primary'
                    )}
                  >
                    <span>{amen.name}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-brand" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Max Guests</label>
              <input type="number" min={1} value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value))} className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Bedrooms</label>
              <input type="number" min={1} value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Beds</label>
              <input type="number" min={1} value={beds} onChange={(e) => setBeds(Number(e.target.value))} className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Bathrooms</label>
              <input type="number" min={0.5} step={0.5} value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} className="w-full p-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: PRICING & PUBLISH */}
      {step === 5 && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold text-text-primary">Set your nightly price</h2>
          
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Price per night (₹ INR)</label>
            <input
              type="number"
              step={500}
              required
              value={pricePerNight}
              onChange={(e) => setPricePerNight(Number(e.target.value))}
              className="w-full p-4 bg-bg-surface border border-border rounded-2xl text-text-primary text-2xl font-bold focus:outline-none focus:border-brand"
            />
          </div>

          <div className="p-6 bg-bg-surface border border-border rounded-3xl space-y-3">
            <h3 className="font-bold text-text-primary text-sm">Listing Summary</h3>
            <p className="text-xs text-text-secondary"><strong>Title:</strong> {title || 'Untitled'}</p>
            <p className="text-xs text-text-secondary"><strong>Location:</strong> {address}, {city}, {state}</p>
            <p className="text-xs text-text-secondary"><strong>Type:</strong> {propertyType} · {category}</p>
            <p className="text-xs text-text-secondary"><strong>Photos:</strong> {photos.length} uploaded</p>
          </div>
        </div>
      )}

      {/* FOOTER WIZARD CONTROLS */}
      <div className="pt-8 border-t border-border flex justify-end gap-4">
        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-3 bg-brand text-white font-bold rounded-2xl text-sm shadow-brand-glow hover:bg-brand-hover transition flex items-center gap-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-8 py-3.5 bg-brand text-white font-bold rounded-2xl text-base shadow-brand-glow hover:bg-brand-hover transition disabled:opacity-50"
          >
            {isPublishing ? 'Publishing listing...' : 'Publish Listing'}
          </button>
        )}
      </div>

    </div>
  );
}

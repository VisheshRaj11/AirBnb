'use client';

import React, { useEffect, useState } from 'react';
import { Listing } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

interface ListingMapProps {
  listings: Listing[];
  highlightedListingId?: number;
  center?: [number, number];
}

export const ListingMapInner: React.FC<ListingMapProps> = ({
  listings,
  highlightedListingId,
  center = [15.5176, 73.7628], // Default Goa center
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [LeafletModules, setLeafletModules] = useState<any>(null);

  useEffect(() => {
    // Dynamically import Leaflet components on client side
    Promise.all([
      import('leaflet'),
      import('react-leaflet')
    ]).then(([L, RL]) => {
      setLeafletModules({ L, RL });
      setMapLoaded(true);
    });
  }, []);

  if (!mapLoaded || !LeafletModules) {
    return (
      <div className="w-full h-full min-h-[400px] bg-bg-surface rounded-2xl border border-border flex items-center justify-center text-text-muted text-sm skeleton-shimmer">
        Loading Interactive Map...
      </div>
    );
  }

  const { L, RL } = LeafletModules;
  const { MapContainer, TileLayer, Marker, Popup } = RL;

  // Custom marker icon creation helper
  const createPriceIcon = (price: number, isHighlighted: boolean) => {
    const priceText = formatPrice(price).replace('.00', '');
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="px-2.5 py-1 rounded-full text-xs font-bold shadow-md transition-transform border ${
          isHighlighted
            ? 'bg-brand text-white border-white scale-110 z-50'
            : 'bg-bg-surface text-text-primary border-border hover:bg-brand hover:text-white'
        }">
          ${priceText}
        </div>
      `,
      iconSize: [60, 24],
      iconAnchor: [30, 12],
    });
  };

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-border dark-leaflet-map shadow-dark-soft">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full min-h-[450px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.map((l) => (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={createPriceIcon(l.price_per_night, l.id === highlightedListingId)}
          >
            <Popup className="dark-leaflet-popup">
              <div className="w-48 p-1">
                <img
                  src={l.photos[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400'}
                  alt={l.title}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <h4 className="font-bold text-xs line-clamp-1 text-slate-900">{l.title}</h4>
                <p className="text-[11px] text-slate-600 font-semibold">{formatPrice(l.price_per_night)} / night</p>
                <a
                  href={`/listing/${l.id}`}
                  className="mt-2 block text-center py-1 bg-rose-500 text-white rounded text-[11px] font-semibold hover:bg-rose-600"
                >
                  View Details
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export const ListingMap = ListingMapInner;

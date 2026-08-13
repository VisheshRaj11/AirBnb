export interface User {
  id: number;
  name: string;
  email: string;
  role: 'guest' | 'host' | 'both';
  avatar_url?: string;
  is_superhost: boolean;
  created_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon_key: string;
}

export interface ListingPhoto {
  id: number;
  url: string;
  sort_order: number;
}

export interface Listing {
  id: number;
  host_id: number;
  title: string;
  description: string;
  property_type: string;
  category: string;
  price_per_night: number;
  currency: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  host: User;
  photos: ListingPhoto[];
  amenities: Amenity[];
  rating: number;
  reviews_count: number;
  is_guest_favourite: boolean;
}

export interface PaginatedListings {
  items: Listing[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests_count: number;
  nightly_rate_snapshot: number;
  nights: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  listing: Listing;
  guest: User;
  has_review?: boolean;
}

export interface Review {
  id: number;
  booking_id: number;
  listing_id: number;
  reviewer_id: number;
  rating: number;
  cleanliness_rating: number;
  accuracy_rating: number;
  checkin_rating: number;
  value_rating: number;
  comment: string;
  created_at: string;
  reviewer: User;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  listing_id: number;
  created_at: string;
  listing: Listing;
}

export interface BlockedDateRange {
  check_in: string;
  check_out: string;
}

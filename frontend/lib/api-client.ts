import axios from 'axios';
import {
  User,
  Listing,
  PaginatedListings,
  Booking,
  Review,
  WishlistItem,
  BlockedDateRange,
  Amenity,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airbnb-0sd0.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token from localStorage if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// AUTH API
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      email,
      password,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.data.access_token);
    }
    return res.data;
  },
  register: async (name: string, email: string, password: string, role: 'guest' | 'host' | 'both' = 'guest') => {
    const res = await apiClient.post<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      name,
      email,
      password,
      role,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.data.access_token);
    }
    return res.data;
  },
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
  },
  getMe: async () => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
  updateRole: async (role: 'guest' | 'host' | 'both') => {
    const res = await apiClient.patch<User>('/auth/role', { role });
    return res.data;
  },
};

// LISTINGS API
export const listingsApi = {
  getListings: async (params?: {
    location?: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
    price_min?: number;
    price_max?: number;
    property_type?: string;
    category?: string;
    amenities?: string[];
    host_only?: boolean;
    page?: number;
    page_size?: number;
  }) => {
    const res = await apiClient.get<PaginatedListings>('/listings', { params });
    return res.data;
  },
  getListingById: async (id: number) => {
    const res = await apiClient.get<Listing>(`/listings/${id}`);
    return res.data;
  },
  createListing: async (payload: {
    title: string;
    description: string;
    property_type: string;
    category: string;
    price_per_night: number;
    address: string;
    city: string;
    state: string;
    country?: string;
    lat: number;
    lng: number;
    max_guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    photos: string[];
    amenity_ids: number[];
  }) => {
    const res = await apiClient.post<Listing>('/listings', payload);
    return res.data;
  },
  updateListing: async (id: number, payload: Partial<any>) => {
    const res = await apiClient.put<Listing>(`/listings/${id}`, payload);
    return res.data;
  },
  deleteListing: async (id: number) => {
    const res = await apiClient.delete<{ message: string }>(`/listings/${id}`);
    return res.data;
  },
  getAvailability: async (id: number) => {
    const res = await apiClient.get<BlockedDateRange[]>(`/listings/${id}/availability`);
    return res.data;
  },
  getReviews: async (id: number) => {
    const res = await apiClient.get<Review[]>(`/listings/${id}/reviews`);
    return res.data;
  },
};

// BOOKINGS API
export const bookingsApi = {
  createBooking: async (payload: {
    listing_id: number;
    check_in: string;
    check_out: string;
    guests_count: number;
  }) => {
    const res = await apiClient.post<Booking>('/bookings', payload);
    return res.data;
  },
  getMyBookings: async () => {
    const res = await apiClient.get<Booking[]>('/bookings/me');
    return res.data;
  },
  getHostBookings: async () => {
    const res = await apiClient.get<Booking[]>('/bookings/host');
    return res.data;
  },
  cancelBooking: async (id: number) => {
    const res = await apiClient.patch<Booking>(`/bookings/${id}/cancel`);
    return res.data;
  },
};

// REVIEWS API
export const reviewsApi = {
  createReview: async (payload: {
    booking_id: number;
    rating: number;
    cleanliness_rating?: number;
    accuracy_rating?: number;
    checkin_rating?: number;
    value_rating?: number;
    comment: string;
  }) => {
    const res = await apiClient.post<Review>('/reviews', payload);
    return res.data;
  },
};

// WISHLISTS API
export const wishlistsApi = {
  getMyWishlists: async () => {
    const res = await apiClient.get<WishlistItem[]>('/wishlists/me');
    return res.data;
  },
  toggleWishlist: async (listingId: number) => {
    const res = await apiClient.post<{ is_saved: boolean; listing_id: number }>(`/wishlists/${listingId}`);
    return res.data;
  },
};

// UPLOADS & GENERAL API
export const uploadsApi = {
  uploadFile: async (file: File) => {
    // Check presign endpoint
    const presignRes = await apiClient.post<{ is_s3: boolean; upload_url: string; file_url: string; key: string }>(
      '/uploads/presign',
      { file_name: file.name, file_type: file.type }
    );

    if (presignRes.data.is_s3) {
      // Upload directly to S3
      await axios.put(presignRes.data.upload_url, file, {
        headers: { 'Content-Type': file.type },
      });
      return presignRes.data.file_url;
    } else {
      // Local fallback multipart upload
      const formData = new FormData();
      formData.append('file', file);
      const localRes = await apiClient.post<{ url: string; filename: string }>('/uploads/local', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return localRes.data.url;
    }
  },
  getAmenities: async () => {
    const res = await apiClient.get<Amenity[]>('/amenities');
    return res.data;
  },
};

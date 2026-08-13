'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit3, Trash2, Calendar, DollarSign, Home, Award, ExternalLink } from 'lucide-react';
import { listingsApi, bookingsApi } from '@/lib/api-client';
import { getFullImageUrl, formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HostDashboardPage() {
  const { user, activeRoleMode, toggleRoleMode } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: listingsData, isLoading: isLoadingListings } = useQuery({
    queryKey: ['host-listings'],
    queryFn: () => listingsApi.getListings({ host_only: true, page_size: 100 }),
    enabled: !!user,
  });

  const { data: hostBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['host-bookings'],
    queryFn: () => bookingsApi.getHostBookings(),
    enabled: !!user,
  });

  const deleteListingMutation = useMutation({
    mutationFn: (id: number) => listingsApi.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-listings'] });
      toast.success('Listing deleted successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || 'Failed to delete listing';
      toast.error(msg, { duration: 5000 });
    },
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Host Access Required</h2>
        <p className="text-sm text-text-secondary mb-6">Log in with a host account to manage your property listings and guest reservations.</p>
      </div>
    );
  }

  const listings = listingsData?.items || [];
  const totalRevenue = hostBookings?.reduce((sum, b) => (b.status === 'confirmed' ? sum + b.total_price : sum), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* HOST HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Host Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Manage listings, view incoming guest bookings, and track revenue.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/host/listings/new"
            className="flex items-center gap-2 px-5 py-3 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl shadow-brand-glow transition text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Listing</span>
          </Link>
        </div>
      </div>

      {/* SUMMARY WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-bg-surface border border-border rounded-3xl space-y-2 shadow-dark-soft">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Listings</span>
            <Home className="w-5 h-5 text-brand" />
          </div>
          <div className="text-3xl font-extrabold text-text-primary">{listings.length}</div>
        </div>

        <div className="p-6 bg-bg-surface border border-border rounded-3xl space-y-2 shadow-dark-soft">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
            <Calendar className="w-5 h-5 text-brand" />
          </div>
          <div className="text-3xl font-extrabold text-text-primary">{hostBookings?.length || 0}</div>
        </div>

        <div className="p-6 bg-bg-surface border border-border rounded-3xl space-y-2 shadow-dark-soft">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <div className="text-3xl font-extrabold text-success">{formatPrice(totalRevenue)}</div>
        </div>
      </div>

      {/* OWNED LISTINGS SECTION */}
      <div className="space-y-6 mb-12">
        <h2 className="text-xl font-bold text-text-primary">Your Property Listings</h2>

        {isLoadingListings ? (
          <div className="h-40 bg-bg-surface rounded-3xl skeleton-shimmer" />
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <div key={l.id} className="bg-bg-surface border border-border rounded-3xl p-4 flex flex-col justify-between shadow-dark-soft">
                <div>
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-3">
                    <img src={getFullImageUrl(l.photos[0]?.url)} alt={l.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-[11px] font-semibold text-white">
                      {l.property_type}
                    </span>
                  </div>
                  <h3 className="font-bold text-text-primary text-sm line-clamp-1">{l.title}</h3>
                  <p className="text-xs text-text-secondary">{l.city}, {l.state}</p>
                  <p className="text-xs font-bold text-brand mt-1">{formatPrice(l.price_per_night)} / night</p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60">
                  <Link
                    href={`/listing/${l.id}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Preview
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/host/listings/${l.id}/edit`)}
                      className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-full transition"
                      title="Edit Listing"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        toast(`Delete listing "${l.title}"?`, {
                          description: 'Active bookings will prevent deletion.',
                          action: {
                            label: 'Delete',
                            onClick: () => deleteListingMutation.mutate(l.id),
                          },
                          cancel: {
                            label: 'Cancel',
                            onClick: () => {},
                          },
                        });
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-bg-surface rounded-3xl border border-border">
            <p className="text-sm text-text-secondary mb-4">You have not created any listings yet.</p>
            <Link
              href="/host/listings/new"
              className="px-6 py-2.5 bg-brand text-white font-semibold rounded-full text-xs"
            >
              Create your first listing
            </Link>
          </div>
        )}
      </div>

      {/* INCOMING BOOKINGS TABLE */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-text-primary">Incoming Guest Reservations</h2>
        
        {isLoadingBookings ? (
          <div className="h-32 bg-bg-surface rounded-3xl skeleton-shimmer" />
        ) : hostBookings && hostBookings.length > 0 ? (
          <div className="overflow-x-auto bg-bg-surface border border-border rounded-3xl shadow-dark-soft">
            <table className="w-full text-left text-xs text-text-primary">
              <thead className="border-b border-border text-text-muted bg-bg-base/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Guest</th>
                  <th className="px-6 py-4">Listing</th>
                  <th className="px-6 py-4">Check-in / Check-out</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {hostBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-bg-surface-hover/50 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={b.guest.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="" className="w-8 h-8 rounded-full border border-border" />
                      <div>
                        <div className="font-semibold">{b.guest.name}</div>
                        <div className="text-text-muted text-[11px]">{b.guest.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate font-medium">{b.listing.title}</td>
                    <td className="px-6 py-4">{b.check_in} to {b.check_out}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-brand/15 text-brand">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-success">{formatPrice(b.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-bg-surface rounded-3xl border border-border text-xs text-text-muted">
            No incoming guest bookings found yet.
          </div>
        )}
      </div>

    </div>
  );
}

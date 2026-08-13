'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Sparkles,
  Briefcase,
  Globe,
  Menu,
  User as UserIcon,
  Heart,
  Calendar,
  LayoutDashboard,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

import { bnbnbBeloIcon, AirbnbFullLogo } from './AirbnbLogo';

export const Header: React.FC = () => {
  const { user, openAuthModal, logout, activeRoleMode, toggleRoleMode } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'All' | 'Homes' | 'Experiences' | 'Services'>('All');

  const navTabs = [
    { id: 'All', label: 'All', icon: Home },
    { id: 'Homes', label: 'Homes', icon: Compass },
    { id: 'Experiences', label: 'Experiences', icon: Sparkles },
    { id: 'Services', label: 'Services', icon: Briefcase },
  ] as const;

  const handleTabClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    if (tabId === 'All') {
      router.push('/');
    } else if (tabId === 'Homes') {
      router.push('/search?property_type=Villa');
    } else if (tabId === 'Experiences') {
      router.push('/search?category=Experiences');
    } else if (tabId === 'Services') {
      router.push('/search?category=Services');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-bg-surface/90 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center group">
            <div className="group-hover:scale-105 transition-transform">
              <AirbnbFullLogo className="h-9" />
            </div>
          </Link>

          {/* CENTER TABS (ALL / HOMES / EXPERIENCES / SERVICES) */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex flex-col items-center gap-1 py-1 group relative transition-colors ${
                    isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-brand rounded-full animate-in fade-in" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-3">
            {/* Host Switcher CTA */}
            <button
              onClick={toggleRoleMode}
              className="hidden lg:block text-xs font-semibold text-text-primary hover:bg-bg-surface-hover px-4 py-2.5 rounded-full border border-border/50 transition"
            >
              {activeRoleMode === 'host' ? 'Switch to guest' : 'Become a host'}
            </button>

            {/* Language / Globe Icon */}
            <button
              onClick={() => toast.info('Language selected: English (IN) · INR (₹)')}
              aria-label="Language & currency options"
              className="hidden sm:flex p-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-full transition"
            >
              <Globe className="w-5 h-5" />
            </button>

            {/* User Menu Pill Button */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User account menu"
                aria-expanded={isUserMenuOpen}
                className="flex items-center gap-3 p-1.5 pl-3 border border-border rounded-full bg-bg-surface hover:bg-bg-surface-hover hover:shadow-dark-soft transition"
              >
                <Menu className="w-4 h-4 text-text-secondary" />
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-text-secondary">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                  className="absolute right-0 mt-3 w-64 bg-bg-surface border border-border rounded-2xl shadow-dark-elevated py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-border/60">
                        <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                        <p className="text-xs text-text-secondary truncate">{user.email}</p>
                        <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand/15 text-brand">
                          Mode: {activeRoleMode === 'host' ? 'Host' : 'Guest'}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/trips"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-surface-hover transition"
                        >
                          <Calendar className="w-4 h-4 text-text-secondary" />
                          My Trips
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-surface-hover transition"
                        >
                          <Heart className="w-4 h-4 text-text-secondary" />
                          Wishlists
                        </Link>
                      </div>

                      <div className="py-1 border-t border-border/60">
                        {activeRoleMode === 'host' ? (
                          <>
                            <Link
                              href="/host/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-surface-hover transition"
                            >
                              <LayoutDashboard className="w-4 h-4 text-brand" />
                              Host Dashboard
                            </Link>
                            <Link
                              href="/host/listings/new"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-surface-hover transition"
                            >
                              <PlusCircle className="w-4 h-4 text-brand" />
                              Create New Listing
                            </Link>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              toggleRoleMode();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-surface-hover transition text-left"
                          >
                            <LayoutDashboard className="w-4 h-4 text-text-secondary" />
                            Switch to hosting
                          </button>
                        )}
                      </div>

                      <div className="py-1 border-t border-border/60">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                            toast.success('Logged out successfully');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-bg-surface-hover transition text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-surface-hover transition"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openAuthModal('register');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-surface-hover transition"
                      >
                        Sign up
                      </button>
                      <div className="border-t border-border/60 my-1" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-surface-hover transition"
                      >
                        Airbnb your home
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

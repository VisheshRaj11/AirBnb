import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getFullImageUrl(path: string | undefined): string {
  if (!path) return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://airbnb-0sd0.onrender.com/api/v1').replace(/\/api\/v1\/?$/, '');
  return `${apiBase}${path}`;
}

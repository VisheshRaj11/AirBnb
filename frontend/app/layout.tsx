import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';
import { Header } from '@/components/nav/Header';
import { AuthModal } from '@/components/auth/AuthModal';

export const metadata: Metadata = {
  title: 'Airbnb Clone | Vacation Rentals & Beach Houses in Dark Mode',
  description: 'Book unique places to stay and things to do on Airbnb Clone. Styled in high-contrast dark theme.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-base text-text-primary min-h-screen flex flex-col antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          
          <footer className="w-full bg-bg-surface border-t border-border mt-16 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
              <p>© 2026 Airbnb Clone, Inc. · Dark Mode Edition · Built with Next.js & FastAPI</p>
              <div className="flex items-center gap-6 font-medium">
                <a href="#" className="hover:text-text-primary transition">Privacy</a>
                <a href="#" className="hover:text-text-primary transition">Terms</a>
                <a href="#" className="hover:text-text-primary transition">Sitemap</a>
                <a href="#" className="hover:text-text-primary transition">Company Details</a>
              </div>
            </div>
          </footer>

          <AuthModal />
        </Providers>
      </body>
    </html>
  );
}

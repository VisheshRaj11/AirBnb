'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/Spinner';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, login, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (authModalMode === 'login') {
        await login(email, password);
        toast.success('Successfully logged in!');
      } else {
        await register(name, email, password);
        toast.success('Account created successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-bg-surface border border-border rounded-2xl p-6 shadow-dark-elevated">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-bg-surface-hover transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">
          {authModalMode === 'login' ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-sm text-text-secondary text-center mb-6">
          {authModalMode === 'login'
            ? 'Log in to manage trips and save favourite listings.'
            : 'Join Airbnb to book stays or list your property.'}
        </p>

        {/* Demo Login Shortcuts */}
        <div className="mb-6 p-3 bg-bg-base border border-border rounded-xl">
          <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Quick Demo Login</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemo('demo.both@airbnb.clone')}
              aria-label="Use Demo User credentials"
              className="px-3 py-1.5 text-xs bg-bg-surface-hover hover:bg-border text-brand font-medium rounded-lg transition"
            >
              Demo User (Both Roles)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('demo.guest@airbnb.clone')}
              aria-label="Use Demo Guest credentials"
              className="px-3 py-1.5 text-xs bg-bg-surface-hover hover:bg-border text-text-primary rounded-lg transition"
            >
              Demo Guest
            </button>
            <button
              type="button"
              onClick={() => fillDemo('demo.host@airbnb.clone')}
              aria-label="Use Demo Host credentials"
              className="px-3 py-1.5 text-xs bg-bg-surface-hover hover:bg-border text-text-primary rounded-lg transition"
            >
              Demo Host
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'register' && (
            <div>
              <label htmlFor="auth-name-input" className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-border rounded-xl text-text-primary focus:outline-none focus:border-brand text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email-input" className="block text-xs font-medium text-text-secondary mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-border rounded-xl text-text-primary focus:outline-none focus:border-brand text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password-input" className="block text-xs font-medium text-text-secondary mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-border rounded-xl text-text-primary focus:outline-none focus:border-brand text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-label={authModalMode === 'login' ? 'Log in' : 'Create account'}
            className="w-full py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl shadow-brand-glow transition disabled:opacity-50"
          >
            {isSubmitting
              ? 'Please wait...'
              : authModalMode === 'login'
              ? 'Log in'
              : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text-secondary">
          {authModalMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="text-brand font-semibold hover:underline ml-1"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-brand font-semibold hover:underline ml-1"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

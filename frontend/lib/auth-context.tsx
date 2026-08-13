'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';
import { authApi } from './api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  activeRoleMode: 'guest' | 'host';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'guest' | 'host' | 'both') => Promise<void>;
  logout: () => Promise<void>;
  toggleRoleMode: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [activeRoleMode, setActiveRoleMode] = useState<'guest' | 'host'>('guest');

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await authApi.getMe();
        setUser(currentUser);
        if (currentUser.role === 'host') {
          setActiveRoleMode('host');
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    if (data.user.role === 'host') {
      setActiveRoleMode('host');
    }
    closeAuthModal();
  };

  const register = async (name: string, email: string, password: string, role: 'guest' | 'host' | 'both' = 'guest') => {
    const data = await authApi.register(name, email, password, role);
    setUser(data.user);
    if (data.user.role === 'host') {
      setActiveRoleMode('host');
    }
    closeAuthModal();
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setActiveRoleMode('guest');
  };

  const toggleRoleMode = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    const newRole = activeRoleMode === 'guest' ? 'host' : 'guest';
    // If user's role is 'guest' and switching to host, upgrade user's role to 'both' on backend
    if (newRole === 'host' && user.role === 'guest') {
      const updated = await authApi.updateRole('both');
      setUser(updated);
    }
    setActiveRoleMode(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        activeRoleMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        toggleRoleMode,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

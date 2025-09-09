'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from './tenant-provider';
import { 
  setTokens, 
  getAccessToken, 
  getRefreshToken, 
  clearTokens as clearAuthTokens,
  isAuthenticated as checkAuth,
  setCurrentTenant,
  migrateFromLocalStorage,
  getAuthHeaders
} from '@/lib/security/cookie-auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TREASURER' | 'MANAGER' | 'MEMBER';
  tenantId?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDonor: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    // Migrer depuis localStorage si nécessaire
    migrateFromLocalStorage();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = getAccessToken();
      const refreshToken = getRefreshToken();
      
      if (!token || !refreshToken) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (tenant?.id) {
          setCurrentTenant(tenant.id);
        }
      } else if (response.status === 401) {
        // Token expired, try to refresh
        await refreshTokenHandler();
      } else {
        // Invalid token, clear storage
        clearAuthTokens();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(tenant?.id && { 'X-Tenant-ID': tenant.id })
          },
          body: JSON.stringify({ email, password })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Échec de la connexion');
      }

      const data = await response.json();
      
      // Vérifier la structure de la réponse
      // L'API retourne les tokens dans un objet 'tokens'
      let accessToken, refreshToken;
      
      if (data.tokens) {
        accessToken = data.tokens.accessToken || data.tokens.access_token;
        refreshToken = data.tokens.refreshToken || data.tokens.refresh_token;
      } else {
        // Fallback si les tokens sont directement dans data
        accessToken = data.accessToken || data.access_token || data.token;
        refreshToken = data.refreshToken || data.refresh_token;
      }
      
      // Si les tokens sont présents, les stocker
      if (accessToken && refreshToken) {
        // Store tokens securely in cookies
        setTokens({
          accessToken,
          refreshToken
        });
      } else {
        // Si pas de tokens, c'est probablement une erreur d'auth
        console.error('No valid tokens in response:', data);
        throw new Error('Authentication failed: no tokens received');
      }
      
      // Store tenant ID if available
      if (tenant?.id) {
        setCurrentTenant(tenant.id);
      }
      
      // Set user data (peut être dans data.user ou directement dans data)
      setUser(data.user || data);
      
      // Redirect based on role
      if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
        router.push(`/sites/${tenant?.slug}/admin`);
      } else {
        router.push(`/sites/${tenant?.slug}/donor`);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(tenant?.id && { 'X-Tenant-ID': tenant.id })
          },
          body: JSON.stringify({
            ...data,
            tenantId: tenant?.id // Associate with current tenant if on a custom site
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Échec de l\'inscription');
      }

      const result = await response.json();
      
      // Auto-login after registration with secure cookies
      // Vérifier si les tokens sont dans result.tokens ou directement dans result
      let accessToken, refreshToken;
      
      if (result.tokens) {
        accessToken = result.tokens.accessToken || result.tokens.access_token;
        refreshToken = result.tokens.refreshToken || result.tokens.refresh_token;
      } else {
        accessToken = result.accessToken || result.access_token;
        refreshToken = result.refreshToken || result.refresh_token;
      }
      
      if (accessToken && refreshToken) {
        setTokens({
          accessToken,
          refreshToken
        });
      }
      
      // Store tenant ID if available
      if (tenant?.id) {
        setCurrentTenant(tenant.id);
      }
      
      setUser(result.user || result);
      
      // Redirect to donor portal
      router.push(`/sites/${tenant?.slug}/donor`);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    // Clear tokens from secure storage
    clearAuthTokens();
    
    // Clear user data
    setUser(null);
    
    // Redirect to home
    if (tenant?.slug) {
      router.push(`/sites/${tenant.slug}`);
    } else {
      router.push('/');
    }
  }, [tenant, router]);

  const refreshTokenHandler = async () => {
    try {
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(tenant?.id && { 'X-Tenant-ID': tenant.id })
          },
          body: JSON.stringify({ refreshToken })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Update tokens in secure cookies
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });
      
      // Update user data
      setUser(data.user);
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return;

    // Refresh token every 45 minutes (assuming 1-hour expiry)
    const interval = setInterval(() => {
      refreshTokenHandler();
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isDonor: !!user && user.role === 'MEMBER',
    login,
    register,
    logout,
    refreshToken: refreshTokenHandler,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireAdmin?: boolean;
    redirectTo?: string;
  }
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const router = useRouter();
    const { tenant } = useTenant();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push(options?.redirectTo || `/sites/${tenant?.slug}/auth/login`);
        } else if (options?.requireAdmin && !isAdmin) {
          router.push(`/sites/${tenant?.slug}/donor`);
        }
      }
    }, [isAuthenticated, isAdmin, loading, router, tenant]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      );
    }

    if (!isAuthenticated || (options?.requireAdmin && !isAdmin)) {
      return null;
    }

    return <Component {...props} />;
  };
}
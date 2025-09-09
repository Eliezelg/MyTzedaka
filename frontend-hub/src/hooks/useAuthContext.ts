'use client'

import { useContext } from 'react'
import { UnifiedAuthContext } from '@/contexts/UnifiedAuthContext'

/**
 * Hook d'authentification qui utilise toujours le contexte unifié
 * Centralise tout le système d'authentification
 */
export function useAuthContext() {
  try {
    // Toujours utiliser le contexte unifié
    const unifiedContext = useContext(UnifiedAuthContext as any)
    
    if (unifiedContext) {
      return unifiedContext
    }
    
    // Si aucun contexte n'est disponible, retourner un état par défaut
    return {
      user: null,
      tenant: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      isAdmin: false,
      isDonor: false,
      isSiteMode: false,
      currentTenantSlug: null,
      login: async () => {},
      logout: async () => {},
      register: async () => {},
      refreshToken: async () => {},
      updateProfile: async () => {},
    }
  } catch (error) {
    // En cas d'erreur, retourner un état par défaut
    return {
      user: null,
      tenant: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      isAdmin: false,
      isDonor: false,
      isSiteMode: false,
      currentTenantSlug: null,
      login: async () => {},
      logout: async () => {},
      register: async () => {},
      refreshToken: async () => {},
      updateProfile: async () => {},
    }
  }
}

// Export pour compatibilité avec l'ancien système
export const useAuth = useAuthContext
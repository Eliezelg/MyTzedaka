'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthState, User, Tenant, LoginRequest, RegisterRequest } from '@/types/auth'
import { authService } from '@/services/auth-service'
import { 
  setTokens, 
  getAccessToken, 
  getRefreshToken, 
  clearTokens as clearAuthTokens,
  setCurrentTenant,
  migrateFromLocalStorage,
  getAuthHeaders
} from '@/lib/security/cookie-auth'

interface UnifiedAuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  isAdmin: boolean
  isDonor: boolean
  isSiteMode: boolean
  currentTenantSlug?: string
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tenant: Tenant | null; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_LOADING_COMPLETE' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }

const initialState: AuthState = {
  user: null,
  tenant: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tenant: action.payload.tenant,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        tenant: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      }
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      }
    case 'AUTH_LOADING_COMPLETE':
      return {
        ...state,
        isLoading: false,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

export const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined)

export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()
  const pathname = usePathname()
  
  // Détection du mode (hub vs site tenant)
  const isSiteMode = pathname?.startsWith('/sites/') || false
  const currentTenantSlug = isSiteMode ? pathname?.split('/')[2] : undefined

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Migrer depuis localStorage si nécessaire
      migrateFromLocalStorage()
      
      const authData = authService.getAuthData()
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()
      
      if (authData || (accessToken && refreshToken)) {
        try {
          // Utiliser le token depuis cookies ou authData
          const token = accessToken || authData?.token
          if (token) {
            const profile = await authService.getProfile(token)
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: profile.tenant ? profile : (profile.user || profile),
                tenant: profile.tenant || authData?.tenant || null,
                token: token,
              },
            })
          } else {
            dispatch({ type: 'AUTH_LOADING_COMPLETE' })
          }
        } catch (error) {
          // Token invalide, essayer de rafraîchir
          if (refreshToken || authData?.refreshToken) {
            try {
              const response = await authService.refreshToken(refreshToken || authData.refreshToken!)
              
              // Stocker les nouveaux tokens
              if (response.access_token && response.refresh_token) {
                setTokens({
                  accessToken: response.access_token,
                  refreshToken: response.refresh_token
                })
              }
              
              authService.setAuthData(response)
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                  user: response.user,
                  tenant: response.tenant,
                  token: response.access_token,
                },
              })
            } catch (refreshError) {
              // Refresh failed, clear auth data
              authService.clearAuthData()
              clearAuthTokens()
              dispatch({ type: 'AUTH_LOGOUT' })
            }
          } else {
            // Pas de refresh token, déconnecter
            authService.clearAuthData()
            clearAuthTokens()
            dispatch({ type: 'AUTH_LOGOUT' })
          }
        }
      } else {
        dispatch({ type: 'AUTH_LOADING_COMPLETE' })
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'AUTH_START' })
    try {
      // Ajouter le tenantId si on est en mode site
      if (isSiteMode && currentTenantSlug) {
        credentials.tenantSlug = currentTenantSlug
      }
      
      const response = await authService.login(credentials)
      
      // Stocker les tokens dans les cookies sécurisés
      if (response.access_token && response.refresh_token) {
        setTokens({
          accessToken: response.access_token,
          refreshToken: response.refresh_token
        })
      }
      
      // Stocker aussi via authService pour compatibilité
      authService.setAuthData(response)
      
      // Stocker le tenant si disponible
      if (response.tenant?.id) {
        setCurrentTenant(response.tenant.id)
      }
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tenant: response.tenant,
          token: response.access_token,
        },
      })
      
      // Redirection unifiée vers le dashboard du hub
      // Les admins et donateurs vont tous au même dashboard
      // Le dashboard affichera des options différentes selon le rôle
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl')
      const locale = pathname?.split('/')[1] || 'fr'
      
      // Toujours rediriger vers le dashboard du hub central
      const dashboardUrl = returnUrl || `/${locale}/dashboard`
      
      // Attendre un peu pour que les cookies soient bien définis avant de rediriger
      setTimeout(() => {
        router.push(dashboardUrl)
      }, 100)
      
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Erreur de connexion',
      })
      throw error
    }
  }

  const register = async (userData: RegisterRequest) => {
    dispatch({ type: 'AUTH_START' })
    try {
      // Ajouter le tenantId si on est en mode site
      if (isSiteMode && currentTenantSlug) {
        userData.tenantSlug = currentTenantSlug
      }
      
      const response = await authService.register(userData)
      
      // Auto-login après inscription
      if (response.access_token && response.refresh_token) {
        setTokens({
          accessToken: response.access_token,
          refreshToken: response.refresh_token
        })
        
        authService.setAuthData(response)
        
        if (response.tenant?.id) {
          setCurrentTenant(response.tenant.id)
        }
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.user,
            tenant: response.tenant,
            token: response.access_token,
          },
        })
        
        // Rediriger vers le dashboard
        const locale = pathname?.split('/')[1] || 'fr'
        setTimeout(() => {
          window.location.href = `/${locale}/dashboard`
        }, 100)
      } else {
        // Inscription réussie mais pas d'auto-login
        dispatch({ type: 'CLEAR_ERROR' })
      }
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Erreur d\'inscription',
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      if (state.token) {
        await authService.logout(state.token)
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      authService.clearAuthData()
      clearAuthTokens()
      dispatch({ type: 'AUTH_LOGOUT' })
      
      // Rediriger vers la page d'accueil
      const locale = pathname?.split('/')[1] || 'fr'
      window.location.href = `/${locale}`
    }
  }

  const refreshToken = async () => {
    const authData = authService.getAuthData()
    const refreshTokenValue = getRefreshToken() || authData?.refreshToken
    
    if (!refreshTokenValue) {
      dispatch({ type: 'AUTH_LOGOUT' })
      return
    }

    try {
      const response = await authService.refreshToken(refreshTokenValue)
      
      // Stocker les nouveaux tokens
      if (response.access_token && response.refresh_token) {
        setTokens({
          accessToken: response.access_token,
          refreshToken: response.refresh_token
        })
      }
      
      authService.setAuthData(response)
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tenant: response.tenant,
          token: response.access_token,
        },
      })
    } catch (error) {
      dispatch({ type: 'AUTH_LOGOUT' })
      authService.clearAuthData()
      clearAuthTokens()
    }
  }

  const updateProfile = async (data: any) => {
    if (!state.token) {
      throw new Error('Utilisateur non authentifié')
    }

    try {
      const updatedUser = await authService.updateProfile(data, state.token)
      dispatch({ type: 'UPDATE_USER', payload: updatedUser })
      
      // Mettre à jour les données stockées localement
      const authData = authService.getAuthData()
      if (authData) {
        authService.setAuthData({
          ...authData,
          user: updatedUser
        })
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      throw error
    }
  }

  // Auto-refresh token toutes les 45 minutes
  useEffect(() => {
    if (!state.user) return

    const interval = setInterval(() => {
      refreshToken()
    }, 45 * 60 * 1000)

    return () => clearInterval(interval)
  }, [state.user])

  // Déterminer les rôles
  const isAdmin = state.user?.role === 'ADMIN' || state.user?.role === 'SUPER_ADMIN'
  const isDonor = state.user?.role === 'MEMBER' || state.user?.role === 'DONOR'

  return (
    <UnifiedAuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshToken,
        updateProfile,
        isAdmin,
        isDonor,
        isSiteMode,
        currentTenantSlug,
      }}
    >
      {children}
    </UnifiedAuthContext.Provider>
  )
}

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext)
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider')
  }
  return context
}

// HOC pour protéger les routes
export function withUnifiedAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireAdmin?: boolean;
    redirectTo?: string;
  }
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isAdmin, isLoading } = useUnifiedAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
      if (!isLoading) {
        const locale = pathname?.split('/')[1] || 'fr'
        
        if (!isAuthenticated) {
          router.push(options?.redirectTo || `/${locale}/login?returnUrl=${encodeURIComponent(pathname || '/')}`)
        } else if (options?.requireAdmin && !isAdmin) {
          router.push(`/${locale}/dashboard`)
        }
      }
    }, [isAuthenticated, isAdmin, isLoading, router, pathname])

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      )
    }

    if (!isAuthenticated || (options?.requireAdmin && !isAdmin)) {
      return null
    }

    return <Component {...props} />
  }
}
'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { AuthState, User, Tenant, LoginRequest, RegisterRequest } from '@/types/auth'
import { authService } from '@/services/auth-service'

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
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
  isLoading: true, // Commencer par true pour éviter les redirections prématurées
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
        isLoading: false, // Important: ne pas rester en état de chargement
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuthStatus = async () => {
      const authData = authService.getAuthData()
      if (authData) {
        // Vérifier si le token est encore valide
        try {
          await authService.getProfile(authData.token)
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: authData.user,
              tenant: authData.tenant,
              token: authData.token,
            },
          })
        } catch (error) {
          // Token invalide, essayer de rafraîchir
          if (authData.refreshToken) {
            try {
              const response = await authService.refreshToken(authData.refreshToken)
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
              dispatch({ type: 'AUTH_LOGOUT' })
            }
          } else {
            // Pas de refresh token, déconnecter
            authService.clearAuthData()
            dispatch({ type: 'AUTH_LOGOUT' })
          }
        }
      } else {
        // Pas de données d'auth, s'assurer que isLoading est false
        dispatch({ type: 'AUTH_LOADING_COMPLETE' })
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.login(credentials)
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
      await authService.register(userData)
      // Inscription réussie - l'utilisateur devra se connecter manuellement
      dispatch({ type: 'CLEAR_ERROR' })
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
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }

  const refreshToken = async () => {
    const authData = authService.getAuthData()
    if (!authData?.refreshToken) {
      dispatch({ type: 'AUTH_LOGOUT' })
      return
    }

    try {
      const response = await authService.refreshToken(authData.refreshToken)
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

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshToken,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

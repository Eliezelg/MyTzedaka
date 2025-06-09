'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { AuthState, User, Tenant, LoginRequest, RegisterRequest } from '@/types/auth'
import { authService } from '@/services/auth-service'

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tenant: Tenant | null; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }

const initialState: AuthState = {
  user: null,
  tenant: null,
  token: null,
  isLoading: false,
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
      return initialState
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const authData = authService.getAuthData()
    if (authData) {
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: authData.user,
          tenant: authData.tenant,
          token: authData.token,
        },
      })
    }
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

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshToken,
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

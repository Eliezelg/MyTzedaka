import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ResetPasswordRequest, 
  ConfirmResetPasswordRequest,
  User 
} from '@/types/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

class AuthService {
  private baseUrl = `${API_URL}/api/auth`

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/login-hub`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur de connexion')
    }

    const result = await response.json()
    
    // Adapter le format pour correspondre à AuthContext
    return {
      user: result.user,
      access_token: result.tokens.accessToken, // Convertir tokens.accessToken en access_token
      refresh_token: result.tokens.refreshToken,
      tenant: null, // Pas de tenant pour les utilisateurs du hub
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/register-hub`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur d\'inscription')
    }

    return response.json()
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur de réinitialisation')
    }

    return response.json()
  }

  async confirmResetPassword(data: ConfirmResetPasswordRequest): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/confirm-reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur de confirmation')
    }

    return response.json()
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Erreur de rafraîchissement du token')
    }

    return response.json()
  }

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Erreur de récupération du profil')
    }

    return response.json()
  }

  async logout(token: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Erreur de déconnexion')
    }

    return response.json()
  }

  // Gestion du stockage local
  setAuthData(authResponse: AuthResponse) {
    localStorage.setItem('auth_token', authResponse.access_token)
    localStorage.setItem('refresh_token', authResponse.refresh_token)
    localStorage.setItem('user', JSON.stringify(authResponse.user))
    localStorage.setItem('tenant', JSON.stringify(authResponse.tenant))
    
    // Sauvegarder aussi dans les cookies pour le middleware Next.js
    document.cookie = `auth_token=${authResponse.access_token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 jours
    document.cookie = `refresh_token=${authResponse.refresh_token}; path=/; max-age=${7 * 24 * 60 * 60}`
  }

  getAuthData() {
    if (typeof window === 'undefined') return null
    
    const token = localStorage.getItem('auth_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const userStr = localStorage.getItem('user')
    const tenantStr = localStorage.getItem('tenant')

    // Vérifier si les valeurs critiques existent et ne sont pas "undefined"
    if (!token || !userStr || userStr === 'undefined') return null

    try {
      return {
        token,
        refreshToken,
        user: JSON.parse(userStr),
        tenant: tenantStr && tenantStr !== 'undefined' && tenantStr !== 'null' ? JSON.parse(tenantStr) : null,
      }
    } catch (error) {
      console.error('Erreur lors du parsing des données d\'authentification:', error)
      // Nettoyer le localStorage corrompu
      this.clearAuthData()
      return null
    }
  }

  clearAuthData() {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('tenant')
    
    // Supprimer aussi les cookies
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

export const authService = new AuthService()

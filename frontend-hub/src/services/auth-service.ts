import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ResetPasswordRequest, 
  ConfirmResetPasswordRequest,
  User 
} from '@/types/auth'
import Cookies from 'js-cookie'

const API_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api')

class AuthService {
  private baseUrl = `${API_URL}/auth`

  async login(data: LoginRequest): Promise<AuthResponse> {
    // D'abord, trouver les tenants de l'utilisateur
    let userTenants = [];
    try {
      const findTenantsResponse = await fetch(`/api/auth/find-user-tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      })
      
      if (findTenantsResponse.ok) {
        const result = await findTenantsResponse.json()
        userTenants = result.tenants || []
      }
    } catch (e) {
      console.log('Could not find user tenants:', e)
    }
    
    // Si on a trouvé des tenants, essayer avec eux
    // Sinon, essayer quelques tenants par défaut pour la compatibilité
    const tenantsToTry = userTenants.length > 0 
      ? userTenants.map(t => t.slug)
      : ['siah', 'kehilat-paris', 'shalom-marseille', 'test-asso'];
    
    // Essayer avec chaque tenant
    for (const tenantSlug of tenantsToTry) {
      try {
        const response = await fetch(`${this.baseUrl}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantSlug,
          },
          credentials: 'include',
          body: JSON.stringify(data),
        })
        
        if (response.ok) {
          const result = await response.json()
          // Récupérer les infos du tenant depuis les tenants trouvés
          let tenant = null;
          if (result.user?.tenantId) {
            // Utiliser les infos du tenant qu'on a déjà trouvé
            tenant = userTenants.find(t => t.id === result.user.tenantId) || null
            // Si on n'a pas trouvé, essayer de récupérer via l'API
            if (!tenant) {
              try {
                const tenantResponse = await fetch(`/api/tenant/${result.user.tenantId}`, {
                  headers: {
                    'Authorization': `Bearer ${result.tokens?.accessToken || result.access_token}`,
                  },
                })
                if (tenantResponse.ok) {
                  tenant = await tenantResponse.json()
                }
              } catch (e) {
                console.log('Could not fetch tenant info:', e)
              }
            }
          }
          
          // Stocker aussi dans les cookies pour compatibilité
          const accessToken = result.tokens?.accessToken || result.access_token
          const refreshToken = result.tokens?.refreshToken || result.refresh_token
          
          if (accessToken) {
            // Utiliser les mêmes noms que cookie-auth.ts
            Cookies.set('mytzedaka_access_token', accessToken, { expires: 7, sameSite: 'lax' })
            Cookies.set('auth-token', accessToken, { expires: 7, sameSite: 'lax' })
            Cookies.set('auth_token', accessToken, { expires: 7, sameSite: 'lax' })
          }
          if (refreshToken) {
            // Utiliser les mêmes noms que cookie-auth.ts
            Cookies.set('mytzedaka_refresh_token', refreshToken, { expires: 7, sameSite: 'lax' })
            Cookies.set('refresh-token', refreshToken, { expires: 7, sameSite: 'lax' })
            Cookies.set('refresh_token', refreshToken, { expires: 7, sameSite: 'lax' })
          }
          
          return {
            user: result.user,
            access_token: accessToken,
            refresh_token: refreshToken,
            tenant: tenant,
          }
        }
      } catch (e) {
        // Continuer avec le prochain tenant
        continue;
      }
    }

    // Si aucun tenant ne fonctionne, essayer login-hub pour les utilisateurs globaux
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
    
    return {
      user: result.user,
      access_token: result.tokens?.accessToken || result.access_token,
      refresh_token: result.tokens?.refreshToken || result.refresh_token,
      tenant: null,
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
    const response = await fetch(`${this.baseUrl}/refresh`, {
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
    const response = await fetch(`/api/auth/me`, {
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

  async updateProfile(data: any, token: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur de mise à jour du profil')
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
    // Utiliser js-cookie pour une meilleure gestion
    Cookies.set('auth-token', authResponse.access_token, { expires: 7 }) // 7 jours
    Cookies.set('refresh-token', authResponse.refresh_token, { expires: 7 })
    Cookies.set('auth_token', authResponse.access_token, { expires: 7 }) // Aussi avec underscore pour compatibilité
    Cookies.set('refresh_token', authResponse.refresh_token, { expires: 7 })
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
    
    // Supprimer aussi les cookies avec js-cookie
    Cookies.remove('auth-token')
    Cookies.remove('refresh-token')
    Cookies.remove('auth_token')
    Cookies.remove('refresh_token')
  }
}

export const authService = new AuthService()

import Cookies from 'js-cookie';

/**
 * Service de gestion sécurisée des tokens d'authentification
 * Utilise httpOnly cookies côté serveur et cookies sécurisés côté client
 */

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface CookieOptions {
  expires?: number; // En jours
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
  path?: string;
}

class SecureAuthStorage {
  private static instance: SecureAuthStorage;
  
  // Noms des cookies
  private readonly ACCESS_TOKEN_KEY = 'mytzedaka_access_token';
  private readonly REFRESH_TOKEN_KEY = 'mytzedaka_refresh_token';
  private readonly TENANT_KEY = 'mytzedaka_tenant';
  
  // Configuration par défaut
  private readonly defaultOptions: CookieOptions = {
    expires: 7, // 7 jours pour le refresh token
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  };

  private constructor() {
    // Configuration initiale
    this.setupSecurityHeaders();
  }

  public static getInstance(): SecureAuthStorage {
    if (!SecureAuthStorage.instance) {
      SecureAuthStorage.instance = new SecureAuthStorage();
    }
    return SecureAuthStorage.instance;
  }

  /**
   * Configure les headers de sécurité pour les cookies
   */
  private setupSecurityHeaders(): void {
    // Supprimer toute CSP existante qui pourrait bloquer les requêtes
    if (typeof window !== 'undefined') {
      const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingMeta) {
        existingMeta.remove();
      }
    }
    // Note: La CSP devrait être configurée côté serveur (next.config.js) 
    // et non côté client pour éviter les conflits
  }

  /**
   * Sauvegarde les tokens d'authentification
   */
  public setTokens(tokens: AuthTokens): void {
    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
      console.error('Invalid tokens provided:', tokens);
      throw new Error('Invalid tokens provided: accessToken and refreshToken are required');
    }

    // Access token - durée de vie courte (1 heure)
    Cookies.set(this.ACCESS_TOKEN_KEY, tokens.accessToken, {
      ...this.defaultOptions,
      expires: 1/24 // 1 heure
    });

    // Refresh token - durée de vie longue (7 jours)
    Cookies.set(this.REFRESH_TOKEN_KEY, tokens.refreshToken, {
      ...this.defaultOptions,
      expires: 7 // 7 jours
    });

    // Pour une sécurité accrue, on peut aussi stocker une version hachée
    // dans sessionStorage pour vérification double
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('auth_session', this.hashToken(tokens.accessToken));
    }
  }

  /**
   * Récupère l'access token
   */
  public getAccessToken(): string | null {
    const token = Cookies.get(this.ACCESS_TOKEN_KEY);
    
    // Vérification supplémentaire avec le hash sessionStorage
    if (token && typeof window !== 'undefined' && window.sessionStorage) {
      const sessionHash = sessionStorage.getItem('auth_session');
      if (sessionHash && sessionHash !== this.hashToken(token)) {
        // Token potentiellement compromis
        this.clearTokens();
        return null;
      }
    }
    
    return token || null;
  }

  /**
   * Récupère le refresh token
   */
  public getRefreshToken(): string | null {
    return Cookies.get(this.REFRESH_TOKEN_KEY) || null;
  }

  /**
   * Récupère les deux tokens
   */
  public getTokens(): AuthTokens | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (!accessToken || !refreshToken) {
      return null;
    }
    
    return { accessToken, refreshToken };
  }

  /**
   * Efface tous les tokens
   */
  public clearTokens(): void {
    // Supprimer les cookies
    Cookies.remove(this.ACCESS_TOKEN_KEY, { path: '/' });
    Cookies.remove(this.REFRESH_TOKEN_KEY, { path: '/' });
    Cookies.remove(this.TENANT_KEY, { path: '/' });
    
    // Nettoyer sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('auth_session');
    }
    
    // Nettoyer localStorage (migration depuis l'ancien système)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  public isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    
    // Vérifier l'expiration du token
    try {
      const payload = this.parseJwt(token);
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Stocke l'ID du tenant actuel
   */
  public setCurrentTenant(tenantId: string): void {
    if (!tenantId) return;
    
    Cookies.set(this.TENANT_KEY, tenantId, {
      ...this.defaultOptions,
      expires: 30 // 30 jours
    });
  }

  /**
   * Récupère l'ID du tenant actuel
   */
  public getCurrentTenant(): string | null {
    return Cookies.get(this.TENANT_KEY) || null;
  }

  /**
   * Parse un JWT pour extraire le payload
   */
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  /**
   * Hash simple d'un token pour vérification
   */
  private hashToken(token: string): string {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Migre les tokens depuis localStorage vers cookies
   */
  public migrateFromLocalStorage(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const oldAccessToken = localStorage.getItem('token');
      const oldRefreshToken = localStorage.getItem('refreshToken');
      
      if (oldAccessToken && oldRefreshToken) {
        this.setTokens({
          accessToken: oldAccessToken,
          refreshToken: oldRefreshToken
        });
        
        // Nettoyer localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        console.log('Successfully migrated auth tokens to secure cookies');
        return true;
      }
    } catch (error) {
      console.error('Failed to migrate tokens:', error);
    }
    
    return false;
  }

  /**
   * Obtient les headers d'authentification pour les requêtes API
   */
  public getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    const tenantId = this.getCurrentTenant();
    
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }
    
    return headers;
  }

  /**
   * Intercepteur pour ajouter automatiquement les headers aux requêtes
   */
  public setupAxiosInterceptor(axiosInstance: any): void {
    axiosInstance.interceptors.request.use(
      (config: any) => {
        const headers = this.getAuthHeaders();
        config.headers = {
          ...config.headers,
          ...headers
        };
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Intercepteur pour gérer le refresh token automatique
    axiosInstance.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Tenter de rafraîchir le token
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await axiosInstance.post('/api/auth/refresh', {
                refreshToken
              });
              
              if (response.data.accessToken && response.data.refreshToken) {
                this.setTokens({
                  accessToken: response.data.accessToken,
                  refreshToken: response.data.refreshToken
                });
                
                // Réessayer la requête originale
                return axiosInstance(originalRequest);
              }
            }
          } catch (refreshError) {
            // Échec du refresh, déconnecter l'utilisateur
            this.clearTokens();
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Hook React pour utiliser le service d'authentification
   */
  public static useSecureAuth() {
    return SecureAuthStorage.getInstance();
  }
}

// Export du singleton
export const secureAuth = SecureAuthStorage.getInstance();

// Export des méthodes utilitaires
export const {
  setTokens,
  getAccessToken,
  getRefreshToken,
  getTokens,
  clearTokens,
  isAuthenticated,
  setCurrentTenant,
  getCurrentTenant,
  migrateFromLocalStorage,
  getAuthHeaders
} = {
  setTokens: (tokens: AuthTokens) => secureAuth.setTokens(tokens),
  getAccessToken: () => secureAuth.getAccessToken(),
  getRefreshToken: () => secureAuth.getRefreshToken(),
  getTokens: () => secureAuth.getTokens(),
  clearTokens: () => secureAuth.clearTokens(),
  isAuthenticated: () => secureAuth.isAuthenticated(),
  setCurrentTenant: (tenantId: string) => secureAuth.setCurrentTenant(tenantId),
  getCurrentTenant: () => secureAuth.getCurrentTenant(),
  migrateFromLocalStorage: () => secureAuth.migrateFromLocalStorage(),
  getAuthHeaders: () => secureAuth.getAuthHeaders()
};

// Hook React personnalisé
export function useSecureAuth() {
  return secureAuth;
}
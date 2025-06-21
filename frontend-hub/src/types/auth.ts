export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  postalCode?: string
  country?: string
  preferences?: {
    emailNotifications: boolean
    donationReceipts: boolean
    newsletterUpdates: boolean
    campaignUpdates: boolean
  }
  role: UserRole
  permissions: Record<string, any>
  lastLoginAt?: string
  createdAt?: string
  isActive?: boolean
}

export interface Tenant {
  id: string
  slug: string
  name: string
}

export interface AuthResponse {
  access_token: string
  cognito_token?: string
  refresh_token: string
  expires_in?: number
  user: User
  tenant: Tenant | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthState {
  user: User | null
  tenant: Tenant | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export type UserRole = 'DONATOR' | 'ASSOCIATION_ADMIN' | 'PLATFORM_ADMIN'

export interface ResetPasswordRequest {
  email: string
}

export interface ConfirmResetPasswordRequest {
  email: string
  code: string
  newPassword: string
}

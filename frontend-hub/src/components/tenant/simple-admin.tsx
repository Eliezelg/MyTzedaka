'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TenantAdminDashboard } from '@/components/tenant/admin-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

export function SimpleAdmin({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter()
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    user: null as any
  })

  useEffect(() => {
    // Vérifier l'authentification côté client
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            isAdmin: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
            user
          })
        } catch (e) {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
            user: null
          })
        }
      } else {
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
          user: null
        })
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Rediriger si non authentifié
    if (!authState.isLoading && !authState.isAuthenticated) {
      const currentPath = `/t/${tenantSlug}/admin`
      router.push(`/fr/auth/login?returnUrl=${encodeURIComponent(currentPath)}`)
    }
  }, [authState.isLoading, authState.isAuthenticated, router, tenantSlug])

  if (authState.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    return null
  }

  if (!authState.isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Accès Refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions pour accéder à cette page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">
                Connecté en tant que : <strong>{authState.user?.email}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Rôle : <strong>{authState.user?.role}</strong>
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push(`/t/${tenantSlug}`)}
            >
              Retour au site
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <TenantAdminDashboard />
}
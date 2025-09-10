'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/providers/tenant-provider'
import { useAuthContext } from '@/hooks/useAuthContext'
import { TenantAdminDashboard } from '@/components/tenant/admin-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, LogIn } from 'lucide-react'

export function AdminWrapper() {
  const { tenant } = useTenant()
  const router = useRouter()
  const authContext = useAuthContext()
  
  const { user, isAuthenticated, isLoading, isAdmin } = authContext || {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false
  }

  useEffect(() => {
    // Si non authentifié et pas en chargement, rediriger vers login
    if (!isLoading && !isAuthenticated && tenant?.slug) {
      const currentPath = `/t/${tenant.slug}/admin`
      router.push(`/fr/auth/login?returnUrl=${encodeURIComponent(currentPath)}`)
    }
  }, [isLoading, isAuthenticated, router, tenant?.slug])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // La redirection vers login est gérée par le useEffect
  if (!isAuthenticated) {
    return null
  }

  // Si authentifié mais pas admin
  if (!isAdmin) {
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
                Connecté en tant que : <strong>{user?.email}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Rôle : <strong>{user?.role}</strong>
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/t/${tenant.slug}`)}
              className="w-full"
            >
              Retour au site
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si admin, afficher le dashboard
  return <TenantAdminDashboard />
}
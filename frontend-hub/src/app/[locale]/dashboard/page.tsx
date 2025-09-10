'use client'

import Link from 'next/link'
import { useAuthContext } from '@/hooks/useAuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, Settings, Shield } from 'lucide-react'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'
import { Card } from '@/components/ui/card'

export default function DashboardPage() {
  const { user, tenant, logout, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Connexion requise</h1>
          <p className="text-gray-600">Vous devez être connecté pour accéder au dashboard</p>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button>Se connecter</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Retour à l'accueil</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  // Déterminer si l'utilisateur est admin
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'PLATFORM_ADMIN' || user.role === 'ASSOCIATION_ADMIN'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header du Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenue sur votre tableau de bord MyTzedaka
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <Badge variant="outline">
            {user.role === 'PLATFORM_ADMIN' || user.role === 'SUPER_ADMIN' ? 'Administrateur' : 
             user.role === 'ASSOCIATION_ADMIN' || user.role === 'ADMIN' ? 'Responsable' : 'Donateur'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </div>

      {/* Section Admin - Affichée uniquement pour les admins */}
      {isAdmin && tenant && (
        <Card className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Administration de l'association</h2>
                <p className="text-sm text-gray-600">
                  {tenant.name ? `Gérez votre association ${tenant.name}` : 'Gérez votre association'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/associations/${tenant.slug || tenant.id}/dashboard`}
              >
                <Button className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Dashboard Hub</span>
                </Button>
              </Link>
              <Link 
                href={`/t/${tenant.slug || tenant.id}/dashboard`}
              >
                <Button variant="outline" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Dashboard Site</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Composant Tabs principal */}
      <DashboardTabs />
    </div>
  )
}
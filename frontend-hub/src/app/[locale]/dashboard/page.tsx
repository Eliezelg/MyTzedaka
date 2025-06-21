'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut } from 'lucide-react'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth()

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
            <Link href="/login">
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
            {user.role === 'PLATFORM_ADMIN' ? 'Administrateur' : user.role === 'ASSOCIATION_ADMIN' ? 'Responsable' : 'Donateur'}
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

      {/* Composant Tabs principal */}
      <DashboardTabs />
    </div>
  )
}
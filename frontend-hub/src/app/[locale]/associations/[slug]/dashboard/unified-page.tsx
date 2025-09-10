'use client'

import { CompleteAssociationDashboard } from '@/components/shared/complete-association-dashboard'
import { useAssociationBySlug } from '@/lib/services/associations-service'
import { useAuthContext } from '@/hooks/useAuthContext'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UnifiedHubDashboard({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { data: association, isLoading, error } = useAssociationBySlug(slug)
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuthContext()

  // Vérification de l'authentification
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  // Si pas connecté, rediriger vers la connexion
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900">Accès restreint</h1>
          <p className="text-gray-600">Vous devez être connecté en tant qu'administrateur de cette association</p>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button>Se connecter</Button>
            </Link>
            <Link href={`/associations/${slug}`}>
              <Button variant="outline">
                Voir la page publique
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !association) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Association non trouvée</h1>
          <p className="text-gray-600 mb-4">Impossible de charger les données de l'association.</p>
          <Link href="/dashboard">
            <Button>
              Retour au dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <CompleteAssociationDashboard 
      slug={slug} 
      isHub={true}
      association={association}
      user={user}
    />
  )
}
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProgressiveCreationForm from '@/components/associations/progressive-creation-form'

export default function CreateAssociationPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Rediriger vers la page de login avec un paramètre de retour
      router.push('/fr/login?returnUrl=/fr/associations/create')
    }
  }, [isAuthenticated, isLoading, router])

  // Afficher un état de chargement pendant la vérification d'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Si non authentifié, ne pas afficher le contenu (redirection en cours)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ProgressiveCreationForm />
    </div>
  )
}

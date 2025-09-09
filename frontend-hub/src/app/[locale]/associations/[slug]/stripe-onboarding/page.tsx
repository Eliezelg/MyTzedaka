'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAssociationBySlug } from '@/lib/services/associations-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  RefreshCw,
  Shield,
  ArrowRight
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useTranslations } from 'next-intl'
import { useAuthContext } from '@/hooks/useAuthContext'

export default function StripeOnboardingPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  const locale = params?.locale as string || 'fr'
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext()
  
  const { data: association, isLoading: associationLoading, error: associationError } = useAssociationBySlug(slug)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [accountStatus, setAccountStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  console.log('🔍 StripeOnboardingPage - État:', {
    slug,
    authLoading,
    isAuthenticated,
    user: user ? { id: user.id, email: user.email } : null,
    associationLoading,
    association: association ? { id: association.id, tenantId: association.tenantId } : null,
    associationError
  })

  // Rediriger si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('🚫 Utilisateur non authentifié, redirection vers login')
      router.push(`/${locale}/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }
  }, [authLoading, isAuthenticated, router, locale])

  // Vérifier le statut du compte au chargement
  useEffect(() => {
    if (association?.tenantId && isAuthenticated) {
      console.log('🔄 Vérification du statut du compte Stripe Connect')
      checkAccountStatus()
    }
  }, [association?.tenantId, isAuthenticated])

  const checkAccountStatus = async () => {
    if (!association?.tenantId) {
      console.log('❌ Pas de tenantId disponible')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('📞 Appel API /stripe/connect/status avec tenantId:', association.tenantId)
      
      const response = await apiClient.get('/stripe/connect/status', {
        tenantId: association.tenantId
      })
      
      console.log('✅ Réponse reçue:', response)
      setAccountStatus(response.data || response)
      
      // Debug: affichage détaillé du statut
      const status = response.data || response
      console.log('🔍 Status détaillé:', {
        accountStatus: status,
        hasAccount: status?.hasAccount,
        showCreateButton: !status?.hasAccount
      })
    } catch (err: any) {
      console.error('❌ Erreur lors de la vérification du statut:', err)
      setError(`Impossible de vérifier le statut de votre compte Stripe: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const generateOnboardingLink = async () => {
    try {
      setGenerating(true)
      setError(null)
      
      console.log('📞 Génération du lien d\'onboarding pour tenantId:', association?.tenantId)
      
      const response = await apiClient.get('/stripe/connect/onboarding', {
        returnUrl: window.location.href,
        tenantId: association?.tenantId,
        locale: locale
      })
      
      console.log('✅ Lien généré:', response)
      
      // Rediriger vers Stripe
      const url = (response as any).data?.url || (response as any).url
      if (url) {
        window.location.href = url
      } else {
        throw new Error('URL d\'onboarding non reçue du serveur')
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la génération du lien:', err)
      setError(`Impossible de générer le lien d'onboarding: ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const createStripeAccount = async () => {
    try {
      setCreating(true)
      setError(null)
      
      console.log('📞 Création du compte Stripe Connect pour tenantId:', association?.tenantId)
      
      const response = await apiClient.post(`/stripe/connect/create-account?tenantId=${association?.tenantId}`)
      
      console.log('✅ Compte créé:', response)
      
      // Recharger le statut du compte
      await checkAccountStatus()
      
    } catch (err: any) {
      console.error('❌ Erreur lors de la création du compte:', err)
      setError(`Impossible de créer le compte Stripe Connect: ${err.message}`)
    } finally {
      setCreating(false)
    }
  }

  // Affichage loading pendant auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Redirection en cours si non authentifié
  if (!isAuthenticated) {
    return null
  }

  // Affichage loading pendant chargement association
  if (associationLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-gray-600">Chargement de l'association...</p>
        </div>
      </div>
    )
  }

  // Erreur association
  if (associationError || !association) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <p className="font-semibold">Association non trouvée</p>
            <p className="text-sm mt-1">
              L'association "{slug}" n'existe pas ou vous n'avez pas les permissions pour y accéder.
            </p>
          </div>
        </Alert>
      </div>
    )
  }

  // Affichage loading pendant vérification statut
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-gray-600">Vérification du statut Stripe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Configuration Stripe Connect</CardTitle>
            </div>
            {accountStatus?.status && (
              <Badge 
                variant={
                  accountStatus.status === 'COMPLETE' ? 'default' :
                  accountStatus.status === 'RESTRICTED' ? 'secondary' :
                  'outline'
                }
                className="text-sm px-3 py-1"
              >
                {accountStatus.status === 'COMPLETE' && <CheckCircle className="h-4 w-4 mr-1" />}
                {accountStatus.status === 'PENDING' && <AlertCircle className="h-4 w-4 mr-1" />}
                {accountStatus.status}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </Alert>
          )}

          {/* Debug: Log avant affichage conditionnel */}
          {console.log('🔍 Rendu - accountStatus:', accountStatus, 'hasAccount:', accountStatus?.hasAccount, 'Condition bouton:', !accountStatus?.hasAccount)}
          {console.log('🔍 État PENDING - hasAccount:', accountStatus?.hasAccount, 'requiresOnboarding:', accountStatus?.requiresOnboarding, 'status:', accountStatus?.status)}

          {/* État : Pas de compte */}
          {!accountStatus?.hasAccount && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <div>
                  <p className="font-semibold">Aucun compte Stripe Connect configuré</p>
                  <p className="text-sm mt-1">
                    Votre association n'a pas encore de compte Stripe Connect pour recevoir des dons.
                  </p>
                </div>
              </Alert>
              
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-blue-900">Création automatique du compte</h4>
                <p className="text-sm text-blue-800">
                  Un compte Stripe Connect devrait normalement être créé automatiquement lors de la création de votre association. 
                  Si ce n'est pas le cas, vous pouvez le créer manuellement en cliquant sur le bouton ci-dessous.
                </p>
                
                <Button
                  onClick={createStripeAccount}
                  disabled={creating}
                  className="w-full"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Créer le compte Stripe Connect
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-blue-600">
                  Cette action créera automatiquement un compte Stripe Connect lié à votre association.
                  Vous pourrez ensuite procéder à sa configuration.
                </p>
              </div>
            </div>
          )}

          {/* État : Compte en attente */}
          {accountStatus?.hasAccount && accountStatus?.requiresOnboarding && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Configuration requise
                </h3>
                <p className="text-gray-700 mb-4">
                  Pour commencer à recevoir des dons, vous devez compléter la configuration de votre compte Stripe Connect.
                  Cette étape est nécessaire pour :
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Vérifier votre identité et celle de votre association</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Configurer vos informations bancaires pour recevoir les paiements</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Accepter les conditions d'utilisation de Stripe</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={generateOnboardingLink}
                  disabled={generating}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Génération du lien...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Configurer mon compte Stripe
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-gray-500 text-center">
                  Vous serez redirigé vers Stripe pour compléter la configuration.
                  Une fois terminé, vous reviendrez automatiquement ici.
                </p>
              </div>
            </>
          )}

          {/* État : Compte actif */}
          {accountStatus?.hasAccount && accountStatus?.status === 'COMPLETE' && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-semibold">Compte Stripe Connect actif !</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Votre compte est entièrement configuré et prêt à recevoir des dons.
                  </p>
                </div>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Prochaines étapes</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Créez vos premières campagnes</li>
                    <li>• Partagez votre page de dons</li>
                    <li>• Suivez vos donations dans le tableau de bord</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Besoin d'aide ?</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Accédez à votre dashboard Stripe pour gérer vos paiements
                  </p>
                  <a 
                    href="https://dashboard.stripe.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    Dashboard Stripe
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/${locale}/associations/dashboard`)}
                >
                  Retour au tableau de bord
                </Button>
              </div>
            </div>
          )}

          {/* État : Compte restreint */}
          {accountStatus?.hasAccount && accountStatus?.status === 'RESTRICTED' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <p className="font-semibold">Action requise sur votre compte Stripe</p>
                  <p className="text-sm mt-1">
                    Stripe a besoin d'informations supplémentaires pour activer complètement votre compte.
                  </p>
                </div>
              </Alert>

              <Button
                onClick={generateOnboardingLink}
                disabled={generating}
                variant="outline"
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération du lien...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Mettre à jour mes informations
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
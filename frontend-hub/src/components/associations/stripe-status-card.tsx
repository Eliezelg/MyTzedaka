'use client'

import { useState, useEffect } from 'react'
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
  Settings,
  Shield
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useRouter, useParams } from 'next/navigation'
import { useAssociationBySlug } from '@/lib/services/associations-service'
import { useAuthContext } from '@/hooks/useAuthContext'

export default function StripeStatusCard() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  const locale = params?.locale as string || 'fr'
  const { data: association } = useAssociationBySlug(slug)
  const { isAuthenticated, user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [accountStatus, setAccountStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Helper pour construire les URLs
  const getStripeOnboardingUrl = () => `/${locale}/associations/${slug}/stripe-onboarding`

  useEffect(() => {
    if (association?.tenantId && isAuthenticated) {
      checkAccountStatus()
    }
  }, [association?.tenantId, isAuthenticated])

  const checkAccountStatus = async () => {
    if (!association?.tenantId || !isAuthenticated) return
    
    // Debug: Décoder le token JWT pour voir son contenu
    const token = localStorage.getItem('auth_token')
    let decodedToken = null
    if (token) {
      try {
        const payload = token.split('.')[1]
        decodedToken = JSON.parse(atob(payload))
      } catch (e) {
        console.error('Erreur décodage token:', e)
      }
    }
    
    console.log('🔍 [StripeStatusCard] Vérification statut:', {
      tenantId: association.tenantId,
      isAuthenticated,
      user: user ? 'Présent' : 'Absent',
      decodedToken: decodedToken
    })
    
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get('/stripe/connect/status', {
        tenantId: association.tenantId
      })
      setAccountStatus(response.data)
    } catch (err) {
      console.error('Erreur lors de la vérification du statut Stripe:', err)
      setError('Impossible de vérifier le statut de votre compte Stripe')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = () => {
    if (!accountStatus) return { variant: 'outline', text: 'Inconnu', icon: AlertCircle }
    
    switch (accountStatus.status) {
      case 'COMPLETE':
        return { variant: 'default', text: 'Actif', icon: CheckCircle }
      case 'RESTRICTED':
        return { variant: 'secondary', text: 'Restreint', icon: AlertCircle }
      case 'PENDING':
        return { variant: 'outline', text: 'En attente', icon: AlertCircle }
      case 'NOT_CREATED':
        return { variant: 'outline', text: 'Non configuré', icon: AlertCircle }
      default:
        return { variant: 'outline', text: 'Inconnu', icon: AlertCircle }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  // Si pas authentifié, afficher un état spécial
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Configuration Stripe</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Authentification requise
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Configuration Stripe</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Configuration Stripe</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3 w-3" />
            <p className="text-xs">{error}</p>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Statut :</span>
          <Badge variant={statusConfig.variant as any} className="text-xs">
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.text}
          </Badge>
        </div>

        {/* Mode PLATFORM - Stripe Connect */}
        {accountStatus?.hasAccount && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Mode :</span>
              <div className="flex items-center">
                <Shield className="h-3 w-3 mr-1 text-blue-600" />
                <span className="font-medium">Stripe Connect</span>
              </div>
            </div>

            {/* Actions selon le statut */}
            {accountStatus.requiresOnboarding ? (
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => router.push(getStripeOnboardingUrl())}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Configurer Stripe
              </Button>
            ) : accountStatus.status === 'COMPLETE' ? (
              <div className="space-y-2">
                <div className="text-xs text-green-600 font-medium">
                  ✓ Prêt à recevoir des dons
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => router.push(getStripeOnboardingUrl())}
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Gérer Stripe
                </Button>
              </div>
            ) : accountStatus.status === 'RESTRICTED' ? (
              <div className="space-y-2">
                <div className="text-xs text-orange-600 font-medium">
                  ⚠️ Action requise
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => router.push(getStripeOnboardingUrl())}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Mettre à jour
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={checkAccountStatus}
              >
                <Loader2 className="h-3 w-3 mr-2" />
                Actualiser
              </Button>
            )}
          </div>
        )}

        {/* Pas de compte configuré */}
        {!accountStatus?.hasAccount && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Aucun compte de paiement configuré
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => router.push(getStripeOnboardingUrl())}
            >
              <Settings className="h-3 w-3 mr-2" />
              Configurer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
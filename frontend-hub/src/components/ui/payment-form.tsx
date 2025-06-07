'use client'

import { useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Lock, CreditCard } from 'lucide-react'

interface PaymentFormProps {
  amount: number
  clientSecret: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  onBack: () => void
  campaignTitle: string
}

export function PaymentForm({ 
  amount, 
  clientSecret,
  onSuccess, 
  onError, 
  onBack,
  campaignTitle 
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setCardError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setCardError('Erreur de chargement du formulaire de paiement')
      setIsProcessing(false)
      return
    }

    try {
      // Confirmer le paiement avec Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Donateur MyTzedaka',
          },
        }
      })

      if (error) {
        // Gestion des erreurs spécifiques Stripe
        const errorMessage = getStripeErrorMessage(error.code || error.type)
        setCardError(errorMessage)
        onError(errorMessage)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      }
    } catch (err) {
      const errorMessage = 'Une erreur inattendue est survenue. Veuillez réessayer.'
      setCardError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStripeErrorMessage = (errorCode?: string): string => {
    const errorMessages: Record<string, string> = {
      'card_declined': 'Votre carte a été refusée. Veuillez essayer avec une autre carte.',
      'insufficient_funds': 'Fonds insuffisants. Veuillez vérifier votre solde.',
      'expired_card': 'Votre carte a expiré. Veuillez utiliser une carte valide.',
      'incorrect_cvc': 'Le code de sécurité est incorrect.',
      'processing_error': 'Erreur de traitement. Veuillez réessayer.',
      'incorrect_number': 'Le numéro de carte est incorrect.',
      'invalid_expiry_month': 'Le mois d\'expiration est invalide.',
      'invalid_expiry_year': 'L\'année d\'expiration est invalide.',
      'invalid_cvc': 'Le code de sécurité est invalide.',
    }

    return errorMessages[errorCode || ''] || 'Erreur de paiement. Veuillez réessayer.'
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'Inter, system-ui, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#666EE8',
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  }

  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour
        </Button>
        <div className="flex items-center text-sm text-gray-600">
          <Lock className="w-4 h-4 mr-1" />
          Paiement sécurisé
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Don pour :</span>
          <span className="text-sm font-medium">{campaignTitle}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Total :</span>
          <span className="text-xl font-bold text-blue-600">
            {amount.toFixed(2)}€
          </span>
        </div>
      </div>

      {/* Formulaire de paiement */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Informations de carte
          </label>
          
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <CardElement
              options={cardElementOptions}
              onChange={(event) => {
                if (event.error) {
                  setCardError(event.error.message || 'Erreur de saisie')
                } else {
                  setCardError(null)
                }
              }}
            />
          </div>
          
          {cardError && (
            <p className="text-sm text-red-600">{cardError}</p>
          )}
        </div>

        {/* Informations de sécurité */}
        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
          <div className="flex items-start">
            <Lock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Votre paiement est 100% sécurisé</p>
              <p>Nous utilisons le cryptage SSL et ne stockons jamais vos informations de carte.</p>
            </div>
          </div>
        </div>

        {/* Bouton de paiement */}
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full h-12 text-base font-medium"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Traitement en cours...
            </div>
          ) : (
            `Donner ${amount.toFixed(2)}€`
          )}
        </Button>
      </form>

      {/* Footer légal */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>En procédant au paiement, vous acceptez nos conditions d'utilisation.</p>
        <p>Un reçu fiscal vous sera envoyé par email automatiquement.</p>
      </div>
    </div>
  )
}

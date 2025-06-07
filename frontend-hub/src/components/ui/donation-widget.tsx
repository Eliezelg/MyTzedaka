'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { AmountSelection } from './amount-selection'
import { PaymentForm } from './payment-form'
import { Confirmation } from './confirmation'
import { useDonations } from '@/hooks/useDonations'
import { AlertCircle } from 'lucide-react'
import { Button } from './button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type WidgetStep = 'amount' | 'payment' | 'processing' | 'success' | 'error'

interface DonationWidgetProps {
  campaignId: string
  campaignTitle: string
}

export function DonationWidget({ campaignId, campaignTitle }: DonationWidgetProps) {
  const [step, setStep] = useState<WidgetStep>('amount')
  const [amount, setAmount] = useState<number>(0)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [paymentIntentId, setPaymentIntentId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const { createDonation, isCreatingDonation } = useDonations()

  const handleAmountSelect = async (selectedAmount: number) => {
    setAmount(selectedAmount)
    setError(null)
    setStep('processing')

    try {
      // Créer PaymentIntent via notre backend
      const response = await createDonation.mutateAsync({
        campaignId,
        amount: selectedAmount,
        isAnonymous
      })

      if (response.clientSecret) {
        setClientSecret(response.clientSecret)
        setStep('payment')
      } else {
        throw new Error('Aucun client secret reçu')
      }
    } catch (err) {
      console.error('Erreur création donation:', err)
      setError('Impossible de préparer le paiement. Veuillez réessayer.')
      setStep('error')
    }
  }

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentIntentId(paymentId)
    setStep('success')
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    setStep('error')
  }

  const handleRetryPayment = () => {
    setError(null)
    setStep('amount')
    setClientSecret('')
    setPaymentIntentId('')
  }

  const handleNewDonation = () => {
    setStep('amount')
    setAmount(0)
    setIsAnonymous(false)
    setClientSecret('')
    setPaymentIntentId('')
    setError(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header du widget */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">
          Soutenir cette campagne
        </h3>
        <p className="text-blue-100 text-sm">
          {campaignTitle}
        </p>
      </div>

      {/* Contenu principal */}
      <div className="p-6">
        {step === 'amount' && (
          <AmountSelection
            onAmountSelect={handleAmountSelect}
            onAnonymousChange={setIsAnonymous}
            isAnonymous={isAnonymous}
            isLoading={isCreatingDonation}
          />
        )}

        {step === 'processing' && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Préparation du paiement...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Veuillez patienter quelques instants
            </p>
          </div>
        )}

        {step === 'payment' && clientSecret && (
          <Elements 
            stripe={stripePromise} 
            options={{ 
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#2563eb',
                  colorBackground: '#ffffff',
                  colorText: '#1f2937',
                  colorDanger: '#dc2626',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  borderRadius: '8px',
                }
              }
            }}
          >
            <PaymentForm
              amount={amount}
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onBack={() => setStep('amount')}
              campaignTitle={campaignTitle}
            />
          </Elements>
        )}

        {step === 'success' && (
          <Confirmation
            amount={amount}
            campaignTitle={campaignTitle}
            paymentIntentId={paymentIntentId}
            onNewDonation={handleNewDonation}
          />
        )}

        {step === 'error' && (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-gray-900">
                Une erreur est survenue
              </h4>
              <p className="text-red-600 text-sm max-w-md mx-auto">
                {error || 'Erreur inconnue lors du traitement du paiement'}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRetryPayment}
                className="w-full"
              >
                Réessayer
              </Button>
              
              <p className="text-xs text-gray-500">
                Si le problème persiste, contactez notre support.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer avec badges de confiance */}
      {step !== 'success' && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              🔒 SSL sécurisé
            </span>
            <span className="flex items-center">
              💳 Stripe
            </span>
            <span className="flex items-center">
              📧 Reçu fiscal
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

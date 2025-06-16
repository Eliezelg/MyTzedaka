'use client'

import { Elements } from '@stripe/react-stripe-js'
import { ReactNode, useEffect, useState } from 'react'
import { getStripe } from './stripe/stripe-client'
import { Stripe } from '@stripe/stripe-js'

interface StripeProviderProps {
  children: ReactNode
  tenantId?: string
  clientSecret?: string
}

export function StripeProvider({ children, tenantId, clientSecret }: StripeProviderProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const stripeInstance = await getStripe(tenantId)
        setStripe(stripeInstance)
      } catch (err) {
        console.error('Erreur initialisation Stripe:', err)
        setError(err instanceof Error ? err.message : 'Erreur Stripe')
      } finally {
        setLoading(false)
      }
    }

    initializeStripe()
  }, [tenantId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Initialisation du paiement...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Erreur de configuration Stripe</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <Elements stripe={stripe} options={{ clientSecret }}>
      {children}
    </Elements>
  )
}

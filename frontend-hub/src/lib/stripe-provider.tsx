'use client'

import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { ReactNode } from 'react'

// Chargement de Stripe avec la clé publique
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeProviderProps {
  children: ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}

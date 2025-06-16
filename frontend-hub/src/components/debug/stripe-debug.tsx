'use client'

import { useEffect, useState } from 'react'
import { getStripe } from '@/lib/stripe/stripe-client'

interface StripeDebugProps {
  tenantId?: string
}

export function StripeDebug({ tenantId }: StripeDebugProps) {
  const [status, setStatus] = useState<string>('Non testé')
  const [details, setDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testStripeInit = async () => {
    try {
      setStatus('Test en cours...')
      setError(null)
      
      console.log('🔍 Test Stripe avec tenantId:', tenantId)
      
      const stripe = await getStripe(tenantId)
      
      if (stripe) {
        setStatus('✅ Stripe initialisé avec succès')
        setDetails({
          stripeInitialized: true,
          tenantId: tenantId || 'par défaut'
        })
      } else {
        setStatus('❌ Stripe non initialisé')
      }
    } catch (err) {
      console.error('❌ Erreur Stripe:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setStatus('❌ Erreur d\'initialisation')
    }
  }

  useEffect(() => {
    if (tenantId) {
      testStripeInit()
    }
  }, [tenantId])

  return (
    <div className="bg-gray-50 border rounded-lg p-4 my-4">
      <h3 className="font-bold mb-2">🔧 Debug Stripe</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Tenant ID:</strong> {tenantId || 'Non fourni'}
        </div>
        
        <div>
          <strong>Statut:</strong> {status}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-300 rounded p-2">
            <strong>Erreur:</strong> {error}
          </div>
        )}
        
        {details && (
          <div className="bg-green-100 border border-green-300 rounded p-2">
            <strong>Détails:</strong>
            <pre className="text-xs mt-1">{JSON.stringify(details, null, 2)}</pre>
          </div>
        )}
        
        <button 
          onClick={testStripeInit}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          🔄 Retester
        </button>
      </div>
    </div>
  )
}

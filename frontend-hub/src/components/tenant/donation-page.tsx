'use client'

import React from 'react'
import { useTenant } from '@/providers/tenant-provider'
import { SimpleDonationWidget } from '@/components/tenant/simple-donation-widget'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Users, Target } from 'lucide-react'

export function TenantDonationPage() {
  const { tenant } = useTenant()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Faire un don à {tenant.name}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Votre générosité nous permet de poursuivre notre mission et d'aider ceux qui en ont besoin.
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardContent className="flex items-center p-6">
            <Shield className="h-12 w-12 text-green-600 mr-4" />
            <div>
              <h3 className="font-semibold">Paiement Sécurisé</h3>
              <p className="text-sm text-gray-600">Cryptage SSL 256-bit</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h3 className="font-semibold">Association Reconnue</h3>
              <p className="text-sm text-gray-600">Organisme certifié</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-12 w-12 text-purple-600 mr-4" />
            <div>
              <h3 className="font-semibold">Impact Direct</h3>
              <p className="text-sm text-gray-600">100% de votre don utilisé</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donation Widget */}
      <div className="max-w-4xl mx-auto">
        <SimpleDonationWidget
          targetId={tenant.id}
          targetName={tenant.name}
          suggestedAmounts={[18, 36, 100, 180, 360, 1000]}
          currency="EUR"
        />
      </div>

      {/* Additional Information */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Information importante</h3>
          <p className="text-sm text-gray-600">
            Les dons effectués à {tenant.name} sont déductibles des impôts selon la législation en vigueur. 
            Un reçu fiscal vous sera envoyé par email après validation de votre don.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
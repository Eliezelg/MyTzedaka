'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Shield, CreditCard, Info } from 'lucide-react'

interface StripeConfigStepProps {
  data: any
  onChange: (data: any) => void
  errors?: Record<string, string>
  isEditing?: boolean
}

export default function StripeConfigStep({ data, onChange, errors = {}, isEditing = true }: StripeConfigStepProps) {
  return (
    <div className="space-y-6">
      {/* Configuration Stripe */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Configuration des paiements
        </h3>
        
        <div className="space-y-4">
          <Label className="text-sm font-medium">Mode de traitement des paiements *</Label>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="stripeMode"
                value="PLATFORM"
                checked={data.stripeMode === 'PLATFORM'}
                onChange={() => onChange({ ...data, stripeMode: 'PLATFORM' })}
                className="mt-1"
                disabled={!isEditing}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Stripe Connect (Recommandé)</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Utilisez la plateforme MyTzedaka pour gérer vos paiements
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-green-600">✓ Configuration automatique</p>
                  <p className="text-xs text-green-600">✓ Pas de frais de configuration</p>
                  <p className="text-xs text-green-600">✓ Support intégré</p>
                  <p className="text-xs text-green-600">✓ Conformité PCI-DSS garantie</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-orange-600">→ Commission de 2.9% + 0.30€ par transaction</p>
                </div>
              </div>
            </label>
            
            <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="stripeMode"
                value="CUSTOM"
                checked={data.stripeMode === 'CUSTOM'}
                onChange={() => onChange({ ...data, stripeMode: 'CUSTOM' })}
                className="mt-1"
                disabled={!isEditing}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Compte Stripe personnel</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Utilisez votre propre compte Stripe existant
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-green-600">✓ Contrôle total sur vos paiements</p>
                  <p className="text-xs text-green-600">✓ Tarifs Stripe directs</p>
                  <p className="text-xs text-green-600">✓ Accès direct à votre dashboard Stripe</p>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-orange-600">→ Configuration manuelle requise</p>
                  <p className="text-xs text-orange-600">→ Gestion de la conformité à votre charge</p>
                </div>
              </div>
            </label>
          </div>
          
          {/* Champs Stripe si mode CUSTOM */}
          {data.stripeMode === 'CUSTOM' && (
            <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-5 w-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-900">
                  Configuration de votre compte Stripe
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Configuration optionnelle</p>
                    <p>Vous pouvez configurer vos clés Stripe maintenant ou plus tard dans votre dashboard.</p>
                    <p className="mt-1 text-xs"><strong>Note :</strong> La collecte de dons sera désactivée tant que les clés ne sont pas configurées.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripeSecretKey" className="text-sm font-medium">
                  Clé secrète Stripe (optionnel)
                </Label>
                <div className="relative">
                  <Input
                    id="stripeSecretKey"
                    type="password"
                    value={data.stripeSecretKey || ''}
                    onChange={(e) => onChange({ ...data, stripeSecretKey: e.target.value })}
                    placeholder="sk_test_... ou sk_live_..."
                    className={`w-full ${
                      data.stripeSecretKey && 
                      !(data.stripeSecretKey.startsWith('sk_test_') || data.stripeSecretKey.startsWith('sk_live_'))
                        ? 'border-red-300 focus:border-red-500' 
                        : data.stripeSecretKey && 
                          (data.stripeSecretKey.startsWith('sk_test_') || data.stripeSecretKey.startsWith('sk_live_'))
                          ? 'border-green-300 focus:border-green-500'
                          : ''
                    } ${errors.stripeSecretKey ? 'border-red-500' : ''}`}
                    disabled={!isEditing}
                  />
                  {data.stripeSecretKey && data.stripeSecretKey.startsWith('sk_test_') && (
                    <span className="absolute right-3 top-2.5 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      TEST
                    </span>
                  )}
                  {data.stripeSecretKey && data.stripeSecretKey.startsWith('sk_live_') && (
                    <span className="absolute right-3 top-2.5 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Trouvez cette clé dans votre dashboard Stripe &gt; Developers &gt; API keys &gt; Secret key
                </p>
                {data.stripeSecretKey && 
                 !(data.stripeSecretKey.startsWith('sk_test_') || data.stripeSecretKey.startsWith('sk_live_')) && (
                  <p className="text-xs text-red-600">
                    ⚠️ Format invalide. La clé doit commencer par "sk_test_" ou "sk_live_"
                  </p>
                )}
                {errors.stripeSecretKey && <p className="text-xs text-red-500">{errors.stripeSecretKey}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripePublishableKey" className="text-sm font-medium">
                  Clé publique Stripe (optionnel)
                </Label>
                <div className="relative">
                  <Input
                    id="stripePublishableKey"
                    value={data.stripePublishableKey || ''}
                    onChange={(e) => onChange({ ...data, stripePublishableKey: e.target.value })}
                    placeholder="pk_test_... ou pk_live_..."
                    className={`w-full ${
                      data.stripePublishableKey && 
                      !(data.stripePublishableKey.startsWith('pk_test_') || data.stripePublishableKey.startsWith('pk_live_'))
                        ? 'border-red-300 focus:border-red-500' 
                        : data.stripePublishableKey && 
                          (data.stripePublishableKey.startsWith('pk_test_') || data.stripePublishableKey.startsWith('pk_live_'))
                          ? 'border-green-300 focus:border-green-500'
                          : ''
                    } ${errors.stripePublishableKey ? 'border-red-500' : ''}`}
                    disabled={!isEditing}
                  />
                  {data.stripePublishableKey && data.stripePublishableKey.startsWith('pk_test_') && (
                    <span className="absolute right-3 top-2.5 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      TEST
                    </span>
                  )}
                  {data.stripePublishableKey && data.stripePublishableKey.startsWith('pk_live_') && (
                    <span className="absolute right-3 top-2.5 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Trouvez cette clé dans votre dashboard Stripe &gt; Developers &gt; API keys &gt; Publishable key
                </p>
                {data.stripePublishableKey && 
                 !(data.stripePublishableKey.startsWith('pk_test_') || data.stripePublishableKey.startsWith('pk_live_')) && (
                  <p className="text-xs text-red-600">
                    ⚠️ Format invalide. La clé doit commencer par "pk_test_" ou "pk_live_"
                  </p>
                )}
                {errors.stripePublishableKey && <p className="text-xs text-red-500">{errors.stripePublishableKey}</p>}
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800">
                  <strong>Mode de développement :</strong> Vous pouvez utiliser des clés de test pour commencer :
                  <br/>• Test : "sk_test_..." et "pk_test_..." (transactions fictives)
                  <br/>• Production : "sk_live_..." et "pk_live_..." (vraies transactions)
                </p>
              </div>
              
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-800">
                  <strong>Sécurité :</strong> La clé secrète sera cryptée et stockée de manière sécurisée. 
                  Ne partagez jamais cette clé publiquement.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
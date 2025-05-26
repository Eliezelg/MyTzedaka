'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, CreditCard, Shield, Gift, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DonationWidgetProps {
  targetId: string
  targetType: 'association' | 'campaign'
  targetName: string
  suggestedAmounts?: number[]
  currency?: string
  className?: string
  variant?: 'default' | 'compact' | 'featured'
  showProgress?: boolean
  currentAmount?: number
  goalAmount?: number
}

export function DonationWidget({
  targetId,
  targetType,
  targetName,
  suggestedAmounts = [25, 50, 100, 250],
  currency = 'EUR',
  className = '',
  variant = 'default',
  showProgress = false,
  currentAmount,
  goalAmount
}: DonationWidgetProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    isAnonymous: false
  })
  const [step, setStep] = useState<'amount' | 'info' | 'payment'>('amount')

  const progressPercentage = showProgress && currentAmount && goalAmount 
    ? (currentAmount / goalAmount) * 100 
    : 0

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  const getCurrentAmount = () => {
    return selectedAmount || parseInt(customAmount) || 0
  }

  const handleProceedToInfo = () => {
    if (getCurrentAmount() > 0) {
      setStep('info')
    }
  }

  const handleProceedToPayment = () => {
    setStep('payment')
  }

  const handleDonate = () => {
    // TODO: Intégrer avec Stripe
    console.log('Don:', {
      targetId,
      targetType,
      amount: getCurrentAmount(),
      donor: donorInfo,
      currency
    })
  }

  if (variant === 'compact') {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center mb-4">
          <h3 className="font-semibold">Soutenir</h3>
          <p className="text-sm text-gray-600">{targetName}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {suggestedAmounts.slice(0, 4).map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? "primary" : "outline"}
              size="sm"
              onClick={() => handleAmountSelect(amount)}
            >
              {amount}€
            </Button>
          ))}
        </div>
        
        <Button className="w-full" onClick={handleDonate}>
          <Heart className="w-4 h-4 mr-2" />
          Donner
        </Button>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      {variant === 'featured' && (
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Faites la différence</h2>
          <p className="text-gray-600">Votre soutien compte pour {targetName}</p>
        </div>
      )}

      {showProgress && currentAmount && goalAmount && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">{currentAmount.toLocaleString()}€ collectés</span>
            <span className="text-gray-600">{goalAmount.toLocaleString()}€ objectif</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            {progressPercentage.toFixed(1)}% de l'objectif atteint
          </div>
        </div>
      )}

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {step === 'amount' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choisissez votre montant</h3>
              
              {/* Montants suggérés */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {suggestedAmounts.map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAmountSelect(amount)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      selectedAmount === amount
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl font-bold">{amount}€</div>
                    {amount >= 100 && (
                      <div className="text-xs text-gray-500">Reçu fiscal</div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Montant personnalisé */}
              <div className="relative">
                <input
                  type="number"
                  placeholder="Autre montant"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
                <span className="absolute right-4 top-3 text-gray-500">€</span>
              </div>
            </div>

            {/* Avantages fiscaux */}
            {getCurrentAmount() >= 100 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Avantage fiscal</span>
                </div>
                <p className="text-sm text-green-700">
                  Votre don de {getCurrentAmount()}€ ne vous coûtera que {(getCurrentAmount() * 0.34).toFixed(0)}€ 
                  après déduction fiscale (66% déductible).
                </p>
              </motion.div>
            )}

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleProceedToInfo}
              disabled={getCurrentAmount() === 0}
            >
              Continuer
            </Button>
          </div>
        )}

        {step === 'info' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Vos informations</h3>
              <Badge variant="outline">{getCurrentAmount()}€</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={donorInfo.isAnonymous}
                  onChange={(e) => setDonorInfo(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="anonymous" className="text-sm">Don anonyme</label>
              </div>

              {!donorInfo.isAnonymous && (
                <>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    value={donorInfo.name}
                    onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Votre email"
                    value={donorInfo.email}
                    onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}

              <textarea
                placeholder="Message de soutien (optionnel)"
                value={donorInfo.message}
                onChange={(e) => setDonorInfo(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('amount')} className="flex-1">
                Retour
              </Button>
              <Button onClick={handleProceedToPayment} className="flex-1">
                Paiement
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Paiement sécurisé</h3>
              <Badge variant="outline">{getCurrentAmount()}€</Badge>
            </div>

            {/* Résumé */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Don pour {targetName}</span>
                <span className="font-semibold">{getCurrentAmount()}€</span>
              </div>
              {!donorInfo.isAnonymous && donorInfo.name && (
                <div className="text-sm text-gray-600">
                  Donateur : {donorInfo.name}
                </div>
              )}
              {donorInfo.message && (
                <div className="text-sm text-gray-600">
                  Message : "{donorInfo.message}"
                </div>
              )}
            </div>

            {/* Sécurité */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Paiement sécurisé par Stripe</span>
            </div>

            {/* Boutons de paiement */}
            <div className="space-y-3">
              <Button className="w-full" size="lg" onClick={handleDonate}>
                <CreditCard className="w-4 h-4 mr-2" />
                Payer par carte bancaire
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm">
                  Apple Pay
                </Button>
                <Button variant="outline" size="sm">
                  Google Pay
                </Button>
              </div>
            </div>

            <Button variant="ghost" onClick={() => setStep('info')} className="w-full">
              Modifier les informations
            </Button>
          </div>
        )}
      </motion.div>
    </Card>
  )
}

// Composant bouton de don rapide
export function QuickDonateButton({ 
  targetId, 
  targetType, 
  amount = 25,
  className = '' 
}: {
  targetId: string
  targetType: 'association' | 'campaign'
  amount?: number
  className?: string
}) {
  const handleQuickDonate = () => {
    // TODO: Ouvrir modal de don rapide
    console.log('Don rapide:', { targetId, targetType, amount })
  }

  return (
    <Button 
      onClick={handleQuickDonate}
      className={`gap-2 ${className}`}
      size="sm"
    >
      <Heart className="w-4 h-4" />
      {amount}€
    </Button>
  )
}

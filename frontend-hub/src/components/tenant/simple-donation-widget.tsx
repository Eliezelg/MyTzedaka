'use client'

import { useState } from 'react'
import { Heart, CreditCard, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface SimpleDonationWidgetProps {
  targetId: string
  targetName: string
  suggestedAmounts?: number[]
  currency?: string
}

export function SimpleDonationWidget({
  targetId,
  targetName,
  suggestedAmounts = [18, 36, 100, 180, 360, 1000],
  currency = 'EUR'
}: SimpleDonationWidgetProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [step, setStep] = useState<'amount' | 'info' | 'payment'>('amount')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue)
    }
  }

  const handleNextStep = () => {
    if (step === 'amount' && selectedAmount > 0) {
      setStep('info')
    } else if (step === 'info') {
      if (!donorInfo.name || !donorInfo.email) {
        toast.error('Veuillez remplir les champs obligatoires')
        return
      }
      setStep('payment')
    }
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    try {
      // TODO: Implémenter l'intégration Stripe
      console.log('Processing donation:', {
        amount: selectedAmount,
        targetId,
        donorInfo
      })
      
      toast.success('Merci pour votre don!')
      
      // Reset
      setStep('amount')
      setSelectedAmount(100)
      setCustomAmount('')
      setDonorInfo({ name: '', email: '', message: '' })
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Faire un don à {targetName}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Progress Indicator */}
        <div className="flex justify-between mb-8">
          <div className={`flex items-center ${step === 'amount' ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 ${
              step === 'amount' ? 'border-primary bg-primary text-white' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="hidden sm:inline">Montant</span>
          </div>
          
          <div className={`flex items-center ${step === 'info' ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 ${
              step === 'info' ? 'border-primary bg-primary text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="hidden sm:inline">Informations</span>
          </div>
          
          <div className={`flex items-center ${step === 'payment' ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 ${
              step === 'payment' ? 'border-primary bg-primary text-white' : 'border-gray-300'
            }`}>
              3
            </div>
            <span className="hidden sm:inline">Paiement</span>
          </div>
        </div>

        {/* Step 1: Amount Selection */}
        {step === 'amount' && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {suggestedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount && !customAmount ? 'default' : 'outline'}
                  onClick={() => handleAmountSelect(amount)}
                  className="h-14"
                >
                  {formatAmount(amount)}
                </Button>
              ))}
            </div>
            
            <div className="mb-6">
              <Label htmlFor="custom-amount">Montant personnalisé</Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="Autre montant"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <Button 
              onClick={handleNextStep}
              className="w-full h-12"
              disabled={selectedAmount <= 0}
            >
              Continuer avec {formatAmount(selectedAmount)}
            </Button>
          </div>
        )}

        {/* Step 2: Donor Information */}
        {step === 'info' && (
          <div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  required
                  value={donorInfo.name}
                  onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={donorInfo.email}
                  onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message (optionnel)</Label>
                <textarea
                  id="message"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                  rows={3}
                  value={donorInfo.message}
                  onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button 
                variant="outline"
                onClick={() => setStep('amount')}
                className="flex-1"
              >
                Retour
              </Button>
              <Button 
                onClick={handleNextStep}
                className="flex-1"
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && (
          <div>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold mb-4">Récapitulatif</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Montant:</span>
                  <span className="font-semibold">{formatAmount(selectedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bénéficiaire:</span>
                  <span className="font-semibold">{targetName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Donateur:</span>
                  <span className="font-semibold">{donorInfo.name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-6 text-sm text-gray-600">
              <Shield className="h-4 w-4 mr-2" />
              Paiement sécurisé par Stripe
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => setStep('info')}
                className="flex-1"
                disabled={isProcessing}
              >
                Retour
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  'Traitement...'
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Confirmer le don
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
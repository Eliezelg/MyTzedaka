'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, CreditCard, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StripeService } from '@/lib/stripe/stripe-service';

// Configuration Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface DonationWidgetProps {
  campaignId?: string;
  campaignTitle?: string;
  suggestedAmounts?: number[];
  className?: string;
  onSuccess?: (donationId: string, amount: number) => void;
}

export function DonationWidget({
  campaignId,
  campaignTitle,
  suggestedAmounts = [25, 50, 100, 250],
  className,
  onSuccess,
}: DonationWidgetProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'payment'>('amount');

  const finalAmount = selectedAmount || parseFloat(customAmount) || 0;

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleContinueToPayment = () => {
    if (finalAmount >= 0.5) {
      setStep('payment');
    }
  };

  const handleDonation = async () => {
    setIsLoading(true);
    
    try {
      // Simulation - ici on intégrerait Stripe Elements
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En attendant l'intégration complète Stripe
      console.log('Donation simulée:', {
        amount: finalAmount,
        campaignId,
        isAnonymous,
      });
      
      onSuccess?.(crypto.randomUUID(), finalAmount);
    } catch (error) {
      console.error('Erreur donation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'payment') {
    return (
      <Card className={cn('w-full max-w-md', className)}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <CreditCard className="w-5 h-5" />
            Finaliser la donation
          </CardTitle>
          <p className="text-sm text-gray-600">
            {StripeService.formatAmount(finalAmount)}
            {campaignTitle && (
              <span className="block text-xs mt-1">pour {campaignTitle}</span>
            )}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Placeholder pour Stripe Elements */}
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            <Lock className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Formulaire de paiement sécurisé</p>
            <p className="text-xs">Stripe Elements sera intégré ici</p>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded"
              />
              Donation anonyme
            </label>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Button
              onClick={handleDonation}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Traitement...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Donner {StripeService.formatAmount(finalAmount)}
                </span>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setStep('amount')}
              className="w-full"
              disabled={isLoading}
            >
              Retour
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            🔒 Paiement 100% sécurisé par Stripe
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Heart className="w-5 h-5 text-red-500" />
          Faire une donation
        </CardTitle>
        {campaignTitle && (
          <p className="text-sm text-gray-600">pour {campaignTitle}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Montants suggérés */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Montants suggérés
          </label>
          <div className="grid grid-cols-2 gap-2">
            {suggestedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? 'default' : 'outline'}
                onClick={() => handleAmountSelect(amount)}
                className="h-12"
              >
                {StripeService.formatAmountSimple(amount)}
              </Button>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Montant personnalisé */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Montant personnalisé
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="pr-8"
              min="0.5"
              step="0.5"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              €
            </span>
          </div>
          {(selectedAmount || customAmount) && finalAmount < 0.5 && (
            <p className="text-sm text-red-500 mt-1">
              Le montant minimum est de 0.50€
            </p>
          )}
        </div>
        
        {/* Résumé */}
        {finalAmount > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <Badge variant="secondary" className="text-lg font-bold">
                {StripeService.formatAmount(finalAmount)}
              </Badge>
            </div>
          </div>
        )}
        
        <Button
          onClick={handleContinueToPayment}
          disabled={finalAmount < 0.5}
          className="w-full"
          size="lg"
        >
          Continuer
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Vos informations sont protégées et sécurisées
        </p>
      </CardContent>
    </Card>
  );
}

// Export par défaut pour utilisation dynamique
export default DonationWidget;

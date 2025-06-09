'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Heart, CreditCard, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStripe } from '@/hooks/useStripe';
import { useDonations } from '@/hooks/useDonations';
import { DonationForm } from './DonationForm';

interface DonationWidgetProps {
  campaignId?: string;
  tenantId?: string;
  campaignTitle?: string; // Pour compatibilité avec l'ancien widget
  title?: string;
  description?: string;
  suggestedAmounts?: number[];
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  className?: string;
}

export function DonationWidget({
  campaignId,
  tenantId,
  campaignTitle, // Pour compatibilité avec l'ancien widget
  title = "Faire un don",
  description = "Votre générosité fait la différence",
  suggestedAmounts = [25, 50, 100, 250],
  minAmount = 1,
  maxAmount = 100000,
  currency = 'EUR',
  className
}: DonationWidgetProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [stripe, setStripe] = useState<any>(null);

  // Hooks pour Stripe et donations - toujours appeler les hooks React de manière inconditionnelle
  const stripeResult = useStripe(tenantId || '');
  const { publishableKey, isLoadingKey, keyError } = tenantId ? stripeResult : { 
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, 
    isLoadingKey: false, 
    keyError: null 
  };
  const { createDonation, isCreatingDonation } = useDonations();

  // Initialiser Stripe quand la clé publique est disponible
  useEffect(() => {
    if (publishableKey) {
      loadStripe(publishableKey).then(setStripe);
    }
  }, [publishableKey]);

  // Gestion du montant final
  const finalAmount = selectedAmount || parseFloat(customAmount) || 0;
  const isValidAmount = finalAmount >= minAmount && finalAmount <= maxAmount;

  // Formatage du montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Gestion de la sélection de montant
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  // Gestion du montant personnalisé
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  // Gestion de l'erreur Stripe
  if (keyError) {
    return (
      <Card className={cn("max-w-md mx-auto", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Configuration Stripe manquante
          </CardTitle>
          <CardDescription>
            La configuration des paiements n'est pas encore disponible pour cette association.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // État de chargement
  if (isLoadingKey || !stripe) {
    return (
      <Card className={cn("max-w-md mx-auto", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Initialisation du paiement...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("max-w-md mx-auto shadow-lg", className)}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Heart className="h-6 w-6 text-red-500" />
          {title}
        </CardTitle>
        {(description || campaignTitle) && (
          <CardDescription className="text-base">{campaignTitle || description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {!showForm ? (
          <>
            {/* Montants suggérés */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Choisissez votre montant</Label>
              <div className="grid grid-cols-2 gap-2">
                {suggestedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "primary" : "outline"}
                    className="h-12 text-lg font-semibold"
                    onClick={() => handleAmountSelect(amount)}
                  >
                    {formatAmount(amount)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Montant personnalisé */}
            <div className="space-y-2">
              <Label htmlFor="custom-amount" className="text-sm font-medium">
                Ou saisissez un montant personnalisé
              </Label>
              <div className="relative">
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="0"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="pl-8 text-lg"
                  min={minAmount}
                  max={maxAmount}
                  step="0.01"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  €
                </span>
              </div>
              {customAmount && !isValidAmount && (
                <p className="text-sm text-red-600">
                  Le montant doit être entre {formatAmount(minAmount)} et {formatAmount(maxAmount)}
                </p>
              )}
            </div>

            {/* Résumé */}
            {finalAmount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Montant de votre don :</span>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {formatAmount(finalAmount)}
                  </Badge>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Formulaire de paiement Stripe */
          <Elements 
            stripe={stripe} 
            options={{
              mode: 'payment',
              amount: Math.round(finalAmount * 100), // Convertir en centimes
              currency: currency.toLowerCase(),
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#3b82f6',
                }
              }
            }}
          >
            <DonationForm
              amount={finalAmount}
              currency={currency}
              campaignId={campaignId}
              tenantId={tenantId || process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || ''}
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </Elements>
        )}
      </CardContent>

      <CardFooter>
        {!showForm ? (
          <Button
            className="w-full h-12 text-lg font-semibold"
            disabled={!isValidAmount || finalAmount === 0}
            onClick={() => setShowForm(true)}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Continuer vers le paiement
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

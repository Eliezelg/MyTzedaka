'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Heart, CreditCard, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StripeProvider } from '@/lib/stripe-provider';
import { DonationForm } from './DonationForm';
import { useDonations } from '@/hooks/useDonations';

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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [donorInfo, setDonorInfo] = useState({ email: '', name: '' });
  const [step, setStep] = useState<'amount' | 'info' | 'payment' | 'processing' | 'success' | 'error'>('amount');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { createDonation, isCreatingDonation } = useDonations();

  // Calcul du montant final à donner
  const amount = selectedAmount || parseFloat(customAmount) || 0;
  const isValidAmount = amount >= minAmount && amount <= maxAmount;

  const handleAmountSelect = (amountValue: number) => {
    setSelectedAmount(amountValue);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleDonate = () => {
    if (isValidAmount) {
      setStep('info');
    }
  };

  const handleBackToAmounts = () => {
    setStep('amount');
    setShowForm(false);
    setSelectedAmount(null);
    setCustomAmount('');
    setClientSecret(null);
    setDonorInfo({ email: '', name: '' });
  };

  const handleDonorInfoSubmit = async (email: string, name: string) => {
    try {
      setStep('processing');
      setDonorInfo({ email, name });
      
      // Créer la donation pour obtenir le clientSecret
      const response = await createDonation.mutateAsync({
        tenantId: tenantId!,
        campaignId,
        amount,
        currency,
        donorEmail: email,
        donorName: name
      });

      setClientSecret(response.clientSecret);
      setStep('payment');
    } catch (error: any) {
      console.error('Erreur création donation:', error);
      setErrorMessage(error.message || 'Erreur lors de la création de la donation');
      setStep('error');
    }
  };

  // Étape 1: Sélection du montant
  if (step === 'amount') {
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
          {/* Montants suggérés */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choisissez votre montant</Label>
            <div className="grid grid-cols-2 gap-2">
              {suggestedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className="h-12 text-lg font-semibold"
                  onClick={() => handleAmountSelect(amount)}
                >
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 0
                  }).format(amount)}
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
                Le montant doit être entre {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: currency,
                  minimumFractionDigits: 0
                }).format(minAmount)} et {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: currency,
                  minimumFractionDigits: 0
                }).format(maxAmount)}
              </p>
            )}
          </div>

          {/* Résumé */}
          {amount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Montant de votre don :</span>
                <Badge variant="secondary" className="text-lg font-bold">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 0
                  }).format(amount)}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            className="w-full h-12 text-lg font-semibold"
            disabled={!isValidAmount || amount === 0}
            onClick={handleDonate}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Continuer vers le paiement
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Étape 2: Informations du donateur
  if (step === 'info') {
    return (
      <Card className={cn("max-w-md mx-auto shadow-lg", className)}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Heart className="h-6 w-6 text-red-500" />
            Vos informations
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Montant :</span>
              <Badge variant="secondary" className="text-lg font-bold">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: currency,
                  minimumFractionDigits: 0
                }).format(amount)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="donor-name">Nom complet *</Label>
            <Input
              id="donor-name"
              type="text"
              placeholder="Votre nom et prénom"
              value={donorInfo.name}
              onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="donor-email">Email *</Label>
            <Input
              id="donor-email"
              type="email"
              placeholder="votre@email.com"
              value={donorInfo.email}
              onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <p className="text-sm text-gray-600">
            Vous recevrez un reçu de don par email.
          </p>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={handleBackToAmounts} className="flex-1">
            Retour
          </Button>
          <Button 
            className="flex-1" 
            disabled={!donorInfo.email || !donorInfo.name}
            onClick={() => handleDonorInfoSubmit(donorInfo.email, donorInfo.name)}
          >
            Continuer
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Étape 3: Traitement
  if (step === 'processing') {
    return (
      <Card className={cn("max-w-md mx-auto shadow-lg", className)}>
        <CardContent className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-medium mb-2">Préparation du paiement...</h3>
          <p className="text-gray-600">Veuillez patienter.</p>
        </CardContent>
      </Card>
    );
  }

  // Étape 4: Paiement Stripe
  if (step === 'payment' && clientSecret) {
    return (
      <StripeProvider tenantId={tenantId} clientSecret={clientSecret}>
        <DonationForm
          amount={amount}
          campaignId={campaignId}
          tenantId={tenantId}
          currency={currency}
          clientSecret={clientSecret}
          donorInfo={donorInfo}
          onBack={handleBackToAmounts}
          onSuccess={() => {
            console.log('Donation successful');
            setStep('success');
          }}
          onError={(error) => {
            console.error('Donation error:', error);
            setErrorMessage(error);
            setStep('error');
          }}
        />
      </StripeProvider>
    );
  }

  // Étape 5: Succès
  if (step === 'success') {
    return (
      <Card className={cn("max-w-md mx-auto shadow-lg", className)}>
        <CardContent className="text-center py-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-700 mb-2">Merci pour votre don !</h3>
          <p className="text-gray-600 mb-4">
            Votre don de {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: currency
            }).format(amount)} a été traité avec succès.
          </p>
          <p className="text-sm text-gray-500">
            Vous recevrez un reçu par email à {donorInfo.email}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleBackToAmounts} className="w-full">
            Faire un autre don
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Étape 6: Erreur
  if (step === 'error') {
    return (
      <Card className={cn("max-w-md mx-auto shadow-lg", className)}>
        <CardContent className="text-center py-8">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-700 mb-2">Erreur</h3>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={handleBackToAmounts} className="flex-1">
            Recommencer
          </Button>
          <Button onClick={() => setStep('payment')} className="flex-1">
            Réessayer
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
}

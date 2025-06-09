'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useDonations } from '@/hooks/useDonations';
import { toast } from 'sonner';

interface DonationFormProps {
  amount: number;
  currency: string;
  campaignId?: string;
  tenantId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DonationForm({
  amount,
  currency,
  campaignId,
  tenantId,
  onSuccess,
  onCancel
}: DonationFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { createDonation, confirmDonation, isCreatingDonation, isConfirmingDonation } = useDonations();

  const [donorInfo, setDonorInfo] = useState({
    email: '',
    name: ''
  });
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [step, setStep] = useState<'info' | 'payment' | 'processing' | 'success' | 'error'>('info');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Formatage du montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Étape 1: Collecter les informations du donateur
  const handleDonorInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!donorInfo.email || !donorInfo.name) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setStep('processing');
      
      // Créer la donation
      const response = await createDonation.mutateAsync({
        tenantId,
        campaignId,
        amount,
        currency,
        donorEmail: donorInfo.email,
        donorName: donorInfo.name
      });

      setPaymentIntentId(response.paymentIntent.id);
      setStep('payment');
    } catch (error: any) {
      console.error('Erreur création donation:', error);
      setErrorMessage(error.message || 'Erreur lors de la création de la donation');
      setStep('error');
    }
  };

  // Étape 2: Traitement du paiement Stripe
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !paymentIntentId) {
      return;
    }

    setStep('processing');

    try {
      // Confirmer le paiement avec Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        console.error('Erreur paiement Stripe:', error);
        setErrorMessage(error.message || 'Erreur lors du paiement');
        setStep('error');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirmer la donation côté backend
        await confirmDonation.mutateAsync(paymentIntentId);
        setStep('success');
        toast.success('Merci pour votre générosité !');
        
        // Délai avant fermeture pour laisser le temps de voir le message
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        setErrorMessage('Le paiement n\'a pas pu être finalisé');
        setStep('error');
      }
    } catch (error: any) {
      console.error('Erreur confirmation donation:', error);
      setErrorMessage(error.message || 'Erreur lors de la confirmation');
      setStep('error');
    }
  };

  // Rendu selon l'étape
  const renderContent = () => {
    switch (step) {
      case 'info':
        return (
          <form onSubmit={handleDonorInfoSubmit} className="space-y-4">
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
              <Label htmlFor="donor-email">Adresse email *</Label>
              <Input
                id="donor-email"
                type="email"
                placeholder="votre@email.com"
                value={donorInfo.email}
                onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <p className="text-xs text-gray-600">
                Nous vous enverrons une confirmation de votre don
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Montant du don :</span>
                <span className="font-bold text-lg text-blue-900">
                  {formatAmount(amount)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button type="submit" className="flex-1" disabled={isCreatingDonation}>
                {isCreatingDonation ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Continuer
              </Button>
            </div>
          </form>
        );

      case 'payment':
        return (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-2">Donation pour :</div>
              <div className="font-medium">{donorInfo.name}</div>
              <div className="text-sm text-gray-600">{donorInfo.email}</div>
              <div className="font-bold text-lg text-green-900 mt-2">
                {formatAmount(amount)}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Informations de paiement</Label>
              <PaymentElement 
                options={{
                  layout: 'tabs'
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('info')} 
                className="flex-1"
                disabled={isConfirmingDonation}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                disabled={!stripe || isConfirmingDonation}
              >
                {isConfirmingDonation ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Confirmer le don
              </Button>
            </div>
          </form>
        );

      case 'processing':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">Traitement en cours...</h3>
            <p className="text-gray-600">Veuillez patienter pendant le traitement de votre don.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-700 mb-2">Don confirmé !</h3>
            <p className="text-gray-600 mb-4">
              Merci {donorInfo.name} pour votre généreux don de {formatAmount(amount)}.
            </p>
            <p className="text-sm text-gray-500">
              Vous recevrez un reçu par email à {donorInfo.email}
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-700 mb-2">Erreur</h3>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setStep(paymentIntentId ? 'payment' : 'info')}
              >
                Réessayer
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          {step === 'info' && 'Vos informations'}
          {step === 'payment' && 'Paiement sécurisé'}
          {step === 'processing' && 'Traitement'}
          {step === 'success' && 'Succès'}
          {step === 'error' && 'Erreur'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

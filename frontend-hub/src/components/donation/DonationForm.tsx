'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useDonations } from '@/hooks/useDonations';
import { toast } from 'sonner';

interface DonationFormProps {
  amount: number;
  currency: string;
  campaignId?: string;
  tenantId?: string;
  clientSecret: string;
  donorInfo: { email: string; name: string };
  onSuccess: () => void;
  onBack: () => void;
  onError: (error: string) => void;
}

export function DonationForm({
  amount,
  currency,
  clientSecret,
  donorInfo,
  onSuccess,
  onBack,
  onError
}: DonationFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { confirmDonation, isConfirmingDonation } = useDonations();

  const [isProcessing, setIsProcessing] = useState(false);

  // Formatage du montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Traitement du paiement Stripe
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe n\'est pas initialisé');
      return;
    }

    setIsProcessing(true);

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
        onError(error.message || 'Erreur lors du paiement');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirmer la donation côté backend
        await confirmDonation.mutateAsync(paymentIntent.id);
        toast.success('Merci pour votre générosité !');
        onSuccess();
      } else {
        onError('Le paiement n\'a pas pu être finalisé');
      }
    } catch (error: any) {
      console.error('Erreur confirmation donation:', error);
      onError(error.message || 'Erreur lors de la confirmation');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          Finaliser votre don
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Résumé du don */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Donateur :</span>
              <span className="font-medium">{donorInfo.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Email :</span>
              <span className="font-medium">{donorInfo.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Montant du don :</span>
              <span className="font-bold text-lg text-blue-900">
                {formatAmount(amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Formulaire de paiement Stripe */}
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="space-y-4">
            <PaymentElement />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700" 
              disabled={!stripe || isProcessing || isConfirmingDonation}
            >
              {isProcessing || isConfirmingDonation ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirmer le don
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Vous recevrez un reçu par email à {donorInfo.email}
        </p>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DonatePage() {
  const params = useParams();
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const predefinedAmounts = [18, 36, 72, 180, 360];

  const handleAmountSelect = (value: number) => {
    setSelectedAmount(value);
    setAmount(value.toString());
  };

  const handleCustomAmount = (value: string) => {
    setAmount(value);
    setSelectedAmount(null);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-8">Faire un don</h1>
      
      <Card className="p-8">
        <div className="space-y-6">
          {/* Montants prédéfinis */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Choisissez un montant
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {predefinedAmounts.map((value) => (
                <button
                  key={value}
                  onClick={() => handleAmountSelect(value)}
                  className={`p-3 rounded-lg border-2 transition ${
                    selectedAmount === value
                      ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {value}€
                </button>
              ))}
            </div>
          </div>

          {/* Montant personnalisé */}
          <div>
            <Label htmlFor="custom-amount" className="text-base font-semibold mb-2 block">
              Ou entrez un montant personnalisé
            </Label>
            <div className="relative">
              <Input
                id="custom-amount"
                type="number"
                value={amount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                placeholder="0"
                className="pl-8 text-lg"
                min="1"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                €
              </span>
            </div>
          </div>

          {/* Message optionnel */}
          <div>
            <Label htmlFor="message" className="text-base font-semibold mb-2 block">
              Message (optionnel)
            </Label>
            <textarea
              id="message"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Votre message de soutien..."
            />
          </div>

          {/* Anonymat */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              className="mr-2"
            />
            <Label htmlFor="anonymous" className="cursor-pointer">
              Faire un don anonyme
            </Label>
          </div>

          {/* Bouton de don */}
          <Button 
            className="w-full text-lg py-6"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Continuer avec {amount ? `${amount}€` : 'votre don'}
          </Button>

          {/* Sécurité */}
          <div className="text-center text-sm text-gray-600">
            <p>🔒 Paiement 100% sécurisé via Stripe</p>
            <p className="mt-1">Votre don est déductible des impôts</p>
          </div>
        </div>
      </Card>

      {/* Informations supplémentaires */}
      <div className="mt-8 text-center text-gray-600">
        <h3 className="font-semibold mb-2">Pourquoi donner ?</h3>
        <p className="text-sm">
          Votre générosité permet de soutenir nos actions communautaires,
          d'aider les familles dans le besoin et de maintenir nos programmes éducatifs.
        </p>
      </div>
    </div>
  );
}
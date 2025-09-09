'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface DonationBlockProps {
  tenantId?: string;
  title?: string;
  description?: string;
  amounts?: number[];
  defaultAmount?: number;
  showRecurring?: boolean;
  backgroundColor?: string;
}

export default function DonationBlock({
  tenantId,
  title = 'Faire un don',
  description = 'Votre soutien fait la différence',
  amounts = [18, 36, 100, 180, 360],
  defaultAmount = 100,
  showRecurring = true,
  backgroundColor = 'bg-primary/5',
}: DonationBlockProps) {
  const [selectedAmount, setSelectedAmount] = useState(defaultAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleDonate = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    window.location.href = `/donate?amount=${amount}&recurring=${isRecurring}`;
  };

  return (
    <div className={`py-12 px-8 rounded-xl ${backgroundColor}`}>
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="space-y-4">
          {/* Montants prédéfinis */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {amounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={`
                  py-3 px-4 rounded-lg border-2 font-semibold transition-all
                  ${selectedAmount === amount && !customAmount
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 hover:border-primary'
                  }
                `}
              >
                {amount}€
              </button>
            ))}
          </div>
          
          {/* Montant personnalisé */}
          <input
            type="number"
            placeholder="Autre montant (€)"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(0);
            }}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          
          {/* Option récurrente */}
          {showRecurring && (
            <label className="flex items-center justify-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-5 w-5 text-primary rounded"
              />
              <span>Don mensuel récurrent</span>
            </label>
          )}
          
          {/* Bouton de don */}
          <Button 
            onClick={handleDonate}
            size="lg"
            className="w-full"
            disabled={!selectedAmount && !customAmount}
          >
            <Heart className="mr-2 h-5 w-5" />
            Faire un don de {customAmount || selectedAmount}€
            {isRecurring && ' par mois'}
          </Button>
        </div>
      </div>
    </div>
  );
}
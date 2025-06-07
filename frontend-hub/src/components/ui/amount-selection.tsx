import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Checkbox } from './checkbox';

interface AmountSelectionProps {
  onAmountSelected: (amount: number, isAnonymous: boolean) => void;
}

export function AmountSelection({ onAmountSelected }: AmountSelectionProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [errors, setErrors] = useState<string>('');

  const suggestedAmounts = [25, 50, 100, 250, 500, 1000];

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setErrors('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);
    setErrors('');
  };

  const handleAnonymousChange = (checked: boolean) => {
    setIsAnonymous(checked);
  };

  const handleContinue = () => {
    let amount = selectedAmount;
    
    if (!amount && customAmount) {
      const parsedAmount = parseFloat(customAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setErrors('Veuillez entrer un montant valide');
        return;
      }
      if (parsedAmount < 5) {
        setErrors('Le montant minimum est de 5€');
        return;
      }
      if (parsedAmount > 50000) {
        setErrors('Le montant maximum est de 50 000€');
        return;
      }
      amount = parsedAmount;
    }

    if (!amount) {
      setErrors('Veuillez sélectionner ou saisir un montant');
      return;
    }

    onAmountSelected(amount, isAnonymous);
  };

  const isValidAmount = selectedAmount || (customAmount && parseFloat(customAmount) >= 5);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choisissez votre montant</h3>
        
        {/* Montants suggérés */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {suggestedAmounts.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? 'primary' : 'secondary'}
              size="lg"
              onClick={() => handleAmountClick(amount)}
              className="text-center"
            >
              {amount}€
            </Button>
          ))}
        </div>

        {/* Montant personnalisé */}
        <div className="space-y-2">
          <Label htmlFor="custom-amount">Autre montant</Label>
          <div className="relative">
            <Input
              id="custom-amount"
              type="number"
              placeholder="Montant personnalisé"
              value={customAmount}
              onChange={handleCustomAmountChange}
              min="5"
              max="50000"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              €
            </span>
          </div>
        </div>

        {errors && (
          <p className="text-red-600 text-sm mt-2">{errors}</p>
        )}
      </div>

      {/* Option don anonyme */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={handleAnonymousChange}
        />
        <Label htmlFor="anonymous" className="text-sm">
          Don anonyme
        </Label>
      </div>

      {/* Bouton continuer */}
      <Button
        onClick={handleContinue}
        disabled={!isValidAmount}
        className="w-full"
        size="lg"
      >
        Continuer
      </Button>

      {/* Informations légales */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Votre don est sécurisé par Stripe</p>
        <p>• Reçu fiscal automatique par email</p>
        <p>• Réduction d'impôt de 66% en France</p>
      </div>
    </div>
  );
}

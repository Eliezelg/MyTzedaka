'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Shield, Users, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DonationSectionProps {
  tenantId: string;
  title?: string;
  description?: string;
}

const predefinedAmounts = [18, 36, 100, 180, 360, 1000];

export function DonationSection({ 
  tenantId, 
  title = 'Soutenez Notre Mission',
  description = 'Votre générosité nous permet de continuer notre mission et d\'aider ceux qui en ont besoin.'
}: DonationSectionProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleDonate = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    // Rediriger vers la page de don avec les paramètres
    window.location.href = `/donate?amount=${amount}&recurring=${isRecurring}`;
  };

  const features = [
    {
      icon: Shield,
      title: 'Don Sécurisé',
      description: 'Paiement 100% sécurisé via Stripe'
    },
    {
      icon: Heart,
      title: 'Reçu Fiscal',
      description: 'Déduction fiscale automatique'
    },
    {
      icon: Users,
      title: 'Impact Direct',
      description: '100% de votre don va à la cause'
    },
    {
      icon: Globe,
      title: 'Transparence',
      description: 'Suivez l\'impact de votre don'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Donation Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choisissez un montant
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={cn(
                      'py-3 px-4 rounded-lg border-2 font-semibold transition-all',
                      selectedAmount === amount && !customAmount
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 hover:border-primary'
                    )}
                  >
                    {amount}€
                  </button>
                ))}
              </div>
              
              {/* Custom Amount */}
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Autre montant"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(0);
                  }}
                  className="pl-8"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              </div>
            </div>

            {/* Recurring Option */}
            <div className="mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-5 w-5 text-primary rounded focus:ring-primary"
                />
                <span className="text-gray-700">
                  Faire un don mensuel récurrent
                </span>
              </label>
            </div>

            {/* Donate Button */}
            <Button 
              onClick={handleDonate}
              size="lg" 
              className="w-full text-lg py-6"
              disabled={!selectedAmount && !customAmount}
            >
              <Heart className="mr-2 h-5 w-5" />
              Faire un don de {customAmount || selectedAmount}€ {isRecurring && 'par mois'}
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
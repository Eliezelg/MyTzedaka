'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Shield, CreditCard, Mail, User, Phone, MapPin } from 'lucide-react';
import { useTenant } from '@/providers/tenant-provider';

interface DonatePageProps {
  tenantId: string;
}

const predefinedAmounts = [18, 36, 100, 180, 360, 500, 1000, 1800];

export function DonatePage({ tenantId }: DonatePageProps) {
  const { tenant } = useTenant();
  const [step, setStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'FR',
    receiptRequired: true,
    newsletter: false,
  });

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(0);
  };

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleNextStep = () => {
    if (step === 1 && finalAmount > 0) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // TODO: Intégrer Stripe
    console.log('Processing donation:', {
      amount: finalAmount,
      recurring: isRecurring,
      anonymous: isAnonymous,
      ...formData
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Faire un don à {tenant.name}</h1>
          <p className="text-lg text-gray-600">
            Votre générosité nous permet de continuer notre mission
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${step >= i 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {i}
              </div>
              {i < 3 && (
                <div className={`w-20 h-1 mx-2 ${step > i ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Amount Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Choisissez votre montant</h2>
              
              {/* Predefined Amounts */}
              <div className="grid grid-cols-4 gap-3">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
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
              
              {/* Custom Amount */}
              <div>
                <Label htmlFor="custom-amount">Autre montant</Label>
                <div className="relative mt-1">
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Entrez un montant"
                    value={customAmount}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
              
              {/* Recurring Option */}
              <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                  <div>
                    <div className="font-semibold">Faire un don mensuel récurrent</div>
                    <div className="text-sm text-gray-600">
                      Soutenez-nous durablement avec un don mensuel
                    </div>
                  </div>
                </Label>
              </div>
              
              {/* Anonymous Option */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                />
                <Label htmlFor="anonymous">
                  Faire un don anonyme
                </Label>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Vos informations</h2>
              
              {!isAnonymous && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">
                        <User className="inline h-4 w-4 mr-1" />
                        Prénom
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">
                        <User className="inline h-4 w-4 mr-1" />
                        Nom
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Téléphone (optionnel)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Adresse
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="receipt"
                    checked={formData.receiptRequired}
                    onCheckedChange={(checked) => setFormData({...formData, receiptRequired: checked as boolean})}
                  />
                  <Label htmlFor="receipt">
                    Je souhaite recevoir un reçu fiscal
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => setFormData({...formData, newsletter: checked as boolean})}
                  />
                  <Label htmlFor="newsletter">
                    Je souhaite recevoir la newsletter
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Paiement sécurisé</h2>
              
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">Récapitulatif de votre don</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Montant</span>
                    <span className="font-semibold">{finalAmount}€</span>
                  </div>
                  {isRecurring && (
                    <div className="flex justify-between">
                      <span>Fréquence</span>
                      <span className="font-semibold">Mensuel</span>
                    </div>
                  )}
                  {isAnonymous && (
                    <div className="flex justify-between">
                      <span>Type</span>
                      <span className="font-semibold">Don anonyme</span>
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        {finalAmount}€{isRecurring && '/mois'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Shield className="h-5 w-5" />
                    <span className="font-semibold">Paiement 100% sécurisé</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Vos informations bancaires sont cryptées et sécurisées par Stripe
                  </p>
                </div>

                {/* TODO: Intégrer Stripe Elements ici */}
                <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-2" />
                  <p>Formulaire de paiement Stripe</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handlePreviousStep}
              >
                Précédent
              </Button>
            )}
            
            <div className="ml-auto">
              {step < 3 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={step === 1 && !finalAmount}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Confirmer le don de {finalAmount}€
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          {[
            { icon: Shield, text: 'Paiement sécurisé' },
            { icon: Heart, text: '100% à la cause' },
            { icon: Mail, text: 'Reçu fiscal' },
            { icon: CreditCard, text: 'Stripe' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <item.icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
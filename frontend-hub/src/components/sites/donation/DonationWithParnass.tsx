'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Calendar, 
  Star, 
  CreditCard,
  Gift,
  CalendarDays,
  Clock
} from 'lucide-react';
import { useTenant } from '@/providers/tenant-provider';
import { useAuth } from '@/providers/auth-provider';
import { ParnassBookingFlow } from '../parnass/ParnassBookingFlow';

interface DonationWithParnassProps {
  campaignId?: string;
  showParnass?: boolean;
}

export function DonationWithParnass({ 
  campaignId, 
  showParnass = true 
}: DonationWithParnassProps) {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('donation');
  const [donationType, setDonationType] = useState<'one-time' | 'recurring'>('one-time');
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');

  const predefinedAmounts = [18, 36, 100, 180, 360, 500];

  const handleDonation = async () => {
    // Existing donation logic
    console.log('Processing donation:', { amount, donationType, frequency });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {showParnass && (
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="donation">
              <Heart className="h-4 w-4 mr-2" />
              Don Classique
            </TabsTrigger>
            <TabsTrigger value="parnass">
              <Star className="h-4 w-4 mr-2" />
              Devenir Parnass
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="donation">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Faire un Don</h2>
                <p className="text-gray-600">
                  Soutenez {tenant.name} et ses actions
                </p>
              </div>

              {/* Donation Type */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Type de don</Label>
                <RadioGroup value={donationType} onValueChange={(value) => setDonationType(value as any)}>
                  <div className="grid grid-cols-2 gap-4">
                    <label htmlFor="one-time" className="cursor-pointer">
                      <Card className={`p-4 ${donationType === 'one-time' ? 'ring-2 ring-primary' : ''}`}>
                        <RadioGroupItem value="one-time" id="one-time" className="sr-only" />
                        <div className="flex items-center gap-3">
                          <Gift className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">Don ponctuel</p>
                            <p className="text-sm text-gray-600">Un don unique</p>
                          </div>
                        </div>
                      </Card>
                    </label>

                    <label htmlFor="recurring" className="cursor-pointer">
                      <Card className={`p-4 ${donationType === 'recurring' ? 'ring-2 ring-primary' : ''}`}>
                        <RadioGroupItem value="recurring" id="recurring" className="sr-only" />
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">Don récurrent</p>
                            <p className="text-sm text-gray-600">Soutien régulier</p>
                          </div>
                        </div>
                      </Card>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {/* Frequency for recurring */}
              {donationType === 'recurring' && (
                <div>
                  <Label className="text-base font-semibold mb-3 block">Fréquence</Label>
                  <RadioGroup value={frequency} onValueChange={(value) => setFrequency(value as any)}>
                    <div className="grid grid-cols-2 gap-4">
                      <label htmlFor="monthly" className="cursor-pointer">
                        <Card className={`p-4 ${frequency === 'monthly' ? 'ring-2 ring-primary' : ''}`}>
                          <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
                          <div className="text-center">
                            <p className="font-semibold">Mensuel</p>
                            <p className="text-sm text-gray-600">Chaque mois</p>
                          </div>
                        </Card>
                      </label>

                      <label htmlFor="yearly" className="cursor-pointer">
                        <Card className={`p-4 ${frequency === 'yearly' ? 'ring-2 ring-primary' : ''}`}>
                          <RadioGroupItem value="yearly" id="yearly" className="sr-only" />
                          <div className="text-center">
                            <p className="font-semibold">Annuel</p>
                            <p className="text-sm text-gray-600">Chaque année</p>
                          </div>
                        </Card>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Amount Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Montant</Label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {predefinedAmounts.map(value => (
                    <Button
                      key={value}
                      variant={amount === value ? 'default' : 'outline'}
                      onClick={() => {
                        setAmount(value);
                        setCustomAmount('');
                      }}
                      className="h-16"
                    >
                      <span className="text-lg font-bold">{value}€</span>
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Autre montant"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount(e.target.value ? Number(e.target.value) : '');
                    }}
                    className="text-lg"
                  />
                  <span className="flex items-center px-4 bg-gray-100 rounded-md font-semibold">
                    EUR
                  </span>
                </div>
              </div>

              {/* User Info (if not logged in) */}
              {!user && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Vos informations</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" placeholder="Votre prénom" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" placeholder="Votre nom" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="votre@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone (optionnel)</Label>
                    <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" />
                  </div>
                </div>
              )}

              {/* Parnass Option */}
              {showParnass && (
                <div className="border-t pt-4">
                  <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Devenez Parnass</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Sponsorisez un jour, un mois ou une année et votre nom sera affiché 
                          en tant que bienfaiteur de la communauté.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab('parnass')}
                        >
                          En savoir plus →
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                className="w-full h-12 text-lg"
                disabled={!amount}
                onClick={handleDonation}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {donationType === 'recurring' 
                  ? `Donner ${amount}€ par ${frequency === 'monthly' ? 'mois' : 'an'}`
                  : `Donner ${amount}€`
                }
              </Button>

              {/* Security Note */}
              <div className="text-center text-sm text-gray-600">
                <p>Paiement 100% sécurisé via Stripe</p>
                <p>Un reçu fiscal vous sera envoyé par email</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="parnass">
          <div className="space-y-6">
            {/* Parnass Info */}
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="text-center">
                <Star className="h-12 w-12 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold mb-2">Devenez Parnass</h2>
                <p className="text-gray-700 max-w-2xl mx-auto">
                  Le système Parnass permet de sponsoriser un jour, un mois ou une année complète. 
                  Votre nom sera affiché comme bienfaiteur principal pendant cette période, 
                  et vous pourrez dédier ce parrainage à la mémoire ou pour le mérite d'un proche.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card className="p-4 text-center">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-bold">Parnass HaYom</h3>
                  <p className="text-sm text-gray-600 mb-2">Sponsor du jour</p>
                  <p className="text-2xl font-bold text-blue-600">100€</p>
                </Card>

                <Card className="p-4 text-center">
                  <CalendarDays className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-bold">Parnass HaChodesh</h3>
                  <p className="text-sm text-gray-600 mb-2">Sponsor du mois</p>
                  <p className="text-2xl font-bold text-purple-600">500€</p>
                </Card>

                <Card className="p-4 text-center">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-bold">Parnass HaShana</h3>
                  <p className="text-sm text-gray-600 mb-2">Sponsor de l'année</p>
                  <p className="text-2xl font-bold text-yellow-600">1800€</p>
                </Card>
              </div>
            </Card>

            {/* Booking Flow */}
            <ParnassBookingFlow />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
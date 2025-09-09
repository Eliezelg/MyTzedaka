'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { 
  CalendarDays, 
  Heart, 
  User, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTenant } from '@/providers/tenant-provider';
import { useAuth } from '@/providers/auth-provider';
import { loadStripe } from '@stripe/stripe-js';
import { HDate } from '@hebcal/core';

interface ParnassBookingFlowProps {
  type?: 'DAILY' | 'MONTHLY' | 'YEARLY';
  preselectedDate?: Date;
  onSuccess?: () => void;
}

interface ParnassPrice {
  daily: number;
  monthly: number;
  yearly: number;
  currency: string;
}

const dedicationTypes = [
  { value: 'IN_MEMORY', label: "À la mémoire de", labelHe: "לעילוי נשמת" },
  { value: 'FOR_HEALING', label: "Pour la guérison de", labelHe: "לרפואה שלמה" },
  { value: 'FOR_SUCCESS', label: "Pour la réussite de", labelHe: "להצלחת" },
  { value: 'IN_HONOR', label: "En l'honneur de", labelHe: "לכבוד" },
  { value: 'FOR_MERIT', label: "Pour le mérite de", labelHe: "לזכות" },
  { value: 'NONE', label: "Sans dédicace", labelHe: "" }
];

export function ParnassBookingFlow({ 
  type: initialType,
  preselectedDate,
  onSuccess 
}: ParnassBookingFlowProps) {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedType, setSelectedType] = useState<'DAILY' | 'MONTHLY' | 'YEARLY'>(initialType || 'DAILY');
  const [selectedDate, setSelectedDate] = useState<Date>(preselectedDate || new Date());
  const [sponsorName, setSponsorName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [dedicationType, setDedicationType] = useState('NONE');
  const [dedicationName, setDedicationName] = useState('');
  const [dedicationNameHebrew, setDedicationNameHebrew] = useState('');
  const [sponsorMessage, setSponsorMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Prices (would be fetched from API)
  const prices: ParnassPrice = {
    daily: 100,
    monthly: 500,
    yearly: 1800,
    currency: 'EUR'
  };

  const getHebrewDate = (date: Date) => {
    const hDate = new HDate(date);
    return hDate.renderGematriya();
  };

  const getPrice = () => {
    switch (selectedType) {
      case 'DAILY':
        return prices.daily;
      case 'MONTHLY':
        return prices.monthly;
      case 'YEARLY':
        return prices.yearly;
      default:
        return 0;
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sites/${tenant.slug}/parnass/check-availability`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: selectedType,
            date: selectedDate.toISOString()
          })
        }
      );

      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    setError(null);

    // Check availability
    const available = await checkAvailability();
    if (!available) {
      setError('Cette date est déjà réservée. Veuillez choisir une autre date.');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create booking
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sites/${tenant.slug}/parnass/book`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: selectedType,
            sponsorDate: selectedDate.toISOString(),
            sponsorName: isAnonymous ? 'Anonyme' : sponsorName,
            isAnonymous,
            dedicationType: dedicationType !== 'NONE' ? dedicationType : null,
            dedicationName: dedicationType !== 'NONE' ? dedicationName : null,
            dedicationNameHebrew: dedicationType !== 'NONE' ? dedicationNameHebrew : null,
            sponsorMessage,
            email,
            phone,
            amount: getPrice()
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la réservation');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) throw new Error('Stripe non disponible');

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) throw stripeError;

    } catch (err) {
      console.error('Payment error:', err);
      setError('Une erreur est survenue lors du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Choisir le type de parrainage</h3>
        <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label htmlFor="daily" className="cursor-pointer">
              <Card className={`p-4 ${selectedType === 'DAILY' ? 'ring-2 ring-primary' : ''}`}>
                <RadioGroupItem value="DAILY" id="daily" className="sr-only" />
                <div className="text-center">
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-bold">Parnass HaYom</h4>
                  <p className="text-sm text-gray-600 font-hebrew">פרנס היום</p>
                  <p className="text-2xl font-bold mt-2">{prices.daily}€</p>
                  <p className="text-xs text-gray-500">Par jour</p>
                </div>
              </Card>
            </label>

            <label htmlFor="monthly" className="cursor-pointer">
              <Card className={`p-4 ${selectedType === 'MONTHLY' ? 'ring-2 ring-primary' : ''}`}>
                <RadioGroupItem value="MONTHLY" id="monthly" className="sr-only" />
                <div className="text-center">
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h4 className="font-bold">Parnass HaChodesh</h4>
                  <p className="text-sm text-gray-600 font-hebrew">פרנס החודש</p>
                  <p className="text-2xl font-bold mt-2">{prices.monthly}€</p>
                  <p className="text-xs text-gray-500">Par mois</p>
                </div>
              </Card>
            </label>

            <label htmlFor="yearly" className="cursor-pointer">
              <Card className={`p-4 ${selectedType === 'YEARLY' ? 'ring-2 ring-primary' : ''}`}>
                <RadioGroupItem value="YEARLY" id="yearly" className="sr-only" />
                <div className="text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <h4 className="font-bold">Parnass HaShana</h4>
                  <p className="text-sm text-gray-600 font-hebrew">פרנס השנה</p>
                  <p className="text-2xl font-bold mt-2">{prices.yearly}€</p>
                  <p className="text-xs text-gray-500">Par année</p>
                </div>
              </Card>
            </label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Choisir la date</h3>
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date()}
            locale={fr}
            className="mx-auto"
          />
          {selectedDate && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Date sélectionnée:</p>
              <p className="font-semibold">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
              <p className="text-sm text-gray-600 font-hebrew">
                {getHebrewDate(selectedDate)}
              </p>
            </div>
          )}
        </Card>
        {error && (
          <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => setStep(2)}
          disabled={!selectedDate || !!error}
        >
          Continuer →
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Informations du sponsor</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="sponsorName">Nom à afficher</Label>
            <Input
              id="sponsorName"
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              placeholder="Votre nom"
              disabled={isAnonymous}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous">Rester anonyme</Label>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Téléphone (optionnel)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Dédicace (optionnel)</h3>
        
        <RadioGroup value={dedicationType} onValueChange={setDedicationType}>
          <div className="space-y-2">
            {dedicationTypes.map(type => (
              <div key={type.value} className="flex items-center gap-2">
                <RadioGroupItem value={type.value} id={type.value} />
                <Label htmlFor={type.value} className="flex-1">
                  {type.label}
                  {type.labelHe && (
                    <span className="ml-2 text-gray-600 font-hebrew">{type.labelHe}</span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {dedicationType !== 'NONE' && (
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="dedicationName">Nom de la personne</Label>
              <Input
                id="dedicationName"
                value={dedicationName}
                onChange={(e) => setDedicationName(e.target.value)}
                placeholder="Nom complet"
              />
            </div>

            <div>
              <Label htmlFor="dedicationNameHebrew">Nom en hébreu (optionnel)</Label>
              <Input
                id="dedicationNameHebrew"
                value={dedicationNameHebrew}
                onChange={(e) => setDedicationNameHebrew(e.target.value)}
                placeholder="שם בעברית"
                className="text-right font-hebrew"
                dir="rtl"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="message">Message (optionnel)</Label>
        <Textarea
          id="message"
          value={sponsorMessage}
          onChange={(e) => setSponsorMessage(e.target.value)}
          placeholder="Votre message sera affiché avec votre parrainage..."
          rows={3}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          ← Retour
        </Button>
        <Button onClick={() => setStep(3)}>
          Continuer →
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Récapitulatif</h3>
        
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Type de parrainage:</span>
              <span className="font-semibold">
                {selectedType === 'DAILY' ? 'Parnass HaYom' :
                 selectedType === 'MONTHLY' ? 'Parnass HaChodesh' :
                 'Parnass HaShana'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">
                {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Sponsor:</span>
              <span className="font-semibold">
                {isAnonymous ? 'Anonyme' : sponsorName}
              </span>
            </div>

            {dedicationType !== 'NONE' && dedicationName && (
              <div className="flex justify-between">
                <span className="text-gray-600">Dédicace:</span>
                <span className="font-semibold">
                  {dedicationTypes.find(t => t.value === dedicationType)?.label} {dedicationName}
                </span>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{getPrice()} {prices.currency}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900">
              Votre parrainage soutient directement les activités de {tenant.name}.
              Un reçu fiscal vous sera envoyé par email.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          ← Retour
        </Button>
        <Button 
          onClick={handlePayment}
          disabled={loading}
          className="min-w-[150px]"
        >
          {loading ? (
            'Traitement...'
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Payer {getPrice()}€
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Type & Date' },
          { num: 2, label: 'Informations' },
          { num: 3, label: 'Paiement' }
        ].map((s, index) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= s.num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > s.num ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                s.num
              )}
            </div>
            <div className="ml-2">
              <p className={`text-sm ${step >= s.num ? 'font-semibold' : 'text-gray-500'}`}>
                {s.label}
              </p>
            </div>
            {index < 2 && (
              <div className={`flex-1 h-1 mx-4 ${
                step > s.num ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Card>
  );
}
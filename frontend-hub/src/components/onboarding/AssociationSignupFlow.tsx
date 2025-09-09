'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Globe,
  CreditCard,
  Check,
  ChevronRight,
  Info,
  Sparkles,
  Shield,
  Zap,
  Users,
  Heart,
  Star
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

interface AssociationSignupFlowProps {
  mode?: 'standalone' | 'embedded'; // standalone for main signup, embedded for hub
  onSuccess?: (data: any) => void;
  defaultPlan?: 'free' | 'premium';
}

interface FormData {
  // Association Info
  associationName: string;
  associationSlug: string;
  associationType: string;
  registrationNumber: string;
  description: string;
  
  // Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  
  // Contact Person
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  
  // Plan Selection
  plan: 'free' | 'premium';
  billingCycle?: 'monthly' | 'yearly';
  
  // Settings
  customDomain?: string;
  acceptTerms: boolean;
  acceptPayment: boolean;
}

const planFeatures = {
  free: {
    name: 'Gratuit - Plateforme',
    price: 0,
    description: 'Inscription gratuite sur la plateforme MyTzedaka',
    features: [
      'Page sur la plateforme MyTzedaka',
      'Collecte de dons en ligne',
      'Gestion des donateurs',
      'Reçus fiscaux automatiques',
      'Commission de 5% sur les dons',
      'Support par email'
    ],
    limitations: [
      'Pas de site personnalisé',
      'URL: mytzedaka.com/associations/votre-nom',
      'Personnalisation limitée',
      'Modules de base uniquement'
    ]
  },
  premium: {
    name: 'Premium - Site Custom',
    price: 10,
    yearlyPrice: 100,
    description: 'Site web personnalisé pour votre association',
    features: [
      '✨ Site web personnalisé complet',
      '🌐 Domaine personnalisé (votre-asso.com)',
      '🎨 Thème entièrement personnalisable',
      '📱 Tous les modules disponibles',
      '🔧 Gestion complète du contenu',
      '📊 Statistiques avancées',
      '⚡ Support prioritaire',
      '🎯 Aucune commission sur les dons',
      '🛡️ SSL et sécurité inclus',
      '📧 Emails personnalisés'
    ],
    limitations: []
  }
};

export function AssociationSignupFlow({ 
  mode = 'standalone',
  onSuccess,
  defaultPlan = 'free'
}: AssociationSignupFlowProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    associationName: '',
    associationSlug: '',
    associationType: 'SYNAGOGUE',
    registrationNumber: '',
    description: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'FR',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'PRESIDENT',
    plan: defaultPlan,
    billingCycle: 'monthly',
    customDomain: '',
    acceptTerms: false,
    acceptPayment: false
  });

  const totalSteps = mode === 'standalone' ? 5 : 3;

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleAssociationNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      associationName: name,
      associationSlug: generateSlug(name)
    }));
  };

  const checkSlugAvailability = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/associations/check-slug?slug=${formData.associationSlug}`
      );
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking slug:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create association
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/associations/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'association');
      }

      const result = await response.json();

      // Step 2: Handle payment for premium plan
      if (formData.plan === 'premium') {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (!stripe) throw new Error('Stripe non disponible');

        // Create checkout session
        const checkoutResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/associations/create-checkout`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              associationId: result.associationId,
              plan: formData.plan,
              billingCycle: formData.billingCycle
            })
          }
        );

        const { sessionId } = await checkoutResponse.json();
        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
        
        if (stripeError) throw stripeError;
      } else {
        // Free plan - direct success
        if (onSuccess) {
          onSuccess(result);
        } else {
          window.location.href = `/sites/${formData.associationSlug}/admin`;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const renderPlanSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Choisissez votre formule</h2>
        <p className="text-gray-600">
          Commencez gratuitement ou optez pour un site personnalisé
        </p>
      </div>

      <RadioGroup 
        value={formData.plan} 
        onValueChange={(value) => setFormData(prev => ({ ...prev, plan: value as 'free' | 'premium' }))}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <label htmlFor="free" className="cursor-pointer">
            <Card className={`p-6 h-full ${formData.plan === 'free' ? 'ring-2 ring-primary' : ''}`}>
              <RadioGroupItem value="free" id="free" className="sr-only" />
              
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary">Gratuit</Badge>
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{planFeatures.free.name}</h3>
              <p className="text-3xl font-bold mb-4">
                0€
                <span className="text-sm font-normal text-gray-600">/mois</span>
              </p>
              
              <p className="text-sm text-gray-600 mb-4">
                {planFeatures.free.description}
              </p>
              
              <div className="space-y-2 mb-4">
                {planFeatures.free.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              {planFeatures.free.limitations.length > 0 && (
                <div className="pt-4 border-t space-y-2">
                  {planFeatures.free.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </label>

          {/* Premium Plan */}
          <label htmlFor="premium" className="cursor-pointer">
            <Card className={`p-6 h-full relative ${formData.plan === 'premium' ? 'ring-2 ring-primary' : ''}`}>
              <RadioGroupItem value="premium" id="premium" className="sr-only" />
              
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Recommandé
                </Badge>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <Badge variant="default">Premium</Badge>
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{planFeatures.premium.name}</h3>
              
              {formData.plan === 'premium' && (
                <div className="flex gap-2 mb-2">
                  <Button
                    size="sm"
                    variant={formData.billingCycle === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, billingCycle: 'monthly' }))}
                  >
                    Mensuel
                  </Button>
                  <Button
                    size="sm"
                    variant={formData.billingCycle === 'yearly' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, billingCycle: 'yearly' }))}
                  >
                    Annuel (-17%)
                  </Button>
                </div>
              )}
              
              <p className="text-3xl font-bold mb-4">
                {formData.billingCycle === 'yearly' ? (
                  <>
                    100€
                    <span className="text-sm font-normal text-gray-600">/an</span>
                    <span className="ml-2 text-sm line-through text-gray-400">120€</span>
                  </>
                ) : (
                  <>
                    10€
                    <span className="text-sm font-normal text-gray-600">/mois</span>
                  </>
                )}
              </p>
              
              <p className="text-sm text-gray-600 mb-4">
                {planFeatures.premium.description}
              </p>
              
              <div className="space-y-2">
                {planFeatures.premium.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </label>
        </div>
      </RadioGroup>

      {formData.plan === 'premium' && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Essai gratuit de 30 jours</p>
              <p className="text-sm text-blue-700">
                Testez toutes les fonctionnalités premium sans engagement. 
                Annulation possible à tout moment.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderAssociationInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Informations de l'association</h2>
        <p className="text-gray-600">
          Renseignez les informations officielles de votre association
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="associationName">Nom de l'association *</Label>
          <Input
            id="associationName"
            value={formData.associationName}
            onChange={(e) => handleAssociationNameChange(e.target.value)}
            placeholder="Ex: Synagogue Beth Shalom"
            required
          />
        </div>

        <div>
          <Label htmlFor="associationSlug">URL personnalisée *</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {formData.plan === 'premium' ? 'votre-site.com' : 'mytzedaka.com/'}
            </span>
            <Input
              id="associationSlug"
              value={formData.associationSlug}
              onChange={(e) => setFormData(prev => ({ ...prev, associationSlug: e.target.value }))}
              placeholder="beth-shalom"
              className="flex-1"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="associationType">Type d'association *</Label>
          <select
            id="associationType"
            value={formData.associationType}
            onChange={(e) => setFormData(prev => ({ ...prev, associationType: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="SYNAGOGUE">Synagogue</option>
            <option value="YESHIVA">Yeshiva / École</option>
            <option value="CHARITY">Association caritative</option>
            <option value="COMMUNITY">Centre communautaire</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>

        <div>
          <Label htmlFor="registrationNumber">Numéro d'enregistrement (RNA/SIRET)</Label>
          <Input
            id="registrationNumber"
            value={formData.registrationNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
            placeholder="W123456789"
          />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Décrivez brièvement votre association et ses activités..."
            rows={4}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderAddress = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Adresse de l'association</h2>
        <p className="text-gray-600">
          Adresse officielle pour les reçus fiscaux
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="addressLine1">Adresse *</Label>
          <Input
            id="addressLine1"
            value={formData.addressLine1}
            onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
            placeholder="123 rue de la Paix"
            required
          />
        </div>

        <div>
          <Label htmlFor="addressLine2">Complément d'adresse</Label>
          <Input
            id="addressLine2"
            value={formData.addressLine2}
            onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
            placeholder="Bâtiment A, Appartement 2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postalCode">Code postal *</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
              placeholder="75001"
              required
            />
          </div>

          <div>
            <Label htmlFor="city">Ville *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Paris"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="country">Pays *</Label>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="FR">France</option>
            <option value="IL">Israël</option>
            <option value="US">États-Unis</option>
            <option value="BE">Belgique</option>
            <option value="CH">Suisse</option>
            <option value="CA">Canada</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Responsable de l'association</h2>
        <p className="text-gray-600">
          Personne qui gérera le compte
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="David"
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Cohen"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="contact@association.org"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+33 6 12 34 56 78"
            required
          />
        </div>

        <div>
          <Label htmlFor="role">Fonction *</Label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="PRESIDENT">Président</option>
            <option value="TREASURER">Trésorier</option>
            <option value="SECRETARY">Secrétaire</option>
            <option value="DIRECTOR">Directeur</option>
            <option value="RABBI">Rabbin</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Récapitulatif</h2>
        <p className="text-gray-600">
          Vérifiez vos informations avant de finaliser
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Association</h3>
          <p>{formData.associationName}</p>
          <p className="text-sm text-gray-600">{formData.description}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Adresse</h3>
          <p className="text-sm">
            {formData.addressLine1}<br />
            {formData.addressLine2 && <>{formData.addressLine2}<br /></>}
            {formData.postalCode} {formData.city}<br />
            {formData.country}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Responsable</h3>
          <p className="text-sm">
            {formData.firstName} {formData.lastName}<br />
            {formData.email}<br />
            {formData.phone}
          </p>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-2">Formule choisie</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {formData.plan === 'premium' ? 'Premium - Site Custom' : 'Gratuit - Plateforme'}
              </p>
              {formData.plan === 'premium' && (
                <p className="text-sm text-gray-600">
                  Facturation {formData.billingCycle === 'monthly' ? 'mensuelle' : 'annuelle'}
                </p>
              )}
            </div>
            <p className="text-2xl font-bold">
              {formData.plan === 'premium' ? (
                formData.billingCycle === 'monthly' ? '10€/mois' : '100€/an'
              ) : (
                'Gratuit'
              )}
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))}
          />
          <Label htmlFor="terms" className="text-sm cursor-pointer">
            J'accepte les conditions générales d'utilisation et la politique de confidentialité
          </Label>
        </div>

        {formData.plan === 'premium' && (
          <div className="flex items-start gap-2">
            <Checkbox
              id="payment"
              checked={formData.acceptPayment}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptPayment: checked as boolean }))}
            />
            <Label htmlFor="payment" className="text-sm cursor-pointer">
              J'autorise le prélèvement automatique de {formData.billingCycle === 'monthly' ? '10€/mois' : '100€/an'}
            </Label>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    if (mode === 'embedded') {
      // Simplified flow for hub integration
      switch (step) {
        case 1:
          return renderAssociationInfo();
        case 2:
          return renderContactInfo();
        case 3:
          return renderSummary();
        default:
          return null;
      }
    }

    // Full flow for standalone signup
    switch (step) {
      case 1:
        return renderPlanSelection();
      case 2:
        return renderAssociationInfo();
      case 3:
        return renderAddress();
      case 4:
        return renderContactInfo();
      case 5:
        return renderSummary();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return mode === 'embedded' ? formData.associationName && formData.description : true;
      case 2:
        return mode === 'embedded' ? 
          formData.firstName && formData.lastName && formData.email :
          formData.associationName && formData.description;
      case 3:
        return mode === 'embedded' ?
          formData.acceptTerms :
          formData.addressLine1 && formData.city && formData.postalCode;
      case 4:
        return formData.firstName && formData.lastName && formData.email;
      case 5:
        return formData.acceptTerms && (formData.plan === 'free' || formData.acceptPayment);
      default:
        return false;
    }
  };

  return (
    <div className={mode === 'standalone' ? 'max-w-3xl mx-auto p-6' : ''}>
      {mode === 'standalone' && (
        <div className="mb-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s, index) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className={mode === 'standalone' ? 'p-8' : 'p-6'}>
        {renderStep()}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              ← Retour
            </Button>
          )}
          
          <div className="ml-auto">
            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Continuer
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
              >
                {loading ? (
                  'Création en cours...'
                ) : formData.plan === 'premium' ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Procéder au paiement
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Créer mon association
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
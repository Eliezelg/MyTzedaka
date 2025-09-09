'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, CreditCard, Check, ArrowLeft, ArrowRight,
  Gift, Users, Trophy, Zap, Shield, Lock,
  Mail, Phone, MapPin, Calendar, Info,
  Star, TrendingUp, Award, Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonationFlowProps {
  associationId: string;
  associationName: string;
  associationLogo?: string;
  campaignId?: string;
  campaignTitle?: string;
  campaignGoal?: number;
  campaignRaised?: number;
  onSuccess?: (donation: any) => void;
  onCancel?: () => void;
}

const ModernDonationFlow: React.FC<DonationFlowProps> = ({
  associationId,
  associationName,
  associationLogo,
  campaignId,
  campaignTitle,
  campaignGoal,
  campaignRaised,
  onSuccess,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    message: '',
    newsletter: true,
    taxReceipt: true
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const suggestedAmounts = [10, 25, 50, 100, 250, 500];
  
  const impactExamples = {
    10: "Fournit des fournitures scolaires pour un enfant",
    25: "Offre un repas chaud à 5 personnes",
    50: "Finance une heure de soutien scolaire",
    100: "Couvre les frais médicaux d'urgence",
    250: "Soutient une famille pendant une semaine",
    500: "Finance un projet communautaire complet"
  };

  const getTotalAmount = () => {
    if (customAmount) return parseFloat(customAmount);
    return selectedAmount || 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
  };

  const validateStep = (step: number) => {
    const newErrors: any = {};
    
    if (step === 1) {
      if (!selectedAmount && !customAmount) {
        newErrors.amount = "Veuillez sélectionner un montant";
      }
      if (customAmount && (parseFloat(customAmount) < 1 || isNaN(parseFloat(customAmount)))) {
        newErrors.amount = "Le montant minimum est de 1€";
      }
    }
    
    if (step === 2 && !isAnonymous) {
      if (!formData.firstName) newErrors.firstName = "Prénom requis";
      if (!formData.lastName) newErrors.lastName = "Nom requis";
      if (!formData.email) newErrors.email = "Email requis";
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email invalide";
      }
    }
    
    if (step === 3) {
      if (!paymentData.cardNumber) newErrors.cardNumber = "Numéro de carte requis";
      if (!paymentData.cardName) newErrors.cardName = "Nom du titulaire requis";
      if (!paymentData.expiryDate) newErrors.expiryDate = "Date d'expiration requise";
      if (!paymentData.cvv) newErrors.cvv = "CVV requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Trigger success animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    const donationData = {
      amount: getTotalAmount(),
      frequency,
      associationId,
      campaignId,
      donor: isAnonymous ? null : formData,
      message: formData.message,
      timestamp: new Date().toISOString()
    };
    
    setProcessing(false);
    setCurrentStep(4); // Success step
    
    if (onSuccess) {
      onSuccess(donationData);
    }
  };

  const progressPercentage = campaignGoal && campaignRaised 
    ? ((campaignRaised + getTotalAmount()) / campaignGoal) * 100
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300
                ${currentStep >= step 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
                ${currentStep === step ? 'ring-4 ring-purple-200' : ''}
              `}>
                {currentStep > step ? <Check className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                  currentStep > step ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm">
          <span className={currentStep >= 1 ? 'text-purple-600 font-semibold' : 'text-gray-500'}>
            Montant
          </span>
          <span className={currentStep >= 2 ? 'text-purple-600 font-semibold' : 'text-gray-500'}>
            Informations
          </span>
          <span className={currentStep >= 3 ? 'text-purple-600 font-semibold' : 'text-gray-500'}>
            Paiement
          </span>
        </div>
      </div>

      {/* Association Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          {associationLogo ? (
            <img src={associationLogo} alt={associationName} className="w-16 h-16 rounded-xl object-cover" />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Faire un don à {associationName}</h2>
            {campaignTitle && (
              <p className="text-sm text-gray-600 mt-1">Campagne: {campaignTitle}</p>
            )}
          </div>
          {campaignGoal && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Objectif</p>
              <p className="text-xl font-bold text-purple-600">€{campaignGoal.toLocaleString()}</p>
              <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Amount Selection */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Frequency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de don
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFrequency('once')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    frequency === 'once'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Gift className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Don unique</p>
                  <p className="text-xs text-gray-500 mt-1">Contribution ponctuelle</p>
                </button>
                <button
                  onClick={() => setFrequency('monthly')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    frequency === 'monthly'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Don mensuel</p>
                  <p className="text-xs text-gray-500 mt-1">Impact régulier</p>
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choisir un montant
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {suggestedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                      setShowImpact(true);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group ${
                      selectedAmount === amount
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="relative z-10">
                      <p className="text-2xl font-bold text-gray-900">€{amount}</p>
                      {frequency === 'monthly' && (
                        <p className="text-xs text-gray-500">/mois</p>
                      )}
                    </div>
                    {amount === 100 && (
                      <div className="absolute top-1 right-1">
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                          Populaire
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="relative">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                    setShowImpact(false);
                  }}
                  placeholder="Autre montant..."
                  className={`w-full px-4 py-3 pl-10 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                    errors.amount ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Impact Preview */}
            {showImpact && selectedAmount && impactExamples[selectedAmount] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
              >
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Votre impact</p>
                    <p className="text-sm text-green-700 mt-1">
                      {impactExamples[selectedAmount]}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Anonymous Option */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="anonymous" className="flex-1 cursor-pointer">
                <p className="font-medium text-gray-900">Faire un don anonyme</p>
                <p className="text-sm text-gray-500">Votre nom ne sera pas affiché publiquement</p>
              </label>
            </div>
          </motion.div>
        )}

        {/* Step 2: Donor Information */}
        {currentStep === 2 && !isAnonymous && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-4 py-3 pl-10 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optionnel)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={3}
                placeholder="Laissez un message d'encouragement..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={formData.newsletter}
                  onChange={(e) => setFormData({...formData, newsletter: e.target.checked})}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="newsletter" className="text-sm text-gray-700 cursor-pointer">
                  Je souhaite recevoir les actualités de l'association
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="taxReceipt"
                  checked={formData.taxReceipt}
                  onChange={(e) => setFormData({...formData, taxReceipt: e.target.checked})}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="taxReceipt" className="text-sm text-gray-700 cursor-pointer">
                  Je souhaite recevoir un reçu fiscal
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Payment Security Badge */}
            <div className="flex items-center justify-center gap-3 p-3 bg-green-50 rounded-xl">
              <Shield className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Paiement 100% sécurisé avec cryptage SSL
              </p>
              <Lock className="w-4 h-4 text-green-600" />
            </div>

            {/* Card Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de carte *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({
                    ...paymentData, 
                    cardNumber: formatCardNumber(e.target.value)
                  })}
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full px-4 py-3 pl-10 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.cardNumber ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du titulaire *
              </label>
              <input
                type="text"
                value={paymentData.cardName}
                onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                placeholder="Jean Dupont"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.cardName ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.cardName && (
                <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'expiration *
                </label>
                <input
                  type="text"
                  value={paymentData.expiryDate}
                  onChange={(e) => setPaymentData({
                    ...paymentData, 
                    expiryDate: formatExpiryDate(e.target.value)
                  })}
                  maxLength={5}
                  placeholder="MM/AA"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                  maxLength={3}
                  placeholder="123"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.cvv ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.cvv && (
                  <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>

            {/* Save Card Option */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="saveCard"
                checked={paymentData.saveCard}
                onChange={(e) => setPaymentData({...paymentData, saveCard: e.target.checked})}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="saveCard" className="text-sm text-gray-700 cursor-pointer">
                Sauvegarder cette carte pour mes prochains dons
              </label>
            </div>

            {/* Summary */}
            <div className="p-4 bg-purple-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Résumé de votre don</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant du don</span>
                  <span className="font-medium">€{getTotalAmount()}</span>
                </div>
                {frequency === 'monthly' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fréquence</span>
                    <span className="font-medium">Mensuel</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-purple-600">
                      €{getTotalAmount()}
                      {frequency === 'monthly' && <span className="text-sm font-normal">/mois</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Merci pour votre générosité !
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Votre don de <span className="font-bold text-purple-600">€{getTotalAmount()}</span> a été traité avec succès.
            </p>
            
            <div className="max-w-md mx-auto space-y-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <Mail className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-gray-700">
                  Un email de confirmation a été envoyé à {formData.email || 'votre adresse'}
                </p>
              </div>
              
              {formData.taxReceipt && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Award className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-700">
                    Votre reçu fiscal sera disponible dans votre espace donateur
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <p className="text-sm text-gray-700">
                  Vous contribuez à changer des vies !
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-300"
                >
                  Retour à l'accueil
                </button>
                <button
                  onClick={() => window.location.href = '/donations'}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Voir mes dons
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={currentStep === 1 ? onCancel : handleBack}
              className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {currentStep === 1 ? 'Annuler' : 'Retour'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={processing}
              className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 ${
                processing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Traitement...
                </>
              ) : currentStep === 3 ? (
                <>
                  <Lock className="w-5 h-5" />
                  Confirmer le don de €{getTotalAmount()}
                </>
              ) : (
                <>
                  Continuer
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

export default ModernDonationFlow;
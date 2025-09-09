'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Eye, EyeOff, CheckCircle, Building2, User, Mail, Lock, Phone, Globe, FileText, MapPin, Sparkles, AlertCircle, Check, X } from 'lucide-react'
import { useAuthContext } from '@/hooks/useAuthContext'
import { apiClient } from '@/lib/api-client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/useDebounce'

interface FormData {
  // User data
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  
  // Plan choice
  plan: 'free' | 'premium'
  
  // Association data (only for premium)
  associationName: string
  associationSlug: string // Sera utilisé comme slug ET sous-domaine
  associationType: string
  associationDescription: string
  associationAddress: string
  associationCity: string
  associationPostalCode: string
  associationCountry: string
  associationPhone: string
  associationEmail: string
  associationWebsite: string
  acceptTerms: boolean
  acceptAssociationTerms: boolean
}

export default function CompleteSignupPage() {
  const { register } = useAuthContext()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    plan: 'free',
    associationName: '',
    associationSlug: '',
    associationType: 'SYNAGOGUE',
    associationDescription: '',
    associationAddress: '',
    associationCity: '',
    associationPostalCode: '',
    associationCountry: 'FR',
    associationPhone: '',
    associationEmail: '',
    associationWebsite: '',
    acceptTerms: false,
    acceptAssociationTerms: false
  })

  const debouncedSlug = useDebounce(formData.associationSlug, 500)

  // Check slug availability (utilisé pour slug ET sous-domaine)
  useEffect(() => {
    // Ne vérifier que si on est à l'étape 3 (création d'association)
    if (step === 3 && debouncedSlug && debouncedSlug.length > 2) {
      setCheckingSlug(true)
      apiClient.get(`/api/tenant/check-availability/${debouncedSlug}`)
        .then(({ data }) => {
          setSlugAvailable(data.available)
        })
        .catch(() => {
          setSlugAvailable(null)
        })
        .finally(() => {
          setCheckingSlug(false)
        })
    } else if (step === 3) {
      // Si on est à l'étape 3 mais que le slug est vide ou trop court
      setSlugAvailable(null)
    }
  }, [debouncedSlug, step]) // Ajouter step comme dépendance

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // Auto-generate slug from association name
    if (name === 'associationName') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({
        ...prev,
        associationSlug: slug
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }))
  }

  const validateStep1 = () => {
    const { email, password, confirmPassword, firstName, lastName } = formData
    
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      return false
    }
    
    if (password !== confirmPassword) {
      return false
    }
    
    if (password.length < 8) {
      return false
    }

    if (!formData.acceptTerms) {
      return false
    }
    
    return true
  }

  const validateStep2 = () => {
    // L'étape 2 est juste le choix du plan, toujours valide si un plan est sélectionné
    return formData.plan === 'free' || formData.plan === 'premium'
  }

  const validateStep3 = () => {
    const { associationName, associationSlug, associationCity, associationPostalCode } = formData
    
    if (!associationName || !associationSlug || !associationCity || !associationPostalCode) {
      return false
    }

    if (!formData.acceptAssociationTerms) {
      return false
    }

    // Check if slug is available
    if (slugAvailable === false) {
      return false
    }
    
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2) {
      // Si plan gratuit, on passe directement à la création du compte
      if (formData.plan === 'free') {
        handleSubmit(new Event('submit') as any)
      } else {
        // Si plan premium, on va à l'étape 3 pour créer l'association
        setStep(3)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Si plan premium, vérifier l'étape 3
    if (formData.plan === 'premium' && !validateStep3()) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      let response;
      
      if (formData.plan === 'free') {
        // Plan gratuit : créer seulement l'utilisateur pour le hub
        response = await apiClient.post('/api/auth/register-hub', {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
        })
        
        // Sauvegarder les tokens
        if (response.tokens) {
          localStorage.setItem('auth_token', response.tokens.accessToken)
          localStorage.setItem('refresh_token', response.tokens.refreshToken)
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        
        // Redirection vers le hub
        router.push('/associations')
        
      } else {
        // Plan premium : créer l'utilisateur ET l'association
        const requestData = {
          user: {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || undefined,
          },
          association: {
            name: formData.associationName,
            slug: formData.associationSlug,
            domain: `${formData.associationSlug}.mytzedaka.com`,
            type: formData.associationType,
            description: formData.associationDescription,
            plan: 'PREMIUM', // Ajouter le plan
            address: {
              street: formData.associationAddress,
              city: formData.associationCity,
              postalCode: formData.associationPostalCode,
              country: formData.associationCountry
            },
            contact: {
              phone: formData.associationPhone,
              email: formData.associationEmail || formData.email,
              website: formData.associationWebsite
            },
            settings: {
              language: 'fr',
              timezone: 'Europe/Paris',
              currency: 'EUR',
              plan: 'PREMIUM',
              features: {
                donations: true,
                campaigns: true,
                events: true,
                gmah: formData.associationType === 'SYNAGOGUE',
                customSite: true
              }
            }
          }
        }
        
        response = await apiClient.post('/api/auth/register-with-association', requestData)
        
        // Sauvegarder les tokens
        if (response.tokens) {
          localStorage.setItem('auth_token', response.tokens.accessToken)
          localStorage.setItem('refresh_token', response.tokens.refreshToken)
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        
        // Redirection vers le site de l'association
        router.push(`/sites/${response.tenant.slug}/admin`)
      }
      
    } catch (err: any) {
      console.error('Erreur:', err)
      
      // Gérer les erreurs spécifiques
      if (err.message?.includes('email existe déjà')) {
        setError('Un compte existe déjà avec cet email. Veuillez vous connecter ou utiliser un autre email.')
        // Revenir à l'étape 1 pour changer l'email
        setStep(1)
      } else if (err.message?.includes('identifiant d\'association') || err.message?.includes('Unique constraint failed') || err.message?.includes('slug')) {
        setError('Cet identifiant d\'association est déjà utilisé. Veuillez en choisir un autre.')
        // Marquer le slug comme non disponible
        setSlugAvailable(false)
      } else if (err.message?.includes('Internal server error')) {
        setError('Une erreur est survenue. Veuillez vérifier vos informations et réessayer.')
      } else {
        setError(err.message || 'Une erreur est survenue lors de la création')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">MyTzedaka</h1>
          <p className="mt-2 text-lg text-gray-600">Créez votre compte et votre association en quelques minutes</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && '👤 Créez votre compte personnel'}
              {step === 2 && '💳 Choisissez votre plan'}
              {step === 3 && '🏛️ Créez votre association'}
            </CardTitle>
            <CardDescription>
              Étape {step} sur {formData.plan === 'premium' ? '3' : '2'}
            </CardDescription>
            <div className="flex space-x-2 mt-4">
              <div className={`h-2 rounded-full flex-1 transition-all ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <div className={`h-2 rounded-full flex-1 transition-all ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              {formData.plan === 'premium' && (
                <div className={`h-2 rounded-full flex-1 transition-all ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="pl-10"
                          placeholder="Jean"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="pl-10"
                          placeholder="Dupont"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="pl-10"
                        placeholder="jean.dupont@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="pl-10 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Minimum 8 caractères</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="pl-10 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleCheckboxChange('acceptTerms', checked as boolean)}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                      J'accepte les{' '}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        politique de confidentialité
                      </Link>
                    </Label>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full"
                    disabled={!validateStep1()}
                  >
                    Continuer vers la création d'association
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-center mb-6">Choisissez votre plan</h3>
                    
                    {/* Plan Gratuit */}
                    <div 
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        formData.plan === 'free' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, plan: 'free' }))}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="plan"
                          value="free"
                          checked={formData.plan === 'free'}
                          onChange={() => setFormData(prev => ({ ...prev, plan: 'free' }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-bold">Plan Gratuit</h4>
                            <span className="text-2xl font-bold text-green-600">0€</span>
                          </div>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              Page sur le Hub MyTzedaka
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              Collecte de dons sécurisée
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              Reçus fiscaux automatiques
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              Commission : 1% + frais bancaires
                            </li>
                            <li className="flex items-center gap-2">
                              <X className="h-4 w-4 text-red-500" />
                              <span className="line-through">Site web personnalisé</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Plan Premium */}
                    <div 
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all relative ${
                        formData.plan === 'premium' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, plan: 'premium' }))}
                    >
                      <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-purple-600 to-pink-600">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Recommandé
                      </Badge>
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="plan"
                          value="premium"
                          checked={formData.plan === 'premium'}
                          onChange={() => setFormData(prev => ({ ...prev, plan: 'premium' }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-bold">Plan Premium</h4>
                            <div>
                              <span className="text-2xl font-bold text-purple-600">10€</span>
                              <span className="text-sm text-gray-500">/mois</span>
                            </div>
                          </div>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              <strong>Site web personnalisé</strong>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              Sous-domaine personnalisé (association.mytzedaka.com)
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              Page sur le Hub MyTzedaka
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              Collecte de dons sécurisée
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              Reçus fiscaux automatiques
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              Gestion complète des donateurs
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              Commission : 1% + frais bancaires
                            </li>
                            <li className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-purple-500" />
                              <strong>Option domaine personnalisé (ex: votre-asso.org)</strong>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full mt-6"
                    disabled={!validateStep2()}
                  >
                    {formData.plan === 'free' ? 'Créer mon compte gratuit' : 'Continuer vers la création du site'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-full"
                  >
                    Retour
                  </Button>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-purple-800 font-semibold">Plan Premium - Site web personnalisé</p>
                        <p className="text-xs text-purple-700 mt-1">
                          Abonnement : <strong>10€/mois</strong> + commission de <strong>1%</strong> + frais bancaires
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          ✨ Votre propre site web avec sous-domaine personnalisé
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="associationName">Nom de l'association *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="associationName"
                        name="associationName"
                        value={formData.associationName}
                        onChange={handleInputChange}
                        required
                        className="pl-10"
                        placeholder="Communauté Beth Shalom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="associationSlug">Identifiant unique de votre association *</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="associationSlug"
                        name="associationSlug"
                        value={formData.associationSlug}
                        onChange={handleInputChange}
                        required
                        className={`pl-10 pr-10 ${
                          slugAvailable === false ? 'border-red-500' : 
                          slugAvailable === true ? 'border-green-500' : ''
                        }`}
                        placeholder="beth-shalom"
                        pattern="^[a-z0-9-]+$"
                        title="Uniquement lettres minuscules, chiffres et tirets"
                      />
                      {checkingSlug && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                      )}
                      {!checkingSlug && slugAvailable === true && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                      {!checkingSlug && slugAvailable === false && (
                        <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Votre site sera accessible via :</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          <code className="bg-white px-2 py-0.5 rounded border">
                            {formData.associationSlug || 'identifiant'}.mytzedaka.com
                          </code>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          <code className="bg-white px-2 py-0.5 rounded border">
                            mytzedaka.com/sites/{formData.associationSlug || 'identifiant'}
                          </code>
                        </li>
                      </ul>
                    </div>
                    
                    {slugAvailable === false && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-red-700 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <strong>Cet identifiant est déjà utilisé !</strong>
                        </p>
                        <p className="text-xs text-red-600 mt-1 ml-6">
                          Veuillez choisir un autre identifiant pour votre association.
                        </p>
                      </div>
                    )}
                    
                    {slugAvailable === true && formData.associationSlug.length > 2 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          <strong>Cet identifiant est disponible !</strong>
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        <strong>💎 Plan Premium :</strong> Utilisez votre propre nom de domaine (ex: www.votre-association.org)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="associationType">Type d'association *</Label>
                    <Select 
                      value={formData.associationType}
                      onValueChange={(value) => handleSelectChange('associationType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SYNAGOGUE">Synagogue</SelectItem>
                        <SelectItem value="YESHIVA">Yeshiva</SelectItem>
                        <SelectItem value="SEMINAIRE">Séminaire</SelectItem>
                        <SelectItem value="ECOLE">École</SelectItem>
                        <SelectItem value="KOUPAT_TZEDAKA">Koupat Tzedaka</SelectItem>
                        <SelectItem value="GMAH">Gmah</SelectItem>
                        <SelectItem value="MIKVE">Mikvé</SelectItem>
                        <SelectItem value="ASSOCIATION">Association caritative</SelectItem>
                        <SelectItem value="AUTRE">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="associationDescription">Description</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="associationDescription"
                        name="associationDescription"
                        value={formData.associationDescription}
                        onChange={handleInputChange}
                        className="pl-10 min-h-[100px]"
                        placeholder="Décrivez votre association et ses missions..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="associationCity">Ville *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="associationCity"
                          name="associationCity"
                          value={formData.associationCity}
                          onChange={handleInputChange}
                          required
                          className="pl-10"
                          placeholder="Paris"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="associationPostalCode">Code postal *</Label>
                      <Input
                        id="associationPostalCode"
                        name="associationPostalCode"
                        value={formData.associationPostalCode}
                        onChange={handleInputChange}
                        required
                        placeholder="75001"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="associationEmail">Email de contact</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="associationEmail"
                        name="associationEmail"
                        type="email"
                        value={formData.associationEmail}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="contact@association.fr"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Laissez vide pour utiliser votre email personnel
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="acceptAssociationTerms"
                      checked={formData.acceptAssociationTerms}
                      onCheckedChange={(checked) => handleCheckboxChange('acceptAssociationTerms', checked as boolean)}
                    />
                    <Label htmlFor="acceptAssociationTerms" className="text-sm cursor-pointer">
                      Je certifie être habilité à créer ce compte au nom de l'association
                    </Label>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                      disabled={loading}
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loading || !validateStep2()}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création en cours...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Créer mon compte et mon association
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              <div className="text-center pt-4 border-t">
                <span className="text-sm text-gray-600">
                  Déjà inscrit ?{' '}
                  <Link 
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Se connecter
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
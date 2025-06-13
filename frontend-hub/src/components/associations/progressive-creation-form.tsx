'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  Globe,
  Users,
  Settings,
  FileText,
  Star,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

import type { 
  MinimalAssociationInfo,
  ExtendedContactInfo,
  DetailedMissionInfo,
  GovernanceInfo,
  FullProfileInfo,
  CompletionStep,
  AssociationCategory,
  CompletionLevel,
  CountrySpecificLegalInfo
} from '@/types/association-creation'
import { COUNTRIES, CATEGORIES } from '@/types/association-creation'
import { useCreateAssociation } from '@/lib/services/associations-service'

interface ProgressiveCreationFormProps {
  onComplete?: (data: any) => void
}

export default function ProgressiveCreationForm({ onComplete }: ProgressiveCreationFormProps) {
  const router = useRouter()
  const createAssociation = useCreateAssociation()
  
  // États principaux
  const [currentStep, setCurrentStep] = useState<CompletionLevel>(1)
  const [completedSteps, setCompletedSteps] = useState<Set<CompletionLevel>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // États des données
  const [basicInfo, setBasicInfo] = useState<Partial<MinimalAssociationInfo>>({
    country: '',
    category: 'GENERAL',
    termsAccepted: false,
    dataProtectionCompliance: false
  })
  const [extendedContact, setExtendedContact] = useState<Partial<ExtendedContactInfo>>({})
  const [detailedMission, setDetailedMission] = useState<Partial<DetailedMissionInfo>>({
    objectives: [],
    targetAudience: [],
    actionAreas: [],
    mainActivities: []
  })
  const [governance, setGovernance] = useState<Partial<GovernanceInfo>>({
    boardMembers: [],
    hasGeneralAssembly: false
  })
  const [fullProfile, setFullProfile] = useState<Partial<FullProfileInfo>>({})
  const [countrySpecific, setCountrySpecific] = useState<Partial<CountrySpecificLegalInfo>>({})

  // Configuration des étapes
  const steps: CompletionStep[] = [
    {
      level: 1,
      title: "Informations essentielles",
      description: "Les informations de base pour créer votre association",
      required: true,
      completed: completedSteps.has(1),
      fields: ['name', 'email', 'country', 'category', 'shortDescription'],
      estimatedTime: "2 min"
    },
    {
      level: 2,
      title: "Contact et présence",
      description: "Coordonnées complètes et présence en ligne",
      required: false,
      completed: completedSteps.has(2),
      fields: ['phone', 'website', 'address', 'socialMedia'],
      estimatedTime: "3 min"
    },
    {
      level: 3,
      title: "Mission et objectifs",
      description: "Description détaillée de votre mission",
      required: false,
      completed: completedSteps.has(3),
      fields: ['fullDescription', 'objectives', 'targetAudience'],
      estimatedTime: "5 min"
    },
    {
      level: 4,
      title: "Gouvernance et structure",
      description: "Organisation interne et membres dirigeants",
      required: false,
      completed: completedSteps.has(4),
      fields: ['boardMembers', 'governance', 'countrySpecific'],
      estimatedTime: "7 min"
    },
    {
      level: 5,
      title: "Profil complet",
      description: "Informations financières et documents officiels",
      required: false,
      completed: completedSteps.has(5),
      fields: ['financial', 'legal', 'branding'],
      estimatedTime: "10 min"
    }
  ]

  // Calcul du pourcentage de complétion
  const completionPercentage = (completedSteps.size / steps.length) * 100

  // Validation des étapes
  const validateStep = (step: CompletionLevel): boolean => {
    switch (step) {
      case 1:
        return !!(
          basicInfo.name?.trim() &&
          basicInfo.email?.trim() &&
          basicInfo.country &&
          basicInfo.category &&
          basicInfo.shortDescription?.trim() &&
          basicInfo.creatorInfo?.firstName?.trim() &&
          basicInfo.creatorInfo?.lastName?.trim() &&
          basicInfo.creatorInfo?.email?.trim() &&
          basicInfo.termsAccepted &&
          basicInfo.dataProtectionCompliance
        )
      case 2:
        return true // Optionnel
      case 3:
        return true // Optionnel
      case 4:
        return true // Optionnel
      case 5:
        return true // Optionnel
      default:
        return false
    }
  }

  // Marquer une étape comme complétée
  const markStepCompleted = (step: CompletionLevel) => {
    if (validateStep(step)) {
      setCompletedSteps(prev => new Set([...prev, step]))
    }
  }

  // Naviguer vers une étape
  const goToStep = (step: CompletionLevel) => {
    if (step === 1 || completedSteps.has(step - 1 as CompletionLevel)) {
      setCurrentStep(step)
    }
  }

  // Étape suivante
  const nextStep = () => {
    if (validateStep(currentStep)) {
      markStepCompleted(currentStep)
      if (currentStep < 5) {
        setCurrentStep((currentStep + 1) as CompletionLevel)
      }
    }
  }

  // Étape précédente
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as CompletionLevel)
    }
  }

  // Soumettre la création (minimum niveau 1)
  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setMessage({ type: 'error', text: 'Veuillez remplir toutes les informations obligatoires.' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      // Préparer les données pour l'API - aplatir la structure
      const submissionData = {
        // Informations de base (obligatoires)
        name: basicInfo.name,
        email: basicInfo.email,
        description: basicInfo.shortDescription || `Association ${basicInfo.name}`,
        category: basicInfo.category,
        country: basicInfo.country,
        
        // Contact étendu si complété
        ...(completedSteps.has(2) && extendedContact ? {
          phone: extendedContact.phone,
          address: extendedContact.address?.street ? 
            `${extendedContact.address.street}, ${extendedContact.address.postalCode} ${extendedContact.address.city}` : 
            undefined,
          city: extendedContact.address?.city,
          website: extendedContact.website,
        } : {}),
        
        // Données progressives comme objets pour extensions futures
        legalInfo: completedSteps.has(4) ? countrySpecific : undefined,
        contactInfo: completedSteps.has(2) ? extendedContact : undefined,
        additionalInfo: {
          detailedMission: completedSteps.has(3) ? detailedMission : undefined,
          governance: completedSteps.has(4) ? governance : undefined,
          fullProfile: completedSteps.has(5) ? fullProfile : undefined,
          completionLevel: Math.max(...Array.from(completedSteps)) as CompletionLevel
        }
      }

      console.log('📤 Données envoyées au backend:', submissionData)

      await createAssociation.mutateAsync(submissionData)
      
      setMessage({ type: 'success', text: 'Association créée avec succès !' })
      
      if (onComplete) {
        onComplete(submissionData)
      } else {
        // Redirection vers le dashboard de l'association créée
        setTimeout(() => {
          // Générer le slug basé sur le nom de l'association
          const slug = basicInfo.name
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
          
          if (slug) {
            router.push(`/associations/${slug}/dashboard`)
          } else {
            router.push('/dashboard')
          }
        }, 2000)
      }
      
    } catch (error: any) {
      console.error('Erreur lors de la création:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erreur lors de la création de l\'association.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête avec progression */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Créer votre association</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Créez votre association en quelques étapes simples. 
          Commencez avec les informations essentielles et complétez votre profil progressivement.
        </p>
        
        {/* Barre de progression */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progression</span>
            <span className="text-gray-600">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <div className="text-xs text-gray-500">
            {completedSteps.size} sur {steps.length} étapes complétées
          </div>
        </div>
      </div>

      {/* Navigation des étapes */}
      <div className="flex justify-center">
        <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
          {steps.map((step) => (
            <button
              key={step.level}
              onClick={() => goToStep(step.level)}
              disabled={step.level > 1 && !completedSteps.has((step.level - 1) as CompletionLevel)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                ${currentStep === step.level 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : step.completed
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : step.level === 1 || completedSteps.has((step.level - 1) as CompletionLevel)
                      ? 'text-gray-700 hover:bg-white hover:shadow-sm'
                      : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {step.completed ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="text-xs">{step.level}</span>
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu de l'étape actuelle */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation et actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center space-x-4">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {currentStep < 5 ? (
            <>
              <Button
                variant="outline"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              {completedSteps.has(1) && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Créer l'association
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Créer l'association complète
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            p-4 rounded-lg text-center font-medium
            ${message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
            }
          `}
        >
          {message.text}
        </motion.div>
      )}
    </div>
  )

  // Fonction pour rendre le contenu de chaque étape
  function renderStepContent() {
    const step = steps.find(s => s.level === currentStep)
    if (!step) return null

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Étape {step.level}: {step.title}</span>
                {step.required && <Badge variant="destructive" className="text-xs">Obligatoire</Badge>}
                {!step.required && <Badge variant="secondary" className="text-xs">Optionnel</Badge>}
              </CardTitle>
              <CardDescription className="mt-2">
                {step.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{step.estimatedTime}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </CardContent>
      </Card>
    )
  }

  // Contenu des étapes (à implémenter)
  function renderStep1() {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <span className="font-medium">Information :</span> Ces informations sont obligatoires pour créer votre association. 
          Vous pourrez modifier et compléter votre profil après la création.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom de l'association */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nom de l'association *
            </Label>
            <Input
              id="name"
              value={basicInfo.name || ''}
              onChange={(e) => setBasicInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Association pour l'aide humanitaire"
              className="w-full"
            />
          </div>

          {/* Email principal */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email principal *
            </Label>
            <Input
              id="email"
              type="email"
              value={basicInfo.email || ''}
              onChange={(e) => setBasicInfo(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contact@monassociation.org"
              className="w-full"
            />
          </div>

          {/* Pays */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium">
              Pays *
            </Label>
            <select
              id="country"
              value={basicInfo.country || ''}
              onChange={(e) => setBasicInfo(prev => ({ ...prev, country: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionnez un pays</option>
              {COUNTRIES.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Catégorie principale *
            </Label>
            <select
              id="category"
              value={basicInfo.category || 'GENERAL'}
              onChange={(e) => setBasicInfo(prev => ({ ...prev, category: e.target.value as AssociationCategory }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              {CATEGORIES.find(c => c.value === basicInfo.category)?.description}
            </p>
          </div>
        </div>

        {/* Description courte */}
        <div className="space-y-2">
          <Label htmlFor="shortDescription" className="text-sm font-medium">
            Description courte de votre mission *
          </Label>
          <Textarea
            id="shortDescription"
            value={basicInfo.shortDescription || ''}
            onChange={(e) => setBasicInfo(prev => ({ ...prev, shortDescription: e.target.value }))}
            placeholder="Décrivez en quelques phrases la mission principale de votre association..."
            rows={3}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            {basicInfo.shortDescription?.length || 0}/200 caractères recommandés
          </p>
        </div>

        {/* Informations du créateur */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Informations du responsable
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creatorFirstName" className="text-sm font-medium">
                Prénom *
              </Label>
              <Input
                id="creatorFirstName"
                value={basicInfo.creatorInfo?.firstName || ''}
                onChange={(e) => setBasicInfo(prev => ({ 
                  ...prev, 
                  creatorInfo: { ...prev.creatorInfo, firstName: e.target.value } as any 
                }))}
                placeholder="Jean"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creatorLastName" className="text-sm font-medium">
                Nom *
              </Label>
              <Input
                id="creatorLastName"
                value={basicInfo.creatorInfo?.lastName || ''}
                onChange={(e) => setBasicInfo(prev => ({ 
                  ...prev, 
                  creatorInfo: { ...prev.creatorInfo, lastName: e.target.value } as any 
                }))}
                placeholder="Dupont"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creatorEmail" className="text-sm font-medium">
                Email *
              </Label>
              <Input
                id="creatorEmail"
                type="email"
                value={basicInfo.creatorInfo?.email || ''}
                onChange={(e) => setBasicInfo(prev => ({ 
                  ...prev, 
                  creatorInfo: { ...prev.creatorInfo, email: e.target.value } as any 
                }))}
                placeholder="jean.dupont@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creatorRole" className="text-sm font-medium">
              Rôle dans l'association *
            </Label>
            <select
              id="creatorRole"
              value={basicInfo.creatorInfo?.role || 'PRESIDENT'}
              onChange={(e) => setBasicInfo(prev => ({ 
                ...prev, 
                creatorInfo: { ...prev.creatorInfo, role: e.target.value } as any 
              }))}
              className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PRESIDENT">Président(e)</option>
              <option value="FOUNDER">Fondateur/Fondatrice</option>
              <option value="COORDINATOR">Coordinateur/Coordinatrice</option>
            </select>
          </div>
        </div>

        {/* Accords légaux */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Accords et conformité
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={basicInfo.termsAccepted || false}
                onChange={(e) => setBasicInfo(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                J'accepte les{' '}
                <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                  conditions générales d'utilisation
                </a>{' '}
                de la plateforme *
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={basicInfo.dataProtectionCompliance || false}
                onChange={(e) => setBasicInfo(prev => ({ ...prev, dataProtectionCompliance: e.target.checked }))}
                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Je confirme respecter les réglementations sur la protection des données (RGPD) 
                et m'engage à traiter les données des membres et donateurs de manière conforme *
              </span>
            </label>
          </div>
        </div>

        {/* Validation visuelle */}
        {validateStep(1) && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Toutes les informations obligatoires sont remplies !
            </span>
          </div>
        )}
      </div>
    )
  }

  function renderStep2() {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
          <span className="font-medium">Optionnel :</span> Ajoutez vos coordonnées complètes pour faciliter le contact avec votre association.
        </p>
        
        <div className="text-center py-8 text-gray-500">
          Contenu de l'étape 2 à implémenter...
        </div>
      </div>
    )
  }

  function renderStep3() {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
          <span className="font-medium">Mission détaillée :</span> Décrivez précisément votre mission et vos objectifs.
        </p>
        
        <div className="text-center py-8 text-gray-500">
          Contenu de l'étape 3 à implémenter...
        </div>
      </div>
    )
  }

  function renderStep4() {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
          <span className="font-medium">Gouvernance :</span> Définissez la structure de gouvernance de votre association.
        </p>
        
        <div className="text-center py-8 text-gray-500">
          Contenu de l'étape 4 à implémenter...
        </div>
      </div>
    )
  }

  function renderStep5() {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
          <span className="font-medium">Profil complet :</span> Finalisez votre profil avec les informations financières et documents.
        </p>
        
        <div className="text-center py-8 text-gray-500">
          Contenu de l'étape 5 à implémenter...
        </div>
      </div>
    )
  }
}

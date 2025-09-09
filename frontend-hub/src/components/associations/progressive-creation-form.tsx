'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthContext } from '@/hooks/useAuthContext'
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
  ChevronRight,
  Info,
  CreditCard,
  Shield
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
import { 
  BasicInfoStep,
  ContactStep,
  MissionStep,
  FullProfileStep,
  StripeConfigStep,
  ResponsibleStep,
  LegalAgreementsStep
} from '@/components/associations/steps'

interface ProgressiveCreationFormProps {
  onComplete?: (data: any) => void
}

export default function ProgressiveCreationForm({ onComplete }: ProgressiveCreationFormProps) {
  const router = useRouter()
  const { user } = useAuthContext()
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
    stripeMode: 'PLATFORM',
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
  
  // Charger les données de l'utilisateur connecté au démarrage
  useEffect(() => {
    if (user) {
      setBasicInfo(prev => ({
        ...prev,
        creatorInfo: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          role: 'PRESIDENT'
        }
      }))
    }
  }, [user])

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
      title: "Responsable légal",
      description: "Informations du responsable principal",
      required: true,
      completed: completedSteps.has(2),
      fields: ['firstName', 'lastName', 'email', 'role'],
      estimatedTime: "1 min"
    },
    {
      level: 3,
      title: "Contact et présence",
      description: "Coordonnées complètes et présence en ligne",
      required: false,
      completed: completedSteps.has(3),
      fields: ['phone', 'website', 'address', 'socialMedia'],
      estimatedTime: "3 min"
    },
    {
      level: 4,
      title: "Mission et objectifs",
      description: "Description détaillée de votre mission",
      required: false,
      completed: completedSteps.has(4),
      fields: ['fullDescription', 'objectives', 'targetAudience'],
      estimatedTime: "5 min"
    },
    {
      level: 5,
      title: "Configuration Stripe",
      description: "Mode de paiement (clés CUSTOM configurables plus tard)",
      required: true,
      completed: completedSteps.has(5),
      fields: ['stripeMode'],
      estimatedTime: "1 min"
    },
    {
      level: 6,
      title: "Profil complet",
      description: "Informations légales complémentaires",
      required: false,
      completed: completedSteps.has(6),
      fields: ['legal', 'branding'],
      estimatedTime: "7 min"
    },
    {
      level: 7,
      title: "Accords légaux",
      description: "Conditions d'utilisation et conformité",
      required: true,
      completed: completedSteps.has(7),
      fields: ['termsAccepted', 'dataProtectionCompliance'],
      estimatedTime: "1 min"
    }
  ]

  // Calcul du pourcentage de complétion
  const completionPercentage = (completedSteps.size / steps.length) * 100

  // Validation des étapes
  const validateStep = (step: CompletionLevel): boolean => {
    switch (step) {
      case 1: // BasicInfoStep - Informations de base uniquement
        const baseValidation = !!(
          basicInfo.name?.trim() &&
          basicInfo.email?.trim() &&
          basicInfo.country &&
          basicInfo.category &&
          basicInfo.shortDescription?.trim()
        )
        
        // Validation de l'objet selon le pays
        const purposeValidation = !basicInfo.country || 
          ['FR', 'BE', 'CH', 'CA'].includes(basicInfo.country) ? 
          !!basicInfo.associationPurpose?.trim() : true
        
        return baseValidation && purposeValidation

      case 2: // ResponsibleStep - Informations du responsable
        return !!(
          basicInfo.creatorInfo?.firstName?.trim() &&
          basicInfo.creatorInfo?.lastName?.trim() &&
          basicInfo.creatorInfo?.email?.trim()
        )

      case 3: // ContactStep - Optionnel
        return true

      case 4: // MissionStep - Optionnel  
        return true

      case 5: // StripeConfigStep - Configuration Stripe obligatoire
        // On exige seulement le choix du mode Stripe
        // Les clés CUSTOM peuvent être configurées plus tard dans le dashboard
        return !!basicInfo.stripeMode

      case 6: // FullProfileStep - Optionnel
        return true

      case 7: // LegalAgreementsStep - Conditions obligatoires
        return !!(
          basicInfo.termsAccepted &&
          basicInfo.dataProtectionCompliance
        )

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
      if (currentStep < 7) {
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

  // Soumettre la création (minimum toutes les étapes obligatoires)
  const handleSubmit = async () => {
    // Vérifier toutes les étapes obligatoires: 1, 2, 5, 7
    const requiredSteps: CompletionLevel[] = [1, 2, 5, 7]
    const missingSteps = requiredSteps.filter(step => !validateStep(step))
    
    if (missingSteps.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `Veuillez compléter toutes les étapes obligatoires. Étapes manquantes: ${missingSteps.join(', ')}` 
      })
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
        
        // Informations du créateur
        creatorInfo: {
          firstName: basicInfo.creatorInfo?.firstName || '',
          lastName: basicInfo.creatorInfo?.lastName || '',
          email: basicInfo.creatorInfo?.email || '',
          role: basicInfo.creatorInfo?.role || 'PRESIDENT'
        },
        
        // Configuration Stripe
        stripeMode: basicInfo.stripeMode,
        ...(basicInfo.stripeMode === 'CUSTOM' ? {
          stripeSecretKey: basicInfo.stripeSecretKey,
          stripePublishableKey: basicInfo.stripePublishableKey
        } : {}),
        
        // Objet de l'association
        associationPurpose: basicInfo.associationPurpose,
        
        // Contact étendu si complété
        ...(completedSteps.has(3) && extendedContact ? {
          phone: extendedContact.phone,
          address: extendedContact.address?.street ? 
            `${extendedContact.address.street}, ${extendedContact.address.postalCode} ${extendedContact.address.city}` : 
            undefined,
          city: extendedContact.address?.city,
          website: extendedContact.website,
        } : {}),
        
        // Données progressives comme objets pour extensions futures
        legalInfo: completedSteps.has(6) ? countrySpecific : undefined,
        contactInfo: completedSteps.has(3) ? extendedContact : undefined,
        additionalInfo: {
          detailedMission: completedSteps.has(4) ? detailedMission : undefined,
          governance: completedSteps.has(6) ? governance : undefined,
          fullProfile: completedSteps.has(6) ? fullProfile : undefined,
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
          {currentStep < 7 ? (
            <>
              <Button
                variant="outline"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              {(currentStep === 1 && validateStep(1)) && (
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
              
              {completedSteps.has(1) && currentStep > 1 && (
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
          {currentStep === 1 && (
            <BasicInfoStep 
              data={basicInfo}
              onChange={setBasicInfo}
              errors={{}}
            />
          )}
          {currentStep === 2 && (
            <ResponsibleStep 
              data={basicInfo.creatorInfo}
              onChange={(data) => setBasicInfo(prev => ({ ...prev, creatorInfo: data }))}
              errors={{}}
            />
          )}
          {currentStep === 3 && (
            <ContactStep 
              data={extendedContact}
              onChange={setExtendedContact}
              errors={{}}
            />
          )}
          {currentStep === 4 && (
            <MissionStep 
              data={detailedMission}
              onChange={setDetailedMission}
              errors={{}}
            />
          )}
          {currentStep === 5 && (
            <StripeConfigStep 
              data={basicInfo}
              onChange={setBasicInfo}
              errors={{}}
            />
          )}
          {currentStep === 6 && (
            <FullProfileStep 
              data={fullProfile}
              onChange={setFullProfile}
              errors={{}}
            />
          )}
          {currentStep === 7 && (
            <LegalAgreementsStep 
              data={basicInfo}
              onChange={setBasicInfo}
              errors={{}}
            />
          )}
        </CardContent>
      </Card>
    )
  }
}

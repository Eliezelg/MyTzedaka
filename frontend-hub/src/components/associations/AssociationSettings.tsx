'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BasicInfoStep,
  ContactStep,
  MissionStep,
  FullProfileStep,
  StripeConfigStep,
  ResponsibleStep,
  LegalAgreementsStep
} from '@/components/associations/steps'
import { AssociationFromAPI } from '@/types/association-with-campaigns'
import { 
  CheckCircle, 
  Edit, 
  Save, 
  X, 
  Target,
  Star,
  Clock,
  Settings,
  Users,
  FileText,
  MapPin,
  Shield,
  CreditCard,
  Sparkles,
  AlertTriangle
} from 'lucide-react'

interface AssociationSettingsProps {
  association: AssociationFromAPI
  onUpdate?: (data: Partial<AssociationFromAPI>) => void
}

// Configuration des étapes avec leurs composants
const STEPS_CONFIG = [
  {
    id: 'basic',
    title: 'Informations essentielles',
    icon: Settings,
    required: true,
    component: BasicInfoStep,
    description: 'Nom, email, pays, catégorie et description',
    estimatedTime: '2 min'
  },
  {
    id: 'responsible',
    title: 'Responsable',
    icon: Users,
    required: true,
    component: ResponsibleStep,
    description: 'Informations du créateur/responsable',
    estimatedTime: '1 min'
  },
  {
    id: 'contact',
    title: 'Contact et adresse',
    icon: MapPin,
    required: false,
    component: ContactStep,
    description: 'Coordonnées complètes et réseaux sociaux',
    estimatedTime: '3 min'
  },
  {
    id: 'mission',
    title: 'Mission et objectifs',
    icon: FileText,
    required: false,
    component: MissionStep,
    description: 'Description détaillée et objectifs',
    estimatedTime: '5 min'
  },
  {
    id: 'stripe',
    title: 'Configuration Stripe',
    icon: CreditCard,
    required: false,
    component: StripeConfigStep,
    description: 'Paramètres de paiement et Stripe',
    estimatedTime: '3 min'
  },
  {
    id: 'profile',
    title: 'Profil complet',
    icon: Star,
    required: false,
    component: FullProfileStep,
    description: 'Informations financières et légales',
    estimatedTime: '10 min'
  },
  {
    id: 'legal',
    title: 'Accords légaux',
    icon: Shield,
    required: true,
    component: LegalAgreementsStep,
    description: 'Conditions et conformité RGPD',
    estimatedTime: '1 min'
  }
]

export default function AssociationSettings({ association, onUpdate }: AssociationSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeStep, setActiveStep] = useState('basic')
  const [hasChanges, setHasChanges] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // État local pour toutes les données de l'association
  const [formData, setFormData] = useState({
    // Informations de base
    name: association.name || '',
    email: association.email || '',
    description: association.description || '',
    shortDescription: association.description || '',
    country: association.country || '',
    category: association.category || 'GENERAL',
    associationPurpose: '',
    
    // Responsable
    creatorInfo: {
      firstName: '',
      lastName: '',
      email: association.email || '',
      role: 'PRESIDENT'
    },
    
    // Contact
    phone: association.phone || '',
    website: association.siteUrl || '',
    address: {
      street: '',
      postalCode: '',
      city: association.city || '',
      region: ''
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    
    // Mission
    fullDescription: association.description || '',
    geographicScope: 'LOCAL',
    objectives: [],
    targetAudience: [],
    actionAreas: [],
    mainActivities: [],
    
    // Stripe
    stripeMode: 'PLATFORM',
    stripeSecretKey: '',
    stripePublishableKey: '',
    
    // Profil complet
    financial: {
      estimatedAnnualBudget: undefined,
      taxExemptStatus: false,
      fundingSources: [],
      bankAccount: {
        iban: '',
        bic: '',
        bankName: ''
      }
    },
    branding: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280'
      }
    },
    legal: {
      registrationNumber: '',
      registrationDate: ''
    },
    
    // Accords légaux
    termsAccepted: false,
    dataProtectionCompliance: false
  })

  // Calcul du niveau de complétion
  const calculateCompletionLevel = () => {
    let score = 0
    const totalSteps = STEPS_CONFIG.length

    // Vérifier chaque étape
    STEPS_CONFIG.forEach(step => {
      switch (step.id) {
        case 'basic':
          if (formData.name && formData.email && formData.country && formData.category && formData.shortDescription) {
            score += 1
          }
          break
        case 'responsible':
          if (formData.creatorInfo.firstName && formData.creatorInfo.lastName && formData.creatorInfo.email) {
            score += 1
          }
          break
        case 'contact':
          if (formData.phone || formData.website || formData.address.city) {
            score += 1
          }
          break
        case 'mission':
          if (formData.fullDescription && formData.fullDescription.length > 100) {
            score += 1
          }
          break
        case 'stripe':
          score += 1 // Toujours compté car PLATFORM est par défaut
          break
        case 'profile':
          if (formData.financial.estimatedAnnualBudget || formData.legal.registrationNumber) {
            score += 1
          }
          break
        case 'legal':
          if (formData.termsAccepted && formData.dataProtectionCompliance) {
            score += 1
          }
          break
      }
    })

    return Math.round((score / totalSteps) * 100)
  }

  const completionLevel = calculateCompletionLevel()

  const handleStepChange = (stepId: string) => {
    setActiveStep(stepId)
  }

  const handleDataChange = (newData: any) => {
    setFormData(newData)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (onUpdate) {
      // Mapper les données du formulaire vers le format API
      const apiData = {
        name: formData.name,
        email: formData.email,
        description: formData.fullDescription || formData.shortDescription,
        phone: formData.phone,
        siteUrl: formData.website,
        city: formData.address.city,
        country: formData.country,
        category: formData.category,
        // Ajouter d'autres mappings selon le schéma API
      }
      
      onUpdate(apiData)
      setHasChanges(false)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    // Réinitialiser les données depuis l'association
    setFormData({
      ...formData,
      name: association.name || '',
      email: association.email || '',
      description: association.description || '',
      // ... réinitialiser d'autres champs
    })
    setHasChanges(false)
    setIsEditing(false)
  }

  const currentStepConfig = STEPS_CONFIG.find(step => step.id === activeStep)
  const StepComponent = currentStepConfig?.component

  return (
    <div className="space-y-6">
      {/* En-tête avec niveau de complétion */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configuration de l'association
              </CardTitle>
              <CardDescription>
                Complétez les informations de votre association par étapes
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={completionLevel >= 80 ? 'default' : 'secondary'} className="px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                {completionLevel}% complété
              </Badge>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button onClick={handleSave} disabled={!hasChanges}>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={completionLevel} className="h-2" />
            <p className="text-sm text-gray-600">
              Progression globale : {STEPS_CONFIG.filter((_, index) => index < (completionLevel / 100) * STEPS_CONFIG.length).length} sur {STEPS_CONFIG.length} étapes complétées
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation par onglets */}
      <Tabs value={activeStep} onValueChange={handleStepChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          {STEPS_CONFIG.map((step) => {
            const Icon = step.icon
            const isCompleted = activeStep === step.id ? true : false // Simplification pour l'exemple
            
            return (
              <TabsTrigger 
                key={step.id} 
                value={step.id}
                className="flex flex-col items-center gap-1 p-2 h-auto"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs hidden lg:inline">{step.title}</span>
                {step.required && (
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {STEPS_CONFIG.map((step) => (
          <TabsContent key={step.id} value={step.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <step.icon className="h-5 w-5" />
                      <span>{step.title}</span>
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
                {StepComponent && (
                  <StepComponent
                    data={formData}
                    onChange={handleDataChange}
                    errors={errors}
                    isEditing={isEditing}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Validation générale */}
      {hasChanges && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Vous avez des modifications non sauvegardées
          </span>
        </div>
      )}

      {completionLevel >= 100 && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Félicitations ! Votre profil d'association est complet
          </span>
        </div>
      )}
    </div>
  )
}
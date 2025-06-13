'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { AssociationFromAPI } from '@/types/association-with-campaigns'
import { 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Star,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Users,
  Shield,
  Trophy,
  Edit,
  Save,
  X
} from 'lucide-react'

interface CompletionManagerProps {
  association: AssociationFromAPI
  onUpdate?: (data: Partial<AssociationFromAPI>) => void
}

// Calcul du niveau de complétion basé sur les données disponibles
const calculateCompletionLevel = (association: AssociationFromAPI) => {
  let score = 20 // Minimum pour création de base

  // Contact étendu (+20%)
  if (association.phone || association.siteUrl) score += 20

  // Mission détaillée (+20%)
  if (association.description && association.description.length > 100) score += 20

  // Informations géographiques (+20%)
  if (association.city && association.country) score += 20

  // Informations complètes (+20%)
  if (association.email && association.phone && association.siteUrl && association.isVerified) score += 20

  return Math.min(score, 100)
}

const getCompletionBadge = (level: number) => {
  if (level >= 100) return { label: 'Expert', color: 'bg-purple-500', icon: Trophy }
  if (level >= 80) return { label: 'Avancé', color: 'bg-blue-500', icon: Star }
  if (level >= 60) return { label: 'Intermédiaire', color: 'bg-green-500', icon: CheckCircle }
  if (level >= 40) return { label: 'Basique', color: 'bg-yellow-500', icon: AlertCircle }
  return { label: 'Débutant', color: 'bg-gray-500', icon: Target }
}

export default function CompletionManager({ association, onUpdate }: CompletionManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeStep, setActiveStep] = useState(1) // Étape active de 1 à 5
  const [editData, setEditData] = useState({
    phone: association.phone || '',
    siteUrl: association.siteUrl || '',
    description: association.description || '',
    city: association.city || '',
    country: association.country || '',
    email: association.email || ''
  })

  const completionLevel = calculateCompletionLevel(association)
  const badge = getCompletionBadge(completionLevel)
  const BadgeIcon = badge.icon

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editData)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      phone: association.phone || '',
      siteUrl: association.siteUrl || '',
      description: association.description || '',
      city: association.city || '',
      country: association.country || '',
      email: association.email || ''
    })
    setIsEditing(false)
  }

  const handleNextStep = () => {
    if (activeStep < 5) {
      setActiveStep(activeStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    setActiveStep(step)
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec niveau de complétion */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Niveau de complétion
              </CardTitle>
              <CardDescription>
                Complétez votre profil pour débloquer plus de fonctionnalités
              </CardDescription>
            </div>
            <Badge className={`${badge.color} text-white`}>
              <BadgeIcon className="h-4 w-4 mr-1" />
              {badge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progression globale</span>
              <span className="text-sm text-muted-foreground">{completionLevel}%</span>
            </div>
            <Progress value={completionLevel} className="h-2" />
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="text-center">
                <button 
                  onClick={() => handleStepClick(1)}
                  className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    completionLevel >= 20 ? 'bg-green-500 text-white' : 'bg-blue-300 text-white'
                  } ${activeStep === 1 ? 'ring-2 ring-blue-500 ring-offset-2' : ''} hover:scale-105`}
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <p className="text-xs mt-1">Création</p>
              </div>
              <div className="text-center">
                <button 
                  onClick={() => handleStepClick(2)}
                  className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    completionLevel >= 40 ? 'bg-green-500 text-white' : 'bg-blue-300 text-white'
                  } ${activeStep === 2 ? 'ring-2 ring-blue-500 ring-offset-2' : ''} hover:scale-105`}
                >
                  <Mail className="h-4 w-4" />
                </button>
                <p className="text-xs mt-1">Contact</p>
              </div>
              <div className="text-center">
                <button 
                  onClick={() => handleStepClick(3)}
                  className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    completionLevel >= 60 ? 'bg-green-500 text-white' : 'bg-blue-300 text-white'
                  } ${activeStep === 3 ? 'ring-2 ring-blue-500 ring-offset-2' : ''} hover:scale-105`}
                >
                  <FileText className="h-4 w-4" />
                </button>
                <p className="text-xs mt-1">Mission</p>
              </div>
              <div className="text-center">
                <button 
                  onClick={() => handleStepClick(4)}
                  className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    completionLevel >= 80 ? 'bg-green-500 text-white' : 'bg-blue-300 text-white'
                  } ${activeStep === 4 ? 'ring-2 ring-blue-500 ring-offset-2' : ''} hover:scale-105`}
                >
                  <MapPin className="h-4 w-4" />
                </button>
                <p className="text-xs mt-1">Localisation</p>
              </div>
              <div className="text-center">
                <button 
                  onClick={() => handleStepClick(5)}
                  className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    completionLevel >= 100 ? 'bg-green-500 text-white' : 'bg-blue-300 text-white'
                  } ${activeStep === 5 ? 'ring-2 ring-blue-500 ring-offset-2' : ''} hover:scale-105`}
                >
                  <Shield className="h-4 w-4" />
                </button>
                <p className="text-xs mt-1">Vérification</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'édition */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informations complémentaires</CardTitle>
              <CardDescription>
                Complétez ces informations pour améliorer votre visibilité
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={editData.siteUrl}
                  onChange={(e) => setEditData({ ...editData, siteUrl: e.target.value })}
                  disabled={!isEditing}
                  placeholder="https://votre-site.fr"
                />
              </div>
            </div>

            {/* Localisation */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={editData.city}
                  onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Paris"
                />
              </div>
              
              <div>
                <Label htmlFor="country">Pays</Label>
                <Select
                  value={editData.country}
                  onValueChange={(value) => setEditData({ ...editData, country: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="belgium">Belgique</SelectItem>
                    <SelectItem value="switzerland">Suisse</SelectItem>
                    <SelectItem value="canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          <div>
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea
              id="description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              disabled={!isEditing}
              rows={4}
              placeholder="Décrivez votre mission, vos objectifs et vos actions..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              {editData.description.length}/500 caractères • Plus de 100 caractères recommandés
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Étapes suivantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Prochaines étapes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeStep === 1 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Ajoutez vos informations de contact</p>
                  <p className="text-sm text-yellow-600">Téléphone et site web pour être facilement contacté</p>
                </div>
              </div>
            )}
            
            {activeStep === 2 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Rédigez une description détaillée</p>
                  <p className="text-sm text-blue-600">Expliquez votre mission et vos objectifs (minimum 100 caractères)</p>
                </div>
              </div>
            )}
            
            {activeStep === 3 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Précisez votre localisation</p>
                  <p className="text-sm text-green-600">Ville et pays pour améliorer votre référencement local</p>
                </div>
              </div>
            )}
            
            {activeStep === 4 && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-800">Demandez la vérification</p>
                  <p className="text-sm text-purple-600">Contactez notre équipe pour faire vérifier votre association</p>
                </div>
              </div>
            )}
            
            {activeStep === 5 && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Trophy className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-800">Profil expert !</p>
                  <p className="text-sm text-purple-600">Votre association est maintenant complètement configurée</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePrevStep}>
                Étape précédente
              </Button>
              <div className="flex gap-2">
                {Array.from({ length: 5 }, (_, i) => i + 1).map((step, index) => (
                  <Button 
                    key={index} 
                    size="sm" 
                    onClick={() => handleStepClick(step)} 
                    variant={activeStep === step ? 'primary' : 'outline'}
                  >
                    {step}
                  </Button>
                ))}
              </div>
              <Button onClick={handleNextStep}>
                Étape suivante
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

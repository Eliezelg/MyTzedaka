'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Info, Shield, CreditCard } from 'lucide-react'
import { COUNTRIES, CATEGORIES, AssociationCategory } from '@/types/association-creation'

interface BasicInfoStepProps {
  data: any
  onChange: (data: any) => void
  errors?: Record<string, string>
  isEditing?: boolean
}

export default function BasicInfoStep({ data, onChange, errors = {}, isEditing = true }: BasicInfoStepProps) {
  const getPurposeLabel = () => {
    switch (data.country) {
      case 'FR': return "Objet de l'association *"
      case 'BE': return "Objet social *"
      case 'CH': return "But de l'association *"
      case 'CA': return "Objets de la corporation *"
      default: return "Mission principale *"
    }
  }
  
  const getPurposePlaceholder = () => {
    switch (data.country) {
      case 'FR': return "Ex: L'association a pour objet de promouvoir l'aide humanitaire et la solidarité..."
      case 'BE': return "Ex: L'ASBL a pour objet social de développer des projets d'aide aux personnes défavorisées..."
      case 'CH': return "Ex: L'association a pour but de soutenir les familles dans le besoin..."
      case 'CA': return "Ex: Les objets de la corporation sont de fournir une aide humanitaire..."
      default: return "Décrivez la mission principale de votre organisation..."
    }
  }

  return (
    <div className="space-y-6">
      {!isEditing && (
        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <span className="font-medium">Information :</span> Ces informations sont obligatoires pour créer votre association. 
          Vous pourrez modifier et compléter votre profil après la création.
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom de l'association */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nom de l'association *
          </Label>
          <Input
            id="name"
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Ex: Association pour l'aide humanitaire"
            className={`w-full ${errors.name ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Email principal */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email principal *
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="contact@monassociation.org"
            className={`w-full ${errors.email ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Pays */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium">
            Pays *
          </Label>
          <select
            id="country"
            value={data.country || ''}
            onChange={(e) => onChange({ ...data, country: e.target.value })}
            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.country ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          >
            <option value="">Sélectionnez un pays</option>
            {COUNTRIES.map(country => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
          {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
        </div>

        {/* Catégorie */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Catégorie principale *
          </Label>
          <select
            id="category"
            value={data.category || 'GENERAL'}
            onChange={(e) => onChange({ ...data, category: e.target.value as AssociationCategory })}
            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.category ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          >
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            {CATEGORIES.find(c => c.value === data.category)?.description}
          </p>
          {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
        </div>
      </div>

      {/* Description courte */}
      <div className="space-y-2">
        <Label htmlFor="shortDescription" className="text-sm font-medium">
          Description courte de votre mission *
        </Label>
        <Textarea
          id="shortDescription"
          value={data.shortDescription || ''}
          onChange={(e) => onChange({ ...data, shortDescription: e.target.value })}
          placeholder="Décrivez en quelques phrases la mission principale de votre association..."
          rows={3}
          className={`w-full ${errors.shortDescription ? 'border-red-500' : ''}`}
          disabled={!isEditing}
        />
        <p className="text-xs text-gray-500">
          {data.shortDescription?.length || 0}/200 caractères recommandés
        </p>
        {errors.shortDescription && <p className="text-xs text-red-500">{errors.shortDescription}</p>}
      </div>
      
      {/* Objet de l'association (selon le pays) */}
      {data.country && ['FR', 'BE', 'CH', 'CA'].includes(data.country) && (
        <div className="space-y-2">
          <Label htmlFor="associationPurpose" className="text-sm font-medium">
            {getPurposeLabel()}
          </Label>
          <Textarea
            id="associationPurpose"
            value={data.associationPurpose || ''}
            onChange={(e) => onChange({ ...data, associationPurpose: e.target.value })}
            placeholder={getPurposePlaceholder()}
            rows={3}
            className={`w-full ${errors.associationPurpose ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          />
          <p className="text-xs text-gray-500">
            Ce texte doit décrire précisément l'objet légal de votre association
          </p>
          {errors.associationPurpose && <p className="text-xs text-red-500">{errors.associationPurpose}</p>}
        </div>
      )}
    </div>
  )
}
'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ContactStepProps {
  data: any
  onChange: (data: any) => void
  errors?: Record<string, string>
  isEditing?: boolean
}

export default function ContactStep({ data, onChange, errors = {}, isEditing = true }: ContactStepProps) {
  return (
    <div className="space-y-6">
      {!isEditing && (
        <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
          <span className="font-medium">Optionnel :</span> Ajoutez vos coordonnées complètes pour faciliter le contact avec votre association.
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Téléphone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Téléphone
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+33 1 23 45 67 89"
            className={`w-full ${errors.phone ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
        </div>

        {/* Site web */}
        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-medium">
            Site web
          </Label>
          <Input
            id="website"
            type="url"
            value={data.website || ''}
            onChange={(e) => onChange({ ...data, website: e.target.value })}
            placeholder="https://www.monassociation.org"
            className={`w-full ${errors.website ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          />
          {errors.website && <p className="text-xs text-red-500">{errors.website}</p>}
        </div>
      </div>

      {/* Adresse */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Adresse complète
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="street" className="text-sm font-medium">
            Rue et numéro
          </Label>
          <Input
            id="street"
            value={data.address?.street || ''}
            onChange={(e) => onChange({ 
              ...data, 
              address: { ...data.address, street: e.target.value }
            })}
            placeholder="123 Rue de la Paix"
            className={`w-full ${errors.street ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          />
          {errors.street && <p className="text-xs text-red-500">{errors.street}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-sm font-medium">
              Code postal
            </Label>
            <Input
              id="postalCode"
              value={data.address?.postalCode || ''}
              onChange={(e) => onChange({ 
                ...data, 
                address: { ...data.address, postalCode: e.target.value }
              })}
              placeholder="75001"
              className={`w-full ${errors.postalCode ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              Ville
            </Label>
            <Input
              id="city"
              value={data.address?.city || ''}
              onChange={(e) => onChange({ 
                ...data, 
                address: { ...data.address, city: e.target.value }
              })}
              placeholder="Paris"
              className={`w-full ${errors.city ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="region" className="text-sm font-medium">
              Région/Province
            </Label>
            <Input
              id="region"
              value={data.address?.region || ''}
              onChange={(e) => onChange({ 
                ...data, 
                address: { ...data.address, region: e.target.value }
              })}
              placeholder="Île-de-France"
              className={`w-full ${errors.region ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.region && <p className="text-xs text-red-500">{errors.region}</p>}
          </div>
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Réseaux sociaux
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="facebook" className="text-sm font-medium">
              Facebook
            </Label>
            <Input
              id="facebook"
              value={data.socialMedia?.facebook || ''}
              onChange={(e) => onChange({ 
                ...data, 
                socialMedia: { ...data.socialMedia, facebook: e.target.value }
              })}
              placeholder="https://facebook.com/monassociation"
              className={`w-full ${errors.facebook ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.facebook && <p className="text-xs text-red-500">{errors.facebook}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-sm font-medium">
              Instagram
            </Label>
            <Input
              id="instagram"
              value={data.socialMedia?.instagram || ''}
              onChange={(e) => onChange({ 
                ...data, 
                socialMedia: { ...data.socialMedia, instagram: e.target.value }
              })}
              placeholder="https://instagram.com/monassociation"
              className={`w-full ${errors.instagram ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.instagram && <p className="text-xs text-red-500">{errors.instagram}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter" className="text-sm font-medium">
              Twitter/X
            </Label>
            <Input
              id="twitter"
              value={data.socialMedia?.twitter || ''}
              onChange={(e) => onChange({ 
                ...data, 
                socialMedia: { ...data.socialMedia, twitter: e.target.value }
              })}
              placeholder="https://twitter.com/monassociation"
              className={`w-full ${errors.twitter ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.twitter && <p className="text-xs text-red-500">{errors.twitter}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-sm font-medium">
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={data.socialMedia?.linkedin || ''}
              onChange={(e) => onChange({ 
                ...data, 
                socialMedia: { ...data.socialMedia, linkedin: e.target.value }
              })}
              placeholder="https://linkedin.com/company/monassociation"
              className={`w-full ${errors.linkedin ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.linkedin && <p className="text-xs text-red-500">{errors.linkedin}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface FullProfileStepProps {
  data: any
  onChange: (data: any) => void
  errors?: Record<string, string>
  isEditing?: boolean
}

export default function FullProfileStep({ data, onChange, errors = {}, isEditing = true }: FullProfileStepProps) {
  return (
    <div className="space-y-6">
      {!isEditing && (
        <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
          <span className="font-medium">Profil complet :</span> Finalisez votre profil avec les informations légales complémentaires.
        </p>
      )}
      
      {/* Statut d'intérêt général */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Statut légal
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={data.financial?.taxExemptStatus || false}
              onChange={(e) => onChange({ 
                ...data, 
                financial: { 
                  ...data.financial, 
                  taxExemptStatus: e.target.checked 
                }
              })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={!isEditing}
            />
            <span className="text-sm text-gray-700">
              Association reconnue d'intérêt général
            </span>
          </label>
        </div>
      </div>

      {/* Informations bancaires */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Coordonnées bancaires (optionnel)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="iban" className="text-sm font-medium">
              IBAN
            </Label>
            <Input
              id="iban"
              value={data.financial?.bankAccount?.iban || ''}
              onChange={(e) => onChange({ 
                ...data, 
                financial: { 
                  ...data.financial, 
                  bankAccount: { 
                    ...data.financial?.bankAccount, 
                    iban: e.target.value 
                  } 
                }
              })}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              className={`w-full ${errors.iban ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.iban && <p className="text-xs text-red-500">{errors.iban}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bic" className="text-sm font-medium">
              BIC/SWIFT
            </Label>
            <Input
              id="bic"
              value={data.financial?.bankAccount?.bic || ''}
              onChange={(e) => onChange({ 
                ...data, 
                financial: { 
                  ...data.financial, 
                  bankAccount: { 
                    ...data.financial?.bankAccount, 
                    bic: e.target.value 
                  } 
                }
              })}
              placeholder="BNPAFRPP"
              className={`w-full ${errors.bic ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.bic && <p className="text-xs text-red-500">{errors.bic}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bankName" className="text-sm font-medium">
            Nom de la banque
          </Label>
          <Input
            id="bankName"
            value={data.financial?.bankAccount?.bankName || ''}
            onChange={(e) => onChange({ 
              ...data, 
              financial: { 
                ...data.financial, 
                bankAccount: { 
                  ...data.financial?.bankAccount, 
                  bankName: e.target.value 
                } 
              }
            })}
            placeholder="BNP Paribas"
            className={`w-full ${errors.bankName ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          />
          {errors.bankName && <p className="text-xs text-red-500">{errors.bankName}</p>}
        </div>
      </div>

      {/* Identité visuelle */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Identité visuelle (optionnel)
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor" className="text-sm font-medium">
              Couleur principale
            </Label>
            <div className="flex space-x-2">
              <input
                id="primaryColor"
                type="color"
                value={data.branding?.colors?.primary || '#3B82F6'}
                onChange={(e) => onChange({ 
                  ...data, 
                  branding: { 
                    ...data.branding, 
                    colors: { 
                      ...data.branding?.colors, 
                      primary: e.target.value 
                    } 
                  }
                })}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                disabled={!isEditing}
              />
              <Input
                value={data.branding?.colors?.primary || '#3B82F6'}
                onChange={(e) => onChange({ 
                  ...data, 
                  branding: { 
                    ...data.branding, 
                    colors: { 
                      ...data.branding?.colors, 
                      primary: e.target.value 
                    } 
                  }
                })}
                placeholder="#3B82F6"
                className="flex-1"
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secondaryColor" className="text-sm font-medium">
              Couleur secondaire (optionnel)
            </Label>
            <div className="flex space-x-2">
              <input
                id="secondaryColor"
                type="color"
                value={data.branding?.colors?.secondary || '#6B7280'}
                onChange={(e) => onChange({ 
                  ...data, 
                  branding: { 
                    ...data.branding, 
                    colors: { 
                      ...data.branding?.colors, 
                      secondary: e.target.value 
                    } 
                  }
                })}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                disabled={!isEditing}
              />
              <Input
                value={data.branding?.colors?.secondary || '#6B7280'}
                onChange={(e) => onChange({ 
                  ...data, 
                  branding: { 
                    ...data.branding, 
                    colors: { 
                      ...data.branding?.colors, 
                      secondary: e.target.value 
                    } 
                  }
                })}
                placeholder="#6B7280"
                className="flex-1"
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Informations légales */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Informations légales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registrationNumber" className="text-sm font-medium">
              Numéro d'enregistrement
            </Label>
            <Input
              id="registrationNumber"
              value={data.legal?.registrationNumber || ''}
              onChange={(e) => onChange({ 
                ...data, 
                legal: { 
                  ...data.legal, 
                  registrationNumber: e.target.value 
                }
              })}
              placeholder="RNA, SIRET, etc."
              className={`w-full ${errors.registrationNumber ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.registrationNumber && <p className="text-xs text-red-500">{errors.registrationNumber}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="registrationDate" className="text-sm font-medium">
              Date de création
            </Label>
            <Input
              id="registrationDate"
              type="date"
              value={data.legal?.registrationDate || ''}
              onChange={(e) => onChange({ 
                ...data, 
                legal: { 
                  ...data.legal, 
                  registrationDate: e.target.value 
                }
              })}
              className={`w-full ${errors.registrationDate ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.registrationDate && <p className="text-xs text-red-500">{errors.registrationDate}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
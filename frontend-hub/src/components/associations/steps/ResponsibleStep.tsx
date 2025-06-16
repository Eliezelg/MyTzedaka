'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ResponsibleStepProps {
  data: any
  onChange: (data: any) => void
  errors?: Record<string, string>
  isEditing?: boolean
}

export default function ResponsibleStep({ data, onChange, errors = {}, isEditing = true }: ResponsibleStepProps) {
  return (
    <div className="space-y-6">
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
              value={data.creatorInfo?.firstName || ''}
              onChange={(e) => onChange({ 
                ...data, 
                creatorInfo: { ...data.creatorInfo, firstName: e.target.value }
              })}
              placeholder="Jean"
              className={`${errors.firstName ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="creatorLastName" className="text-sm font-medium">
              Nom *
            </Label>
            <Input
              id="creatorLastName"
              value={data.creatorInfo?.lastName || ''}
              onChange={(e) => onChange({ 
                ...data, 
                creatorInfo: { ...data.creatorInfo, lastName: e.target.value }
              })}
              placeholder="Dupont"
              className={`${errors.lastName ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="creatorEmail" className="text-sm font-medium">
              Email *
            </Label>
            <Input
              id="creatorEmail"
              type="email"
              value={data.creatorInfo?.email || ''}
              onChange={(e) => onChange({ 
                ...data, 
                creatorInfo: { ...data.creatorInfo, email: e.target.value }
              })}
              placeholder="jean.dupont@email.com"
              className={`${errors.email ? 'border-red-500' : ''}`}
              disabled={!isEditing}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="creatorRole" className="text-sm font-medium">
            Rôle dans l'association *
          </Label>
          <select
            id="creatorRole"
            value={data.creatorInfo?.role || 'PRESIDENT'}
            onChange={(e) => onChange({ 
              ...data, 
              creatorInfo: { ...data.creatorInfo, role: e.target.value }
            })}
            className={`w-full md:w-1/3 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.role ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          >
            <option value="PRESIDENT">Président(e)</option>
            <option value="FOUNDER">Fondateur/Fondatrice</option>
            <option value="COORDINATOR">Coordinateur/Coordinatrice</option>
          </select>
          {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
        </div>
      </div>
    </div>
  )
}
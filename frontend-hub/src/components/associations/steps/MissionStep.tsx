'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface MissionStepProps {
  data: any
  onChange: (data: any) => void
  errors?: Record<string, string>
  isEditing?: boolean
}

export default function MissionStep({ data, onChange, errors = {}, isEditing = true }: MissionStepProps) {
  return (
    <div className="space-y-6">
      {!isEditing && (
        <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
          <span className="font-medium">Mission détaillée :</span> Décrivez précisément votre mission et vos objectifs.
        </p>
      )}
      
      {/* Description complète */}
      <div className="space-y-2">
        <Label htmlFor="fullDescription" className="text-sm font-medium">
          Description complète de votre mission
        </Label>
        <Textarea
          id="fullDescription"
          value={data.fullDescription || ''}
          onChange={(e) => onChange({ ...data, fullDescription: e.target.value })}
          placeholder="Décrivez en détail la mission de votre association, son histoire, ses valeurs et son impact..."
          rows={4}
          className={`w-full ${errors.fullDescription ? 'border-red-500' : ''}`}
          disabled={!isEditing}
        />
        <p className="text-xs text-gray-500">
          {data.fullDescription?.length || 0}/1000 caractères recommandés
        </p>
        {errors.fullDescription && <p className="text-xs text-red-500">{errors.fullDescription}</p>}
      </div>

      {/* Portée géographique */}
      <div className="space-y-2">
        <Label htmlFor="geographicScope" className="text-sm font-medium">
          Portée géographique
        </Label>
        <select
          id="geographicScope"
          value={data.geographicScope || 'LOCAL'}
          onChange={(e) => onChange({ ...data, geographicScope: e.target.value })}
          className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.geographicScope ? 'border-red-500' : ''}`}
          disabled={!isEditing}
        >
          <option value="LOCAL">Locale (ville/région)</option>
          <option value="REGIONAL">Régionale</option>
          <option value="NATIONAL">Nationale</option>
          <option value="INTERNATIONAL">Internationale</option>
        </select>
        {errors.geographicScope && <p className="text-xs text-red-500">{errors.geographicScope}</p>}
      </div>

      {/* Objectifs */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Objectifs principaux
        </h3>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Ajoutez vos objectifs (un par ligne)
          </Label>
          <Textarea
            value={(data.objectives || []).join('\n')}
            onChange={(e) => {
              const objectives = e.target.value.split('\n').filter(obj => obj.trim())
              onChange({ ...data, objectives })
            }}
            placeholder="Exemple:&#10;Aider les familles en difficulté&#10;Sensibiliser à l'éducation&#10;Promouvoir l'égalité des chances"
            rows={4}
            className={`w-full ${errors.objectives ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          />
          <p className="text-xs text-gray-500">
            {data.objectives?.length || 0} objectif(s) ajouté(s)
          </p>
          {errors.objectives && <p className="text-xs text-red-500">{errors.objectives}</p>}
        </div>
      </div>

      {/* Public cible */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Public cible
        </h3>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Qui sont vos bénéficiaires ? (un par ligne)
          </Label>
          <Textarea
            value={(data.targetAudience || []).join('\n')}
            onChange={(e) => {
              const targetAudience = e.target.value.split('\n').filter(audience => audience.trim())
              onChange({ ...data, targetAudience })
            }}
            placeholder="Exemple:&#10;Familles monoparentales&#10;Personnes âgées isolées&#10;Jeunes en décrochage scolaire&#10;Personnes en situation de handicap"
            rows={4}
            className={`w-full ${errors.targetAudience ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          />
          <p className="text-xs text-gray-500">
            {data.targetAudience?.length || 0} groupe(s) cible(s)
          </p>
          {errors.targetAudience && <p className="text-xs text-red-500">{errors.targetAudience}</p>}
        </div>
      </div>

      {/* Domaines d'action */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Domaines d'action
        </h3>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Dans quels domaines agissez-vous ? (un par ligne)
          </Label>
          <Textarea
            value={(data.actionAreas || []).join('\n')}
            onChange={(e) => {
              const actionAreas = e.target.value.split('\n').filter(area => area.trim())
              onChange({ ...data, actionAreas })
            }}
            placeholder="Exemple:&#10;Aide alimentaire&#10;Éducation et formation&#10;Logement et hébergement&#10;Santé et bien-être&#10;Culture et loisirs"
            rows={4}
            className={`w-full ${errors.actionAreas ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          />
          <p className="text-xs text-gray-500">
            {data.actionAreas?.length || 0} domaine(s) d'action
          </p>
          {errors.actionAreas && <p className="text-xs text-red-500">{errors.actionAreas}</p>}
        </div>
      </div>

      {/* Activités principales */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Activités principales
        </h3>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Quelles sont vos activités concrètes ? (une par ligne)
          </Label>
          <Textarea
            value={(data.mainActivities || []).join('\n')}
            onChange={(e) => {
              const mainActivities = e.target.value.split('\n').filter(activity => activity.trim())
              onChange({ ...data, mainActivities })
            }}
            placeholder="Exemple:&#10;Distribution de repas&#10;Cours de soutien scolaire&#10;Visites à domicile&#10;Ateliers de réinsertion&#10;Collectes de dons"
            rows={4}
            className={`w-full ${errors.mainActivities ? 'border-red-500' : ''}`}
            disabled={!isEditing}
          />
          <p className="text-xs text-gray-500">
            {data.mainActivities?.length || 0} activité(s) principale(s)
          </p>
          {errors.mainActivities && <p className="text-xs text-red-500">{errors.mainActivities}</p>}
        </div>
      </div>
    </div>
  )
}
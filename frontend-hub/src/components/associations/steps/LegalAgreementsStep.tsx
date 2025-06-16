'use client'

interface LegalAgreementsStepProps {
  data: any
  onChange: (data: any) => void
  errors?: Record<string, string>
  isEditing?: boolean
}

export default function LegalAgreementsStep({ data, onChange, errors = {}, isEditing = true }: LegalAgreementsStepProps) {
  return (
    <div className="space-y-6">
      {/* Accords légaux */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Accords et conformité
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.termsAccepted || false}
              onChange={(e) => onChange({ ...data, termsAccepted: e.target.checked })}
              className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={!isEditing}
            />
            <span className="text-sm text-gray-700">
              J'accepte les{' '}
              <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                conditions générales d'utilisation
              </a>{' '}
              de la plateforme *
            </span>
          </label>
          {errors.termsAccepted && <p className="text-xs text-red-500">{errors.termsAccepted}</p>}

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.dataProtectionCompliance || false}
              onChange={(e) => onChange({ ...data, dataProtectionCompliance: e.target.checked })}
              className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={!isEditing}
            />
            <span className="text-sm text-gray-700">
              Je confirme respecter les réglementations sur la protection des données (RGPD) 
              et m'engage à traiter les données des membres et donateurs de manière conforme *
            </span>
          </label>
          {errors.dataProtectionCompliance && <p className="text-xs text-red-500">{errors.dataProtectionCompliance}</p>}
        </div>
      </div>
    </div>
  )
}
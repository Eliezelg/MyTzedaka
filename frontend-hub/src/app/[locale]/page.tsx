import { useTranslations } from 'next-intl'

export default function LocalizedHomePage() {
  const t = useTranslations('common')
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          {t('welcome')}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Hub Central - Portail Donateur Unifié
        </p>
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-blue-700">
            🎉 Système d'internationalisation configuré avec succès !
          </p>
        </div>
      </div>
    </div>
  )
}

import { useTranslations } from 'next-intl'
import { HeroSection } from '@/components/hub/hero-section'
import { CommonText } from '@/components/ui/translated-text'

export default function LocalizedHomePage() {
  const t = useTranslations('common')
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Section de démonstration des traductions */}
      <div className="py-16 text-center bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            <CommonText tKey="welcome" />
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('description')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">
                <CommonText tKey="features" />
              </h3>
              <p className="text-gray-600">
                {t('multiLanguage')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-green-600">
                <CommonText tKey="support" />
              </h3>
              <p className="text-gray-600">
                {t('rtlSupport')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-purple-600">
                <CommonText tKey="translation" />
              </h3>
              <p className="text-gray-600">
                {t('comprehensive')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

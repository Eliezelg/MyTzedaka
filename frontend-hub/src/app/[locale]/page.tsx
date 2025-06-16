'use client'

import { useTranslations } from 'next-intl'

export default function LocalizedHomePage() {
  const tCommon = useTranslations('common')
  const tIndex = useTranslations('index')
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            {tIndex('hero.title')}
          </h1>
          <p className="text-xl mb-8">
            {tCommon('appName')} - {tIndex('hero.subtitle')}
          </p>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            {tIndex('hero.description')}
          </p>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{tIndex('stats.associationsCount')}</div>
              <div className="text-gray-600">{tIndex('stats.associationsLabel')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{tIndex('stats.donationsAmount')}</div>
              <div className="text-gray-600">{tIndex('stats.donationsLabel')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{tIndex('stats.donorsCount')}</div>
              <div className="text-gray-600">{tIndex('stats.donorsLabel')}</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Associations */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{tIndex('featured.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{tIndex('featured.association')} {i}</h3>
                  <p className="text-gray-600 mb-4">{tIndex('featured.description')}</p>
                  <div className="text-sm text-blue-600">{tIndex('featured.learnMore')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">{tIndex('cta.title')}</h2>
          <p className="text-xl mb-8">{tIndex('cta.subtitle')}</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            {tIndex('cta.button')}
          </button>
        </div>
      </section>
    </div>
  )
}

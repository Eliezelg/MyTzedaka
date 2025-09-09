'use client'

import React from 'react'
import { useTenant } from '@/providers/tenant-provider'

interface PageSection {
  id: string
  type: string
  props?: any
  content?: any
}

interface PageData {
  id: string
  title: string
  slug: string
  content?: any
  sections?: PageSection[]
  layout?: string
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

interface DynamicPageRendererProps {
  pageData: PageData
}

// Composant pour rendre une section
function SectionRenderer({ section }: { section: PageSection }) {
  const { tenant } = useTenant()

  switch (section.type) {
    case 'hero':
      return (
        <section className="relative bg-primary text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {section.content?.title || 'Bienvenue'}
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                {section.content?.subtitle || ''}
              </p>
              {section.content?.buttons && (
                <div className="flex justify-center gap-4">
                  {section.content.buttons.map((button: any, index: number) => (
                    <a
                      key={index}
                      href={button.url}
                      className={`px-8 py-3 rounded-lg font-semibold transition ${
                        button.variant === 'primary'
                          ? 'bg-white text-primary hover:bg-gray-100'
                          : 'border-2 border-white text-white hover:bg-white hover:text-primary'
                      }`}
                    >
                      {button.text}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )

    case 'content':
      return (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {section.content?.title && (
              <h2 className="text-3xl font-bold text-center mb-12">
                {section.content.title}
              </h2>
            )}
            <div 
              className="prose prose-lg mx-auto"
              dangerouslySetInnerHTML={{ __html: section.content?.html || section.content?.text || '' }}
            />
          </div>
        </section>
      )

    case 'donation':
      return (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {section.content?.title || 'Faire un don'}
              </h2>
              <p className="text-xl text-gray-600">
                {section.content?.description || 'Votre générosité fait la différence'}
              </p>
            </div>
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[18, 36, 100].map((amount) => (
                  <button
                    key={amount}
                    className="py-3 px-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
                  >
                    {amount}€
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Autre montant"
                className="w-full px-4 py-3 border rounded-lg mb-6"
              />
              <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition">
                Faire un don
              </button>
            </div>
          </div>
        </section>
      )

    case 'campaigns':
      return (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              {section.content?.title || 'Nos Campagnes'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Placeholder pour les campagnes */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2">Campagne {i}</h3>
                  <p className="text-gray-600">Description de la campagne</p>
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-sm text-gray-500">60% collecté</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'cta':
      return (
        <section className="py-16 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {section.content?.title || 'Prêt à nous rejoindre ?'}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {section.content?.description || 'Ensemble, nous pouvons faire la différence'}
            </p>
            <a
              href={section.content?.buttonUrl || '/donate'}
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              {section.content?.buttonText || 'Commencer'}
            </a>
          </div>
        </section>
      )

    default:
      return null
  }
}

export function DynamicPageRenderer({ pageData }: DynamicPageRendererProps) {
  // Si on a des sections, les rendre
  if (pageData.sections && pageData.sections.length > 0) {
    return (
      <div className="dynamic-page">
        {pageData.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>
    )
  }

  // Sinon, rendre le contenu simple
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-8">{pageData.title}</h1>
        {pageData.content && (
          <div 
            className="prose prose-lg"
            dangerouslySetInnerHTML={{ 
              __html: typeof pageData.content === 'string' 
                ? pageData.content 
                : pageData.content.html || pageData.content.text || ''
            }}
          />
        )}
      </div>
    </div>
  )
}
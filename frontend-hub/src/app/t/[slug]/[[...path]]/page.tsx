import { notFound } from 'next/navigation'
import { DynamicPageRenderer } from '@/components/tenant/dynamic-page-renderer'
import { TenantHeader } from '@/components/tenant/tenant-header'
import { TenantFooter } from '@/components/tenant/tenant-footer'
import { TenantDonationPage } from '@/components/tenant/donation-page'
import { TenantCampaignsPage } from '@/components/tenant/campaigns-page'

interface PageProps {
  params: { 
    slug: string
    path?: string[]
  }
}

// Fonction pour récupérer une page dynamique
async function getPageData(tenantSlug: string, pagePath: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/tenants/${tenantSlug}/pages/${pagePath}`,
      { 
        cache: 'no-store' // Pour le développement
      }
    )
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

// Routes spéciales qui ont leurs propres composants
const SPECIAL_ROUTES = [
  'donate',
  'campaigns', 
  'events',
  'zmanim',
  'prayers',
  'admin'
]

export default async function DynamicTenantPage({ params }: PageProps) {
  // Construire le chemin de la page
  const pagePath = params.path ? params.path.join('/') : 'home'
  
  // Vérifier si c'est une route spéciale
  if (params.path && SPECIAL_ROUTES.includes(params.path[0])) {
    const route = params.path[0]
    
    return (
      <div className="min-h-screen bg-gray-50">
        <TenantHeader />
        
        <main>
          {route === 'donate' && <TenantDonationPage />}
          {route === 'campaigns' && <TenantCampaignsPage />}
          {route === 'events' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <h1 className="text-4xl font-bold mb-8">Événements</h1>
              <p className="text-gray-600">Cette page sera bientôt disponible.</p>
            </div>
          )}
          {route === 'zmanim' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <h1 className="text-4xl font-bold mb-8">Horaires de prière</h1>
              <p className="text-gray-600">Cette page sera bientôt disponible.</p>
            </div>
          )}
          {route === 'prayers' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <h1 className="text-4xl font-bold mb-8">Offices</h1>
              <p className="text-gray-600">Cette page sera bientôt disponible.</p>
            </div>
          )}
          {route === 'admin' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <h1 className="text-4xl font-bold mb-8">Administration</h1>
              <p className="text-gray-600">Cette page sera bientôt disponible.</p>
            </div>
          )}
        </main>
        
        <TenantFooter />
      </div>
    )
  }
  
  // Récupérer les données de la page
  const pageData = await getPageData(params.slug, pagePath)
  
  // Si pas de données de page, afficher une page par défaut
  // (En attendant que l'API soit prête)
  if (!pageData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TenantHeader />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue sur notre site
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Notre site est en cours de construction.
            </p>
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">À propos</h2>
              <p className="text-gray-600">
                Découvrez bientôt notre organisation et nos activités.
              </p>
            </div>
          </div>
        </main>
        
        <TenantFooter />
      </div>
    )
  }
  
  // Rendre la page dynamique
  return (
    <div className="min-h-screen bg-gray-50">
      <TenantHeader />
      
      <main>
        <DynamicPageRenderer pageData={pageData} />
      </main>
      
      <TenantFooter />
    </div>
  )
}
import { notFound } from 'next/navigation'
import { DynamicPageRenderer } from '@/components/tenant/dynamic-page-renderer'

interface PageProps {
  params: { slug: string }
}

// Fonction pour récupérer la page d'accueil du tenant
async function getHomePage(tenantSlug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/tenants/${tenantSlug}/pages/home`,
      { 
        cache: 'no-store' // Pour le développement, on désactive le cache
      }
    )
    
    if (!response.ok) {
      // Si pas de page home, on retourne une page par défaut
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching home page:', error)
    return null
  }
}

// Fonction pour récupérer les informations publiques du tenant
async function getTenantInfo(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/tenant/${slug}`,
      { 
        cache: 'force-cache',
        next: { revalidate: 300 } // 5 minutes
      }
    )
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching tenant info:', error)
    return null
  }
}

export default async function TenantHomePage({ params }: PageProps) {
  const [pageData, tenantInfo] = await Promise.all([
    getHomePage(params.slug),
    getTenantInfo(params.slug)
  ])

  if (!tenantInfo) {
    notFound()
  }

  // Si on a une page dynamique configurée, on l'affiche
  if (pageData) {
    return <DynamicPageRenderer pageData={pageData} />
  }

  // Sinon, on affiche une page par défaut
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header temporaire */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              {tenantInfo.logoPath && (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/tenant/${tenantInfo.id}/logo`}
                  alt={tenantInfo.name}
                  className="h-10 w-auto mr-4"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {tenantInfo.name}
              </h1>
            </div>
            
            <nav className="flex space-x-8">
              <a href={`/t/${params.slug}`} className="text-gray-700 hover:text-primary">
                Accueil
              </a>
              <a href={`/t/${params.slug}/donate`} className="text-gray-700 hover:text-primary">
                Faire un don
              </a>
              <a href={`/t/${params.slug}/campaigns`} className="text-gray-700 hover:text-primary">
                Campagnes
              </a>
              <a href={`/t/${params.slug}/about`} className="text-gray-700 hover:text-primary">
                À propos
              </a>
              <a href={`/t/${params.slug}/contact`} className="text-gray-700 hover:text-primary">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-primary text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenue chez {tenantInfo.name}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Ensemble, faisons la différence
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href={`/t/${params.slug}/donate`}
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Faire un don
              </a>
              <a 
                href={`/t/${params.slug}/about`}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition"
              >
                En savoir plus
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section Campagnes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Campagnes Actives</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Placeholder pour les campagnes */}
            <div className="bg-gray-100 rounded-lg p-6">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Campagne à venir</h3>
              <p className="text-gray-600">Les campagnes actives apparaîtront ici</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer temporaire */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mb-4">{tenantInfo.name}</p>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
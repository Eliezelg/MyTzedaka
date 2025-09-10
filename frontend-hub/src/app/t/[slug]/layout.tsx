import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TenantProvider } from '@/providers/tenant-provider'
import { Tenant, TenantModules } from '@/lib/tenant/tenant-resolver'
import { QueryProvider } from '@/lib/query-provider'

// Types
interface TenantLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

// Fonction pour récupérer les données du tenant
async function getTenantData(slug: string): Promise<Tenant | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'
    const response = await fetch(
      `${apiUrl}/tenant/${slug}`,
      { 
        next: { revalidate: 60 } // Revalider toutes les 60 secondes
      }
    )
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return null
  }
}

// Fonction pour récupérer les modules du tenant
async function getTenantModules(tenantId: string): Promise<TenantModules | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'
    const response = await fetch(
      `${apiUrl}/tenant/${tenantId}/modules`,
      { 
        next: { revalidate: 60 }
      }
    )
    
    if (!response.ok) {
      // Retourner les modules par défaut si erreur
      return {
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        gallery: false,
        zmanim: false,
        prayers: false,
        courses: false,
        hebrewCalendar: false,
        members: false,
        library: false,
        yahrzeits: false,
        seatingChart: false,
        mikvah: false,
        kashrut: false,
        eruv: false,
        marketplace: false,
        directory: false,
        chesed: false,
        newsletter: false,
        modulesConfig: {}
      }
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching tenant modules:', error)
    return null
  }
}

// Génération des métadonnées dynamiques
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tenant = await getTenantData(params.slug)
  
  if (!tenant) {
    return {
      title: 'Site non trouvé',
      description: 'Ce site n\'existe pas ou n\'est plus disponible.'
    }
  }

  return {
    title: tenant.name,
    description: `Site officiel de ${tenant.name}`,
    openGraph: {
      title: tenant.name,
      description: `Site officiel de ${tenant.name}`,
      type: 'website',
      locale: 'fr_FR',
    },
  }
}

// Layout principal pour les sites tenants
export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const tenant = await getTenantData(params.slug)
  
  if (!tenant) {
    notFound()
  }

  // Récupérer les modules
  const modules = await getTenantModules(tenant.id) || {
    donations: true,
    campaigns: true,
    events: true,
    blog: true,
    gallery: false,
    zmanim: false,
    prayers: false,
    courses: false,
    hebrewCalendar: false,
    members: false,
    library: false,
    yahrzeits: false,
    seatingChart: false,
    mikvah: false,
    kashrut: false,
    eruv: false,
    marketplace: false,
    directory: false,
    chesed: false,
    newsletter: false,
    modulesConfig: {}
  }

  // Extraire les couleurs du thème
  const theme = tenant.theme || {}
  const primaryColor = theme.primaryColor || '#1e40af'
  const secondaryColor = theme.secondaryColor || '#3b82f6'

  return (
    <QueryProvider>
      <TenantProvider tenant={tenant} modules={modules} theme={theme}>
        <div 
          className="min-h-screen"
          style={{
            '--primary-color': primaryColor,
            '--secondary-color': secondaryColor,
          } as React.CSSProperties}
        >
          
          {children}
        </div>
      </TenantProvider>
    </QueryProvider>
  )
}
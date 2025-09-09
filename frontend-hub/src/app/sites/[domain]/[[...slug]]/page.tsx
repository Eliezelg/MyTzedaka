import { notFound } from 'next/navigation';
import { getTenantByDomain } from '@/lib/tenant/tenant-resolver';
import { DynamicPageRenderer } from '@/components/sites/pages/DynamicPageRenderer';
import { Metadata } from 'next';

interface DynamicPageProps {
  params: {
    domain: string;
    slug?: string[];
  };
}

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const slug = params.slug?.join('/') || '';
  const pageSlug = slug || 'home';
  const tenant = await getTenantByDomain(params.domain);
  
  if (!tenant) {
    return {
      title: 'Page non trouvée',
    };
  }

  // Charger les métadonnées de la page
  const page = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${tenant.id}/pages/${pageSlug}`)
    .then(res => res.json())
    .catch(() => null);

  if (!page) {
    return {
      title: 'Page non trouvée',
    };
  }

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.settings?.excerpt,
    keywords: page.seo?.keywords || page.tags?.join(', '),
    openGraph: {
      title: page.seo?.ogTitle || page.title,
      description: page.seo?.ogDescription || page.seo?.description,
      images: page.seo?.ogImage ? [page.seo.ogImage] : [],
    },
  };
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const slug = params.slug?.join('/') || '';
  const tenant = await getTenantByDomain(params.domain);
  
  if (!tenant) {
    notFound();
  }

  // Routes spéciales qui ne sont pas des pages CMS
  const specialRoutes = ['donate', 'campaigns', 'events', 'zmanim', 'prayers', 'courses', 'admin'];
  const firstSegment = params.slug?.[0];
  
  if (firstSegment && specialRoutes.includes(firstSegment)) {
    // Ces routes sont gérées par des fichiers spécifiques
    switch (firstSegment) {
      case 'donate':
        const { DonatePage } = await import('@/components/sites/pages/DonatePage');
        return <DonatePage tenantId={tenant.id} />;
      
      case 'campaigns':
        const { CampaignsPage } = await import('@/components/sites/pages/CampaignsPage');
        return <CampaignsPage tenantId={tenant.id} />;
      
      case 'events':
        const { EventsPage } = await import('@/components/sites/pages/EventsPage');
        return <EventsPage tenantId={tenant.id} />;
      
      case 'zmanim':
        const { ZmanimPage } = await import('@/components/sites/pages/ZmanimPage');
        return <ZmanimPage tenantId={tenant.id} />;
      
      case 'prayers':
        const { PrayersPage } = await import('@/components/sites/pages/PrayersPage');
        return <PrayersPage tenantId={tenant.id} />;
      
      case 'courses':
        const { CoursesPage } = await import('@/components/sites/pages/CoursesPage');
        return <CoursesPage tenantId={tenant.id} />;
      
      default:
        notFound();
    }
  }

  // Si c'est la page d'accueil et qu'un template est configuré, l'utiliser
  const pageSlug = slug || 'home';
  
  if (pageSlug === 'home' && tenant.templateId) {
    // Charger le template dynamique
    const { SynagogueDynamicTemplate } = await import('@/components/sites/templates/SynagogueDynamicTemplate');
    
    // Récupérer les données du template depuis le tenant ou utiliser les données par défaut
    const templateData = tenant.templateData || {};
    
    return <SynagogueDynamicTemplate tenantId={tenant.id} data={templateData} />;
  }

  // Sinon, charger la page CMS normale
  const page = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${tenant.id}/pages/${pageSlug}`)
    .then(res => {
      if (!res.ok) throw new Error('Page not found');
      return res.json();
    })
    .catch(() => null);

  if (!page || !page.isActive || page.status !== 'PUBLISHED') {
    notFound();
  }

  return <DynamicPageRenderer page={page} tenantId={tenant.id} />;
}
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TenantProvider } from '@/providers/tenant-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { getTenantByDomain } from '@/lib/tenant/tenant-resolver';
import { SiteHeader } from '@/components/sites/layout/SiteHeader';
import { SiteFooter } from '@/components/sites/layout/SiteFooter';
import { validateTenantDomain } from '@/lib/security/tenant-validator';

interface SiteLayoutProps {
  children: React.ReactNode;
  params: {
    domain: string;
  };
}

export async function generateMetadata({ params }: SiteLayoutProps): Promise<Metadata> {
  const tenant = await getTenantByDomain(params.domain);
  
  if (!tenant) {
    return {
      title: 'Site non trouvé',
      description: 'Ce site n\'existe pas'
    };
  }

  return {
    title: {
      default: tenant.name,
      template: `%s | ${tenant.name}`
    },
    description: tenant.settings?.description || `Site officiel de ${tenant.name}`,
    openGraph: {
      title: tenant.name,
      description: tenant.settings?.description,
      images: tenant.settings?.ogImage ? [tenant.settings.ogImage] : [],
      locale: 'fr_FR',
      type: 'website',
    },
    icons: {
      icon: tenant.settings?.favicon || '/favicon.ico',
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  // Valider le domaine avant de faire la requête
  const domainValidation = validateTenantDomain(params.domain);
  
  if (!domainValidation.isValid) {
    console.error('Invalid tenant domain:', domainValidation.error);
    notFound();
  }
  
  const tenant = await getTenantByDomain(domainValidation.sanitizedValue || params.domain);
  
  if (!tenant) {
    notFound();
  }

  // Charger les modules activés pour ce tenant
  const modules = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/modules`)
    .then(res => res.json())
    .catch(() => ({}));

  // Charger la navigation personnalisée
  const navigation = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/navigation`)
    .then(res => res.json())
    .catch(() => null);

  // Charger le thème personnalisé
  const theme = tenant.theme || {};

  return (
    <TenantProvider 
      tenant={tenant} 
      modules={modules}
      navigation={navigation}
      theme={theme}
    >
      <AuthProvider>
        <div 
          className="min-h-screen flex flex-col"
          style={{
            '--primary': theme.colors?.primary || '#3B82F6',
            '--secondary': theme.colors?.secondary || '#8B5CF6',
            '--accent': theme.colors?.accent || '#10B981',
            '--background': theme.colors?.background || '#FFFFFF',
            '--foreground': theme.colors?.foreground || '#0F172A',
          } as React.CSSProperties}
        >
          <SiteHeader />
          <main className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
      </AuthProvider>
    </TenantProvider>
  );
}
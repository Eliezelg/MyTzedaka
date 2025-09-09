'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PageWidgetsRenderer } from '@/components/sites/public/WidgetRenderer';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PageData {
  id: string;
  title: string;
  content?: any;
  layout: string;
  widgets: any[];
}

interface TenantData {
  id: string;
  name: string;
  slug: string;
}

export default function DynamicPageContent() {
  const params = useParams();
  const domain = params.domain as string;
  const slug = params.slug ? (params.slug as string[]).join('/') : 'home';
  
  const [page, setPage] = useState<PageData | null>(null);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPageData();
  }, [domain, slug]);

  const loadPageData = async () => {
    try {
      // Charger les infos du tenant
      const tenantResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/hub/associations/by-domain/${domain}`
      );
      
      if (!tenantResponse.ok) {
        throw new Error('Tenant non trouvé');
      }
      
      const tenantData = await tenantResponse.json();
      setTenant(tenantData);

      // Charger la page et ses widgets
      const pageResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenantData.id}/pages/${slug}`
      );
      
      if (!pageResponse.ok) {
        throw new Error('Page non trouvée');
      }
      
      const pageData = await pageResponse.json();
      setPage(pageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !page || !tenant) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-semibold mb-2">Page non trouvée</h2>
            <p className="text-muted-foreground">
              La page demandée n'existe pas ou n'est pas accessible.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Page Title */}
      {page.title && (
        <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
      )}

      {/* Static Content (if any) */}
      {page.content && typeof page.content === 'string' && (
        <div className="prose prose-lg max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      )}

      {/* Dynamic Widgets */}
      <PageWidgetsRenderer
        pageId={page.id}
        widgets={page.widgets}
        tenantId={tenant.id}
        layout={page.layout}
      />
    </div>
  );
}
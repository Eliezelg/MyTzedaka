'use client';

import { useMemo } from 'react';
import { ContentBlock } from '../blocks/ContentBlock';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { sanitizeRichContent } from '@/lib/security/sanitizer';

interface Page {
  id: string;
  title: string;
  slug: string;
  type: 'STATIC' | 'BLOG' | 'GALLERY' | 'EVENTS' | 'FAQ' | 'CONTACT' | 'CUSTOM';
  content: string;
  settings?: {
    layout?: 'default' | 'fullwidth' | 'sidebar';
    showBreadcrumbs?: boolean;
    showTitle?: boolean;
    showLastUpdated?: boolean;
    blocks?: Array<{
      type: string;
      props: Record<string, any>;
      order: number;
    }>;
  };
  updatedAt: string;
}

interface DynamicPageRendererProps {
  page: Page;
  tenantId: string;
}

export function DynamicPageRenderer({ page, tenantId }: DynamicPageRendererProps) {
  const breadcrumbs = useMemo(() => {
    const items = [
      { label: 'Accueil', href: '/' }
    ];
    
    // Ajouter des breadcrumbs selon le type de page
    switch (page.type) {
      case 'BLOG':
        items.push({ label: 'Actualités', href: '/blog' });
        break;
      case 'EVENTS':
        items.push({ label: 'Événements', href: '/events' });
        break;
      case 'GALLERY':
        items.push({ label: 'Galerie', href: '/gallery' });
        break;
      case 'FAQ':
        items.push({ label: 'FAQ', href: '/faq' });
        break;
    }
    
    items.push({ label: page.title, href: `/${page.slug}` });
    return items;
  }, [page]);

  const renderPageContent = () => {
    // Si la page a des blocs de contenu définis, les utiliser
    if (page.settings?.blocks && page.settings.blocks.length > 0) {
      const sortedBlocks = [...page.settings.blocks].sort((a, b) => a.order - b.order);
      
      return (
        <div className="space-y-8">
          {sortedBlocks.map((block, index) => (
            <ContentBlock
              key={`${block.type}-${index}`}
              type={block.type}
              props={block.props}
              tenantId={tenantId}
            />
          ))}
        </div>
      );
    }
    
    // Sinon, rendre le contenu HTML/Markdown sanitizé
    const sanitizedContent = sanitizeRichContent(page.content);
    return (
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  };

  const renderByType = () => {
    switch (page.type) {
      case 'BLOG':
        return <BlogPageLayout page={page} content={renderPageContent()} />;
      case 'GALLERY':
        return <GalleryPageLayout page={page} content={renderPageContent()} />;
      case 'EVENTS':
        return <EventsPageLayout page={page} content={renderPageContent()} />;
      case 'FAQ':
        return <FAQPageLayout page={page} content={renderPageContent()} />;
      case 'CONTACT':
        return <ContactPageLayout page={page} content={renderPageContent()} />;
      default:
        return renderPageContent();
    }
  };

  const layout = page.settings?.layout || 'default';
  const showBreadcrumbs = page.settings?.showBreadcrumbs !== false;
  const showTitle = page.settings?.showTitle !== false;
  const showLastUpdated = page.settings?.showLastUpdated === true;

  return (
    <div className={`py-8 ${layout === 'fullwidth' ? '' : 'container mx-auto px-4'}`}>
      {showBreadcrumbs && (
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      
      {showTitle && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{page.title}</h1>
          {showLastUpdated && (
            <p className="text-sm text-gray-500">
              Dernière mise à jour: {new Date(page.updatedAt).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      )}
      
      <div className={`
        ${layout === 'sidebar' ? 'grid grid-cols-1 lg:grid-cols-4 gap-8' : ''}
      `}>
        {layout === 'sidebar' && (
          <aside className="lg:col-span-1">
            <PageSidebar page={page} />
          </aside>
        )}
        
        <div className={layout === 'sidebar' ? 'lg:col-span-3' : ''}>
          {renderByType()}
        </div>
      </div>
    </div>
  );
}

// Layouts spécifiques par type de page
function BlogPageLayout({ page, content }: { page: Page; content: React.ReactNode }) {
  return (
    <article className="bg-white rounded-lg shadow-sm p-8">
      {content}
    </article>
  );
}

function GalleryPageLayout({ page, content }: { page: Page; content: React.ReactNode }) {
  return (
    <div className="space-y-8">
      {content}
    </div>
  );
}

function EventsPageLayout({ page, content }: { page: Page; content: React.ReactNode }) {
  return (
    <div className="space-y-8">
      {content}
    </div>
  );
}

function FAQPageLayout({ page, content }: { page: Page; content: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto">
      {content}
    </div>
  );
}

function ContactPageLayout({ page, content }: { page: Page; content: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {content}
    </div>
  );
}

function PageSidebar({ page }: { page: Page }) {
  return (
    <div className="sticky top-24 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold mb-4">Navigation</h3>
        <nav className="space-y-2">
          {/* Table des matières ou navigation contextuelle */}
          <a href="#" className="block text-sm text-gray-600 hover:text-primary">
            Section 1
          </a>
          <a href="#" className="block text-sm text-gray-600 hover:text-primary">
            Section 2
          </a>
        </nav>
      </div>
    </div>
  );
}
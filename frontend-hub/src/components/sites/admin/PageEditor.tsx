'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Eye,
  Settings,
  Image,
  Type,
  List,
  Grid,
  Code
} from 'lucide-react';
import { useTenant } from '@/providers/tenant-provider';
import { getAccessToken } from '@/lib/security/cookie-auth';
import toast from 'react-hot-toast';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: any;
  status: 'DRAFT' | 'PUBLISHED';
  isHomepage: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'gallery' | 'video' | 'donation' | 'events' | 'custom';
  content: any;
  order: number;
}

export function PageEditor() {
  const { tenant } = useTenant();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: [] as ContentBlock[],
    status: 'DRAFT' as const,
    isHomepage: false
  });

  // S'assurer que content est toujours un tableau
  useEffect(() => {
    if (formData.content && !Array.isArray(formData.content)) {
      setFormData(prev => ({
        ...prev,
        content: []
      }));
    }
  }, [formData.content]);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/pages`
      );
      
      if (response.ok) {
        const data = await response.json();
        // L'API retourne { pages: [...], total: ..., hasMore: ... }
        setPages(data.pages || []);
      } else {
        console.error('Error fetching pages:', response.status);
        setPages([]);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setPages([]);
    }
  };

  const handleCreatePage = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        toast.error('Vous devez être connecté');
        return;
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/pages`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        await fetchPages();
        resetForm();
        setIsEditing(false);
        toast.success('Page créée avec succès');
      } else {
        toast.error('Erreur lors de la création de la page');
      }
    } catch (error) {
      console.error('Error creating page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePage = async () => {
    if (!selectedPage) return;
    
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        toast.error('Vous devez être connecté');
        return;
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/pages/${selectedPage.id}`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        await fetchPages();
        setIsEditing(false);
        toast.success('Page mise à jour avec succès');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page?')) return;

    try {
      const token = getAccessToken();
      if (!token) {
        toast.error('Vous devez être connecté');
        return;
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/pages/${pageId}`,
        { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        await fetchPages();
        if (selectedPage?.id === pageId) {
          setSelectedPage(null);
        }
        toast.success('Page supprimée avec succès');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: [],
      status: 'DRAFT',
      isHomepage: false
    });
  };

  const addContentBlock = (type: ContentBlock['type']) => {
    const currentContent = Array.isArray(formData.content) ? formData.content : [];
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      order: currentContent.length
    };

    setFormData(prev => ({
      ...prev,
      content: [...currentContent, newBlock]
    }));
  };

  const getDefaultContent = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text':
        return { text: '', format: 'paragraph' };
      case 'image':
        return { url: '', alt: '', caption: '' };
      case 'gallery':
        return { images: [] };
      case 'video':
        return { url: '', provider: 'youtube' };
      case 'donation':
        return { showParnass: true };
      case 'events':
        return { limit: 5, showPast: false };
      default:
        return {};
    }
  };

  const updateContentBlock = (blockId: string, content: any) => {
    setFormData(prev => ({
      ...prev,
      content: Array.isArray(prev.content) 
        ? prev.content.map(block =>
            block.id === blockId ? { ...block, content } : block
          )
        : []
    }));
  };

  const removeContentBlock = (blockId: string) => {
    setFormData(prev => ({
      ...prev,
      content: Array.isArray(prev.content) 
        ? prev.content.filter(block => block.id !== blockId)
        : []
    }));
  };

  const renderContentBlockEditor = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label>Contenu texte</Label>
            <Textarea
              value={block.content.text}
              onChange={(e) => updateContentBlock(block.id, { ...block.content, text: e.target.value })}
              rows={4}
              placeholder="Entrez votre texte..."
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <Label>URL de l'image</Label>
            <Input
              value={block.content.url}
              onChange={(e) => updateContentBlock(block.id, { ...block.content, url: e.target.value })}
              placeholder="https://..."
            />
            <Label>Texte alternatif</Label>
            <Input
              value={block.content.alt}
              onChange={(e) => updateContentBlock(block.id, { ...block.content, alt: e.target.value })}
              placeholder="Description de l'image"
            />
          </div>
        );

      default:
        return <p className="text-sm text-gray-500">Éditeur pour {block.type}</p>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pages List */}
      <div className="lg:col-span-1">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Pages</h3>
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setIsEditing(true);
                setSelectedPage(null);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle
            </Button>
          </div>

          <div className="space-y-2">
            {Array.isArray(pages) && pages.map(page => (
              <div
                key={page.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedPage?.id === page.id 
                    ? 'bg-primary/10 border border-primary' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => {
                  setSelectedPage(page);
                  // S'assurer que content est un tableau
                  let pageContent = [];
                  if (Array.isArray(page.content)) {
                    pageContent = page.content;
                  } else if (page.content && typeof page.content === 'object') {
                    // Si c'est un objet, essayer de le convertir ou utiliser un tableau vide
                    pageContent = [];
                  }
                  setFormData({
                    title: page.title,
                    slug: page.slug,
                    content: pageContent,
                    status: page.status,
                    isHomepage: page.isHomepage
                  });
                  setIsEditing(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{page.title}</p>
                    <p className="text-sm text-gray-500">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {page.isHomepage && (
                      <Badge variant="secondary">Accueil</Badge>
                    )}
                    <Badge variant={page.status === 'PUBLISHED' ? 'success' : 'outline'}>
                      {page.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Page Editor */}
      <div className="lg:col-span-2">
        {(selectedPage || isEditing) ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {isEditing ? (selectedPage ? 'Modifier la page' : 'Nouvelle page') : 'Détails de la page'}
              </h3>
              
              <div className="flex gap-2">
                {!isEditing && selectedPage && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/sites/${tenant.slug}/${selectedPage.slug}`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePage(selectedPage.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {isEditing && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        if (!selectedPage) setSelectedPage(null);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={selectedPage ? handleUpdatePage : handleCreatePage}
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-6">
                {/* Page Settings */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre de la page</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre de la page"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">URL de la page</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">/{tenant.slug}/</span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="url-de-la-page"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isHomepage}
                        onChange={(e) => setFormData(prev => ({ ...prev, isHomepage: e.target.checked }))}
                      />
                      Page d'accueil
                    </Label>

                    <Label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        value="DRAFT"
                        checked={formData.status === 'DRAFT'}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: 'DRAFT' }))}
                      />
                      Brouillon
                    </Label>

                    <Label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        value="PUBLISHED"
                        checked={formData.status === 'PUBLISHED'}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: 'PUBLISHED' }))}
                      />
                      Publié
                    </Label>
                  </div>
                </div>

                {/* Content Blocks */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Contenu de la page</Label>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => addContentBlock('text')}>
                        <Type className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => addContentBlock('image')}>
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => addContentBlock('gallery')}>
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => addContentBlock('custom')}>
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Array.isArray(formData.content) && formData.content.map((block, index) => (
                      <Card key={block.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline">{block.type}</Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeContentBlock(block.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {renderContentBlockEditor(block)}
                      </Card>
                    ))}

                    {(!Array.isArray(formData.content) || formData.content.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Aucun contenu</p>
                        <p className="text-sm">Cliquez sur les boutons ci-dessus pour ajouter du contenu</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Titre</Label>
                  <p className="font-medium">{selectedPage?.title}</p>
                </div>
                <div>
                  <Label>URL</Label>
                  <p className="font-mono text-sm">/{tenant.slug}/{selectedPage?.slug}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge variant={selectedPage?.status === 'PUBLISHED' ? 'success' : 'outline'}>
                    {selectedPage?.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>
                <div>
                  <Label>Dernière modification</Label>
                  <p className="text-sm text-gray-600">
                    {selectedPage && new Date(selectedPage.updatedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Aucune page sélectionnée</h3>
            <p className="text-gray-600 mb-4">
              Sélectionnez une page dans la liste ou créez-en une nouvelle
            </p>
            <Button onClick={() => {
              resetForm();
              setIsEditing(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une page
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
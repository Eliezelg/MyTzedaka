'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Save, Eye, Edit3, Palette, Image, Type, 
  Calendar, Clock, MapPin, Building, School, Heart,
  ChevronRight, Settings, Code, Layout
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTenant } from '@/providers/tenant-provider';
import { motion } from 'framer-motion';
import { getAuthHeaders } from '@/lib/security/cookie-auth';

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: 'synagogue' | 'association' | 'school' | 'community';
  preview: string;
  icon: React.ReactNode;
  features: string[];
  data: any;
}

const templates: TemplateConfig[] = [
  {
    id: 'synagogue-modern',
    name: 'Synagogue Moderne',
    description: 'Template élégant avec sections pour horaires de prières, événements et dons',
    category: 'synagogue',
    preview: 'https://images.unsplash.com/photo-1560306843-33986aebaf12?q=80&w=2874',
    icon: <Building className="h-5 w-5" />,
    features: ['Horaires de prières', 'Calendrier hébraïque', 'Événements', 'Système de dons'],
    data: {
      hero: {
        title: 'Synagogue Beth Shalom',
        subtitle: 'Un lieu de prière, d\'étude et de rassemblement communautaire',
        backgroundImage: 'https://images.unsplash.com/photo-1560306843-33986aebaf12?q=80&w=2874'
      },
      prayers: {
        enabled: true,
        title: 'Horaires des Offices',
        subtitle: 'Rejoignez-nous pour les prières quotidiennes',
        times: [], // Tableau des horaires de prières
        location: 'Paris, France'
      },
      events: {
        enabled: true,
        title: 'Événements à Venir',
        items: [] // Initialiser avec un tableau vide
      }
    }
  },
  {
    id: 'association-warm',
    name: 'Association Caritative',
    description: 'Design chaleureux pour associations d\'entraide et de solidarité',
    category: 'association',
    preview: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2874',
    icon: <Heart className="h-5 w-5" />,
    features: ['Campagnes de dons', 'Témoignages', 'Blog', 'Bénévolat'],
    data: {
      hero: {
        title: 'Association d\'Entraide',
        subtitle: 'Ensemble, construisons un monde meilleur'
      },
      events: {
        enabled: false,
        title: 'Événements',
        items: []
      }
    }
  },
  {
    id: 'school-education',
    name: 'École & Éducation',
    description: 'Template pour écoles et institutions éducatives',
    category: 'school',
    preview: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2832',
    icon: <School className="h-5 w-5" />,
    features: ['Programmes', 'Inscriptions', 'Calendrier scolaire', 'Espace parents'],
    data: {
      hero: {
        title: 'École Beth Hanna',
        subtitle: 'L\'excellence dans l\'éducation juive'
      },
      events: {
        enabled: false,
        title: 'Événements',
        items: []
      }
    }
  }
];

interface TemplateManagerProps {
  tenant?: any;
  onSave?: (templateData: any) => void;
}

export function TemplateManager({ tenant: tenantProp, onSave }: TemplateManagerProps) {
  const contextTenant = useTenant();
  const tenant = tenantProp || contextTenant.tenant;
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [templateData, setTemplateData] = useState<any>({});
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger le template actuel du tenant ou sélectionner le premier par défaut
    if (tenant?.templateId) {
      const template = templates.find(t => t.id === tenant.templateId);
      if (template) {
        setSelectedTemplate(template);
        setTemplateData(tenant.templateData || template.data);
      }
    } else if (templates.length > 0 && !selectedTemplate) {
      // Sélectionner le premier template par défaut si aucun n'est défini
      setSelectedTemplate(templates[0]);
      setTemplateData(templates[0].data);
    }
  }, [tenant]);

  const handleSelectTemplate = (template: TemplateConfig) => {
    setSelectedTemplate(template);
    setTemplateData(template.data);
  };

  const handleSaveTemplate = async () => {
    console.log('handleSaveTemplate called', { selectedTemplate, tenant, templateData });
    
    if (!selectedTemplate) {
      console.error('No template selected');
      toast.error('Veuillez sélectionner un template');
      return;
    }
    
    if (!tenant?.id) {
      console.error('No tenant ID');
      toast.error('Erreur: Tenant non trouvé');
      return;
    }

    setLoading(true);
    try {
      // Utiliser getAuthHeaders pour obtenir les headers d'authentification corrects
      const authHeaders = getAuthHeaders();
      
      // Sauvegarder via l'API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenant.id}/template`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          templateData: templateData
        })
      });

      if (response.ok) {
        toast.success('Template sauvegardé avec succès');
        if (onSave) onSave({ templateId: selectedTemplate.id, templateData });
      } else {
        // Log the error details for debugging
        const errorText = await response.text();
        console.error('Save template error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else {
          throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur lors de la sauvegarde'}`);
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du template');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateTemplateData = (path: string, value: any) => {
    const keys = path.split('.');
    const newData = { ...templateData };
    let current = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setTemplateData(newData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion du Template</h2>
          <p className="text-gray-600">Choisissez et personnalisez le design de votre site</p>
        </div>
        <div className="flex gap-2">
          {selectedTemplate && (
            <>
              <Button
                variant="outline"
                onClick={() => setPreviewMode(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={loading}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Sauvegarde...' : 'Enregistrer'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="selection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="selection">
            <Layout className="h-4 w-4 mr-2" />
            Sélection
          </TabsTrigger>
          <TabsTrigger value="content" disabled={!selectedTemplate}>
            <Type className="h-4 w-4 mr-2" />
            Contenu
          </TabsTrigger>
          <TabsTrigger value="style" disabled={!selectedTemplate}>
            <Palette className="h-4 w-4 mr-2" />
            Style
          </TabsTrigger>
          <TabsTrigger value="advanced" disabled={!selectedTemplate}>
            <Code className="h-4 w-4 mr-2" />
            Avancé
          </TabsTrigger>
        </TabsList>

        {/* Tab: Sélection du template */}
        <TabsContent value="selection" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <Badge className="bg-blue-600 text-white">Sélectionné</Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {template.icon}
                        {template.name}
                      </CardTitle>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Contenu */}
        <TabsContent value="content" className="space-y-6">
          {selectedTemplate && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section Hero */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Hero</CardTitle>
                  <CardDescription>Personnalisez la section d'accueil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Titre principal</Label>
                    <Input
                      value={templateData.hero?.title || ''}
                      onChange={(e) => updateTemplateData('hero.title', e.target.value)}
                      placeholder="Titre de votre site"
                    />
                  </div>
                  <div>
                    <Label>Sous-titre</Label>
                    <Textarea
                      value={templateData.hero?.subtitle || ''}
                      onChange={(e) => updateTemplateData('hero.subtitle', e.target.value)}
                      placeholder="Description courte"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Image de fond (URL)</Label>
                    <Input
                      value={templateData.hero?.backgroundImage || ''}
                      onChange={(e) => updateTemplateData('hero.backgroundImage', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section Prières (pour synagogue) */}
              {selectedTemplate.category === 'synagogue' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Horaires de Prières</CardTitle>
                    <CardDescription>Configurez les horaires des offices</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Afficher cette section</Label>
                      <Switch
                        checked={templateData.prayers?.enabled || false}
                        onCheckedChange={(checked) => updateTemplateData('prayers.enabled', checked)}
                      />
                    </div>
                    <div>
                      <Label>Titre de la section</Label>
                      <Input
                        value={templateData.prayers?.title || ''}
                        onChange={(e) => updateTemplateData('prayers.title', e.target.value)}
                        placeholder="Horaires des Offices"
                      />
                    </div>
                    <div>
                      <Label>Adresse de la synagogue</Label>
                      <Input
                        value={templateData.prayers?.location || ''}
                        onChange={(e) => updateTemplateData('prayers.location', e.target.value)}
                        placeholder="123 Rue de la Paix, 75001 Paris"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section Événements */}
              <Card>
                <CardHeader>
                  <CardTitle>Événements</CardTitle>
                  <CardDescription>Gérez la section événements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Afficher cette section</Label>
                    <Switch
                      checked={templateData.events?.enabled || false}
                      onCheckedChange={(checked) => updateTemplateData('events.enabled', checked)}
                    />
                  </div>
                  <div>
                    <Label>Titre de la section</Label>
                    <Input
                      value={templateData.events?.title || ''}
                      onChange={(e) => updateTemplateData('events.title', e.target.value)}
                      placeholder="Événements à venir"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de Contact</CardTitle>
                  <CardDescription>Vos coordonnées</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Afficher cette section</Label>
                    <Switch
                      checked={templateData.contact?.enabled || false}
                      onCheckedChange={(checked) => updateTemplateData('contact.enabled', checked)}
                    />
                  </div>
                  <div>
                    <Label>Adresse</Label>
                    <Input
                      value={templateData.contact?.address || ''}
                      onChange={(e) => updateTemplateData('contact.address', e.target.value)}
                      placeholder="Votre adresse"
                    />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input
                      value={templateData.contact?.phone || ''}
                      onChange={(e) => updateTemplateData('contact.phone', e.target.value)}
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={templateData.contact?.email || ''}
                      onChange={(e) => updateTemplateData('contact.email', e.target.value)}
                      placeholder="contact@exemple.fr"
                      type="email"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab: Style */}
        <TabsContent value="style" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personnalisation visuelle</CardTitle>
              <CardDescription>Ajustez les couleurs et le style</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Options de style disponibles prochainement...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Avancé */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Éditeur JSON</CardTitle>
              <CardDescription>Modifiez directement les données du template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-green-400 text-sm font-mono">
                  {JSON.stringify(templateData, null, 2)}
                </pre>
              </div>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setEditMode(!editMode)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {editMode ? 'Mode visuel' : 'Mode code'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {previewMode && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Aperçu du template</h3>
              <Button
                variant="ghost"
                onClick={() => setPreviewMode(false)}
              >
                ✕
              </Button>
            </div>
            <div className="h-full overflow-y-auto">
              <iframe
                src={`/fr/demo-template/synagogue?data=${encodeURIComponent(JSON.stringify(templateData))}`}
                className="w-full h-full"
                title="Template Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
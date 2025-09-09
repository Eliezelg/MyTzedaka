'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Copy, 
  Move, 
  Settings,
  Save,
  ArrowUp,
  ArrowDown,
  Columns,
  Type,
  Image,
  Video,
  Code,
  Clock,
  Calendar,
  Star,
  Heart,
  CreditCard,
  Loader2
} from 'lucide-react';
// Drag and drop will be implemented without external library
import toast from 'react-hot-toast';

interface Widget {
  id: string;
  widgetType: string;
  position: number;
  column: number;
  config: any;
  title?: string;
  showTitle: boolean;
  cssClass?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  isVisible: boolean;
}

interface WidgetType {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requiresModule?: string;
}

interface PageBuilderProps {
  pageId: string;
  tenantId: string;
  enabledModules?: string[];
}

const iconMap: Record<string, any> = {
  clock: Clock,
  calendar: Calendar,
  star: Star,
  heart: Heart,
  'credit-card': CreditCard,
  type: Type,
  image: Image,
  video: Video,
  code: Code,
};

export function PageBuilder({ pageId, tenantId, enabledModules = [] }: PageBuilderProps) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [availableTypes, setAvailableTypes] = useState<WidgetType[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [layout, setLayout] = useState('single-column');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('widgets');

  useEffect(() => {
    loadPageData();
    loadWidgetTypes();
  }, [pageId]);

  const loadPageData = async () => {
    try {
      // Charger la page et ses widgets
      const response = await fetch(`/api/admin/pages/${pageId}/widgets`);
      if (response.ok) {
        const data = await response.json();
        setWidgets(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement de la page');
    } finally {
      setLoading(false);
    }
  };

  const loadWidgetTypes = async () => {
    try {
      const response = await fetch(`/api/admin/pages/${pageId}/widgets/types`);
      if (response.ok) {
        const types = await response.json();
        // Filtrer selon les modules activés
        const filtered = types.filter((type: WidgetType) => 
          !type.requiresModule || enabledModules.includes(type.requiresModule)
        );
        setAvailableTypes(filtered);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des types:', error);
    }
  };

  const handleAddWidget = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/pages/${pageId}/widgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetType: type })
      });

      if (response.ok) {
        const newWidget = await response.json();
        setWidgets([...widgets, newWidget]);
        toast.success('Widget ajouté');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout du widget');
    }
  };

  const handleUpdateWidget = async (widgetId: string, updates: Partial<Widget>) => {
    try {
      const response = await fetch(`/api/admin/pages/${pageId}/widgets/${widgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updated = await response.json();
        setWidgets(widgets.map(w => w.id === widgetId ? updated : w));
        toast.success('Widget mis à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm('Supprimer ce widget ?')) return;

    try {
      const response = await fetch(`/api/admin/pages/${pageId}/widgets/${widgetId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setWidgets(widgets.filter(w => w.id !== widgetId));
        toast.success('Widget supprimé');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDuplicateWidget = async (widgetId: string) => {
    try {
      const response = await fetch(`/api/admin/pages/${pageId}/widgets/${widgetId}/duplicate`, {
        method: 'POST'
      });

      if (response.ok) {
        const duplicated = await response.json();
        setWidgets([...widgets, duplicated]);
        toast.success('Widget dupliqué');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la duplication');
    }
  };

  const handleMoveUp = async (widgetId: string, currentPosition: number) => {
    if (currentPosition === 0) return;
    
    const newWidgets = [...widgets];
    const currentIndex = newWidgets.findIndex(w => w.id === widgetId);
    const targetIndex = currentIndex - 1;
    
    [newWidgets[currentIndex], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[currentIndex]];
    
    // Update positions
    newWidgets[currentIndex].position = currentIndex;
    newWidgets[targetIndex].position = targetIndex;
    
    setWidgets(newWidgets);
    await saveOrder(newWidgets);
  };

  const handleMoveDown = async (widgetId: string, currentPosition: number) => {
    if (currentPosition === widgets.length - 1) return;
    
    const newWidgets = [...widgets];
    const currentIndex = newWidgets.findIndex(w => w.id === widgetId);
    const targetIndex = currentIndex + 1;
    
    [newWidgets[currentIndex], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[currentIndex]];
    
    // Update positions
    newWidgets[currentIndex].position = currentIndex;
    newWidgets[targetIndex].position = targetIndex;
    
    setWidgets(newWidgets);
    await saveOrder(newWidgets);
  };

  const saveOrder = async (updatedWidgets: Widget[]) => {
    try {
      await fetch(`/api/admin/pages/${pageId}/widgets/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgets: updatedWidgets.map((w, index) => ({ 
            id: w.id, 
            position: index, 
            column: w.column 
          }))
        })
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const renderWidgetConfig = (widget: Widget) => {
    switch (widget.widgetType) {
      case 'zmanim':
        return (
          <div className="space-y-4">
            <div>
              <Label>Mode d'affichage</Label>
              <Select
                value={widget.config.displayMode}
                onValueChange={(value) => 
                  handleUpdateWidget(widget.id, { 
                    config: { ...widget.config, displayMode: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="detailed">Détaillé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Afficher tous les horaires</Label>
              <Switch
                checked={widget.config.showAllTimes}
                onCheckedChange={(checked) =>
                  handleUpdateWidget(widget.id, {
                    config: { ...widget.config, showAllTimes: checked }
                  })
                }
              />
            </div>
          </div>
        );

      case 'prayers':
        return (
          <div className="space-y-4">
            <div>
              <Label>Mode d'affichage</Label>
              <Select
                value={widget.config.displayMode}
                onValueChange={(value) => 
                  handleUpdateWidget(widget.id, { 
                    config: { ...widget.config, displayMode: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="full">Complet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Afficher planning hebdomadaire</Label>
              <Switch
                checked={widget.config.showWeekly}
                onCheckedChange={(checked) =>
                  handleUpdateWidget(widget.id, {
                    config: { ...widget.config, showWeekly: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Afficher prochaine prière</Label>
              <Switch
                checked={widget.config.showNextPrayer}
                onCheckedChange={(checked) =>
                  handleUpdateWidget(widget.id, {
                    config: { ...widget.config, showNextPrayer: checked }
                  })
                }
              />
            </div>
          </div>
        );

      case 'shabbat':
        return (
          <div className="space-y-4">
            <div>
              <Label>Mode d'affichage</Label>
              <Select
                value={widget.config.displayMode}
                onValueChange={(value) => 
                  handleUpdateWidget(widget.id, { 
                    config: { ...widget.config, displayMode: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inline">En ligne</SelectItem>
                  <SelectItem value="card">Carte</SelectItem>
                  <SelectItem value="banner">Bannière</SelectItem>
                  <SelectItem value="widget">Widget</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Afficher options multiples</Label>
              <Switch
                checked={widget.config.showMultipleOptions}
                onCheckedChange={(checked) =>
                  handleUpdateWidget(widget.id, {
                    config: { ...widget.config, showMultipleOptions: checked }
                  })
                }
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Contenu</Label>
              <Textarea
                value={widget.config.content}
                onChange={(e) =>
                  handleUpdateWidget(widget.id, {
                    config: { ...widget.config, content: e.target.value }
                  })
                }
                rows={5}
              />
            </div>
            <div>
              <Label>Alignement</Label>
              <Select
                value={widget.config.alignment}
                onValueChange={(value) => 
                  handleUpdateWidget(widget.id, { 
                    config: { ...widget.config, alignment: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                  <SelectItem value="justify">Justifié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Configuration non disponible</p>;
    }
  };

  const getWidgetIcon = (type: string) => {
    const widgetType = availableTypes.find(t => t.type === type);
    if (widgetType && iconMap[widgetType.icon]) {
      const Icon = iconMap[widgetType.icon];
      return <Icon className="h-4 w-4" />;
    }
    return <Code className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label>Layout</Label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-column">Une colonne</SelectItem>
                  <SelectItem value="two-columns">Deux colonnes</SelectItem>
                  <SelectItem value="three-columns">Trois colonnes</SelectItem>
                  <SelectItem value="sidebar-left">Sidebar gauche</SelectItem>
                  <SelectItem value="sidebar-right">Sidebar droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </Button>
              <Button size="sm" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Widget Library */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Widgets disponibles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableTypes.map((type) => (
                <Button
                  key={type.type}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => handleAddWidget(type.type)}
                >
                  {getWidgetIcon(type.type)}
                  <span className="ml-2">{type.name}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Widget List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Widgets de la page</CardTitle>
            </CardHeader>
            <CardContent>
              {widgets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun widget</p>
                  <p className="text-sm">Ajoutez des widgets depuis la bibliothèque</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {widgets.map((widget, index) => (
                    <div
                      key={widget.id}
                      className={`
                        border rounded-lg p-3 bg-card
                        ${!widget.isVisible ? 'opacity-50' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveUp(widget.id, index)}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveDown(widget.id, index)}
                              disabled={index === widgets.length - 1}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          {getWidgetIcon(widget.widgetType)}
                          <span className="font-medium">
                            {widget.title || availableTypes.find(t => t.type === widget.widgetType)?.name}
                          </span>
                          {!widget.isVisible && (
                            <Badge variant="secondary" className="text-xs">
                              Masqué
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedWidget(widget)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateWidget(widget.id, { isVisible: !widget.isVisible })}
                          >
                            {widget.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateWidget(widget.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWidget(widget.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Widget Settings */}
        <div className="lg:col-span-1">
          {selectedWidget ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Paramètres du widget</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="content">Contenu</TabsTrigger>
                    <TabsTrigger value="style">Style</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label>Titre</Label>
                      <Input
                        value={selectedWidget.title || ''}
                        onChange={(e) => 
                          handleUpdateWidget(selectedWidget.id, { title: e.target.value })
                        }
                        placeholder="Titre du widget"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Afficher le titre</Label>
                      <Switch
                        checked={selectedWidget.showTitle}
                        onCheckedChange={(checked) =>
                          handleUpdateWidget(selectedWidget.id, { showTitle: checked })
                        }
                      />
                    </div>
                    
                    {renderWidgetConfig(selectedWidget)}
                  </TabsContent>
                  
                  <TabsContent value="style" className="space-y-4">
                    <div>
                      <Label>Classe CSS</Label>
                      <Input
                        value={selectedWidget.cssClass || ''}
                        onChange={(e) => 
                          handleUpdateWidget(selectedWidget.id, { cssClass: e.target.value })
                        }
                        placeholder="custom-class"
                      />
                    </div>
                    
                    <div>
                      <Label>Couleur de fond</Label>
                      <Input
                        type="color"
                        value={selectedWidget.backgroundColor || '#ffffff'}
                        onChange={(e) => 
                          handleUpdateWidget(selectedWidget.id, { backgroundColor: e.target.value })
                        }
                      />
                    </div>
                    
                    <div>
                      <Label>Padding</Label>
                      <Input
                        value={selectedWidget.padding || ''}
                        onChange={(e) => 
                          handleUpdateWidget(selectedWidget.id, { padding: e.target.value })
                        }
                        placeholder="10px 20px"
                      />
                    </div>
                    
                    <div>
                      <Label>Margin</Label>
                      <Input
                        value={selectedWidget.margin || ''}
                        onChange={(e) => 
                          handleUpdateWidget(selectedWidget.id, { margin: e.target.value })
                        }
                        placeholder="10px 0"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Sélectionnez un widget pour le configurer</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
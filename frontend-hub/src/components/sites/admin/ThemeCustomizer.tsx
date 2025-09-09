'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Type, 
  Layout, 
  Save, 
  RotateCcw, 
  Eye,
  Download,
  Upload,
  Check,
  X
} from 'lucide-react';
import { 
  ThemeConfig, 
  presetThemes, 
  applyTheme, 
  generateCSSVariables 
} from '@/lib/theme/theme-engine';
import { useTenant } from '@/providers/tenant-provider';

export function ThemeCustomizer() {
  const { tenant } = useTenant();
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(presetThemes.modern);
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Charger le thème actuel du tenant ou utiliser le thème par défaut
    if (tenant?.theme && typeof tenant.theme === 'object') {
      // Fusionner avec le thème par défaut pour s'assurer que toutes les propriétés existent
      const mergedTheme = {
        ...presetThemes.modern,
        ...tenant.theme,
        colors: {
          ...presetThemes.modern.colors,
          ...(tenant.theme.colors || {})
        },
        typography: {
          ...presetThemes.modern.typography,
          ...(tenant.theme.typography || {})
        },
        layout: {
          ...presetThemes.modern.layout,
          ...(tenant.theme.layout || {})
        }
      };
      setCurrentTheme(mergedTheme as ThemeConfig);
    } else {
      // Utiliser le thème par défaut si aucun thème n'est défini
      setCurrentTheme(presetThemes.modern);
    }
  }, [tenant]);

  const handleColorChange = (category: string, key: string, value: string) => {
    setCurrentTheme(prev => ({
      ...prev,
      colors: {
        ...(prev?.colors || presetThemes.modern.colors),
        [key]: value
      }
    }));
    setIsDirty(true);
    setSelectedPreset('custom');
  };

  const handleTypographyChange = (category: string, key: string, value: any) => {
    setCurrentTheme(prev => {
      const prevTypography = prev?.typography || presetThemes.modern.typography;
      return {
        ...prev,
        typography: {
          ...prevTypography,
          [category]: {
            ...(prevTypography[category as keyof typeof prevTypography] || {}),
            [key]: value
          }
        }
      };
    });
    setIsDirty(true);
    setSelectedPreset('custom');
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = presetThemes[presetName];
    if (preset) {
      setCurrentTheme(preset);
      setSelectedPreset(presetName);
      setIsDirty(true);
      
      if (previewMode) {
        applyTheme(preset);
      }
    }
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode && currentTheme) {
      applyTheme(currentTheme);
    } else if (previewMode) {
      // Restaurer le thème original
      if (tenant?.theme && typeof tenant.theme === 'object') {
        // Fusionner avec le thème par défaut pour assurer la compatibilité
        const restoredTheme = {
          ...presetThemes.modern,
          ...tenant.theme
        };
        applyTheme(restoredTheme);
      } else {
        applyTheme(presetThemes.modern);
      }
    }
  };

  const handleSave = async () => {
    if (!tenant?.id || !currentTheme) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${tenant.id}/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentTheme)
      });

      if (response.ok) {
        setIsDirty(false);
        applyTheme(currentTheme);
        // TODO: Show success toast
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      // TODO: Show error toast
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultTheme = presetThemes.modern;
    setCurrentTheme(defaultTheme);
    setSelectedPreset('modern');
    setIsDirty(false);
    if (previewMode) {
      applyTheme(defaultTheme);
    }
  };

  const handleExport = () => {
    if (!currentTheme || !tenant?.slug) return;
    
    const dataStr = JSON.stringify(currentTheme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `theme-${tenant.slug}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const theme = JSON.parse(e.target?.result as string);
          setCurrentTheme(theme);
          setSelectedPreset('custom');
          setIsDirty(true);
        } catch (error) {
          console.error('Invalid theme file');
          // TODO: Show error toast
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Personnalisation du Thème</h2>
          <p className="text-gray-600">Personnalisez l'apparence de votre site</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            className={previewMode ? 'bg-primary text-white' : ''}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Arrêter' : 'Prévisualiser'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {isDirty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ Vous avez des modifications non enregistrées
          </p>
        </div>
      )}

      {/* Preset Themes */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold mb-4">Thèmes Prédéfinis</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(presetThemes).map(([name, theme]) => (
            <button
              key={name}
              onClick={() => handlePresetSelect(name)}
              className={`p-4 border-2 rounded-lg transition-all ${
                selectedPreset === name 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{name}</span>
                {selectedPreset === name && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex gap-2">
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: theme?.colors?.primary || '#3B82F6' }}
                />
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: theme?.colors?.secondary || '#8B5CF6' }}
                />
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: theme?.colors?.accent || '#10B981' }}
                />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Customization Tabs */}
      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Couleurs
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typographie
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Mise en page
          </TabsTrigger>
          <TabsTrigger value="advanced">
            Import/Export
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Palette de Couleurs</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Couleurs Principales</h4>
                <div className="space-y-4">
                  {currentTheme?.colors && Object.entries(currentTheme.colors).slice(0, 7).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <Label htmlFor={key} className="w-32 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          id={key}
                          type="color"
                          value={value}
                          onChange={(e) => handleColorChange('colors', key, e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={value}
                          onChange={(e) => handleColorChange('colors', key, e.target.value)}
                          className="flex-1"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Couleurs Sémantiques</h4>
                <div className="space-y-4">
                  {currentTheme?.colors && ['success', 'warning', 'error', 'info'].map(key => (
                    <div key={key} className="flex items-center gap-3">
                      <Label htmlFor={key} className="w-32 capitalize">
                        {key}
                      </Label>
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          id={key}
                          type="color"
                          value={currentTheme?.colors?.[key as keyof typeof currentTheme.colors] || '#000000'}
                          onChange={(e) => handleColorChange('colors', key, e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={currentTheme?.colors?.[key as keyof typeof currentTheme.colors] || ''}
                          onChange={(e) => handleColorChange('colors', key, e.target.value)}
                          className="flex-1"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Typographie</h3>
            
            <div className="space-y-6">
              {/* Font Families */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Polices</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="font-sans">Police principale</Label>
                    <Input
                      id="font-sans"
                      value={currentTheme?.typography?.fontFamily?.sans || ''}
                      onChange={(e) => handleTypographyChange('fontFamily', 'sans', e.target.value)}
                      placeholder="Inter, sans-serif"
                    />
                  </div>
                  <div>
                    <Label htmlFor="font-hebrew">Police hébraïque</Label>
                    <Input
                      id="font-hebrew"
                      value={currentTheme?.typography?.fontFamily?.hebrew || ''}
                      onChange={(e) => handleTypographyChange('fontFamily', 'hebrew', e.target.value)}
                      placeholder="David Libre, serif"
                    />
                  </div>
                </div>
              </div>

              {/* Font Sizes */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tailles</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="font-base">Taille de base</Label>
                    <Input
                      id="font-base"
                      value={currentTheme?.typography?.fontSize?.base || '16px'}
                      onChange={(e) => handleTypographyChange('fontSize', 'base', e.target.value)}
                      placeholder="16px"
                    />
                  </div>
                  <div>
                    <Label htmlFor="font-scale">Échelle</Label>
                    <Input
                      id="font-scale"
                      type="number"
                      step="0.05"
                      value={currentTheme?.typography?.fontSize?.scale || 1.25}
                      onChange={(e) => handleTypographyChange('fontSize', 'scale', parseFloat(e.target.value))}
                      placeholder="1.25"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Mise en Page</h3>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="max-width">Largeur maximale</Label>
                <Input
                  id="max-width"
                  value={currentTheme?.layout?.maxWidth || '1280px'}
                  onChange={(e) => setCurrentTheme(prev => ({
                    ...prev,
                    layout: { ...(prev?.layout || {}), maxWidth: e.target.value }
                  }))}
                  placeholder="1280px"
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Arrondis des coins</h4>
                <div className="grid grid-cols-3 gap-4">
                  {currentTheme?.layout?.borderRadius && Object.entries(currentTheme.layout.borderRadius).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={`radius-${key}`} className="capitalize">
                        {key}
                      </Label>
                      <Input
                        id={`radius-${key}`}
                        value={value}
                        onChange={(e) => setCurrentTheme(prev => ({
                          ...prev,
                          layout: {
                            ...(prev?.layout || {}),
                            borderRadius: {
                              ...(prev?.layout?.borderRadius || {}),
                              [key]: e.target.value
                            }
                          }
                        }))}
                        placeholder="0.5rem"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="advanced">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Import/Export</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Exporter le thème</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Téléchargez votre configuration de thème actuelle au format JSON
                </p>
                <Button onClick={handleExport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter le thème
                </Button>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Importer un thème</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Chargez un fichier de configuration de thème JSON
                </p>
                <div>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="theme-import"
                  />
                  <Label htmlFor="theme-import" className="cursor-pointer">
                    <Button variant="outline" type="button" onClick={() => document.getElementById('theme-import')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Importer un thème
                    </Button>
                  </Label>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Code CSS généré</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                  {currentTheme ? generateCSSVariables(currentTheme) : '/* No theme configured */'}
                </pre>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
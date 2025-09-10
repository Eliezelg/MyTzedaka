'use client'

import React, { useState, useEffect } from 'react'
import { useTenant } from '@/providers/tenant-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Palette, Save, RotateCcw, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderRadius: string
  fontFamily: string
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  borderRadius: '0.5rem',
  fontFamily: 'Inter, sans-serif'
}

const PRESET_THEMES = [
  {
    name: 'Bleu Classique',
    config: {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      borderRadius: '0.5rem',
      fontFamily: 'Inter, sans-serif'
    }
  },
  {
    name: 'Vert Nature',
    config: {
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      accentColor: '#fbbf24',
      backgroundColor: '#ffffff',
      textColor: '#064e3b',
      borderRadius: '0.75rem',
      fontFamily: 'Inter, sans-serif'
    }
  },
  {
    name: 'Violet Élégant',
    config: {
      primaryColor: '#7c3aed',
      secondaryColor: '#a78bfa',
      accentColor: '#ec4899',
      backgroundColor: '#faf5ff',
      textColor: '#581c87',
      borderRadius: '1rem',
      fontFamily: 'Inter, sans-serif'
    }
  },
  {
    name: 'Minimaliste',
    config: {
      primaryColor: '#000000',
      secondaryColor: '#525252',
      accentColor: '#ef4444',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderRadius: '0',
      fontFamily: 'Inter, sans-serif'
    }
  }
]

export function ThemeCustomizer() {
  const { tenant } = useTenant()
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME)
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load current theme from backend
  useEffect(() => {
    const loadTheme = async () => {
      if (!tenant?.id) return
      
      try {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/theme`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data && Object.keys(data).length > 0) {
            setTheme(data as ThemeConfig)
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTheme()
  }, [tenant])

  useEffect(() => {
    if (isPreview) {
      applyTheme(theme)
    } else {
      applyTheme(DEFAULT_THEME)
    }
  }, [theme, isPreview])

  const applyTheme = (config: ThemeConfig) => {
    const root = document.documentElement
    root.style.setProperty('--primary-color', config.primaryColor)
    root.style.setProperty('--secondary-color', config.secondaryColor)
    root.style.setProperty('--accent-color', config.accentColor)
    root.style.setProperty('--background-color', config.backgroundColor)
    root.style.setProperty('--text-color', config.textColor)
    root.style.setProperty('--border-radius', config.borderRadius)
    root.style.setProperty('--font-family', config.fontFamily)
  }

  const handleColorChange = (key: keyof ThemeConfig, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }))
  }

  const handlePresetSelect = (preset: typeof PRESET_THEMES[0]) => {
    setTheme(preset.config)
    toast.success(`Thème "${preset.name}" appliqué`)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/theme`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ theme })
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }

      toast.success('Thème sauvegardé avec succès')
      setIsPreview(false)
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du thème')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setTheme(DEFAULT_THEME)
    setIsPreview(false)
    toast.info('Thème réinitialisé')
  }

  const togglePreview = () => {
    setIsPreview(!isPreview)
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-500">Chargement du thème...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Personnalisation du thème
        </h1>
        <p className="text-gray-600">
          Personnalisez l'apparence de votre site pour qu'il corresponde à votre identité visuelle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Theme Presets */}
        <Card>
          <CardHeader>
            <CardTitle>Thèmes prédéfinis</CardTitle>
            <CardDescription>
              Choisissez un thème de base à personnaliser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PRESET_THEMES.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handlePresetSelect(preset)}
              >
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: preset.config.primaryColor }}
                />
                {preset.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Color Customization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Couleurs personnalisées</CardTitle>
            <CardDescription>
              Ajustez les couleurs de votre site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary-color">Couleur principale</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondary-color">Couleur secondaire</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accent-color">Couleur d'accent</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bg-color">Couleur de fond</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Typography Settings */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Typographie</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="border-radius">Arrondi des coins</Label>
                  <Input
                    id="border-radius"
                    type="text"
                    value={theme.borderRadius}
                    onChange={(e) => handleColorChange('borderRadius', e.target.value)}
                    className="mt-2"
                    placeholder="0.5rem"
                  />
                </div>
                <div>
                  <Label htmlFor="font-family">Police</Label>
                  <select
                    id="font-family"
                    value={theme.fontFamily}
                    onChange={(e) => handleColorChange('fontFamily', e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Inter, sans-serif">Inter (Moderne)</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Open Sans, sans-serif">Open Sans</option>
                    <option value="Playfair Display, serif">Playfair (Élégant)</option>
                    <option value="Montserrat, sans-serif">Montserrat</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={togglePreview}
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                {isPreview ? "Arrêter l'aperçu" : 'Aperçu'}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      {isPreview && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Aperçu en direct</CardTitle>
            <CardDescription>
              Les modifications sont appliquées en temps réel sur votre site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-6 rounded-lg">
              <div 
                className="p-6 rounded-lg shadow-md"
                style={{
                  backgroundColor: theme.backgroundColor,
                  borderRadius: theme.borderRadius,
                  fontFamily: theme.fontFamily
                }}
              >
                <h2 
                  className="text-2xl font-bold mb-3"
                  style={{ color: theme.primaryColor }}
                >
                  Titre d'exemple
                </h2>
                <p style={{ color: theme.textColor }}>
                  Voici à quoi ressemblera votre contenu avec le thème sélectionné.
                </p>
                <div className="flex gap-3 mt-4">
                  <button
                    className="px-4 py-2 text-white rounded"
                    style={{
                      backgroundColor: theme.primaryColor,
                      borderRadius: theme.borderRadius
                    }}
                  >
                    Bouton principal
                  </button>
                  <button
                    className="px-4 py-2 text-white rounded"
                    style={{
                      backgroundColor: theme.secondaryColor,
                      borderRadius: theme.borderRadius
                    }}
                  >
                    Bouton secondaire
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
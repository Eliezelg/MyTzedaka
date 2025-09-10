'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeCustomizer } from '@/components/tenant/theme-customizer'
import { ContentManager } from '@/components/tenant/content-manager'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Palette, FileText, Globe, Menu, Image } from 'lucide-react'
import Link from 'next/link'

export default function SiteSettingsPage() {
  const params = useParams()
  const slug = params.slug as string

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={`/t/${slug}/dashboard`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                <h1 className="text-xl font-semibold">Gestion du site</h1>
              </div>
            </div>
            <Button asChild>
              <Link href={`/t/${slug}`} target="_blank">
                <Globe className="h-4 w-4 mr-2" />
                Voir le site
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Thème</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Pages</span>
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline">Navigation</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Médias</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>

          {/* Theme Tab */}
          <TabsContent value="theme">
            <ThemeCustomizer />
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages">
            <ContentManager />
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation">
            <Card>
              <CardHeader>
                <CardTitle>Menu de navigation</CardTitle>
                <CardDescription>
                  Configurez les menus de navigation de votre site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Menu principal</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Accueil</span>
                        <span className="text-xs">/ </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Faire un don</span>
                        <span className="text-xs">/donate</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Campagnes</span>
                        <span className="text-xs">/campaigns</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>À propos</span>
                        <span className="text-xs">/about</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      Modifier le menu
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Bibliothèque de médias</CardTitle>
                <CardDescription>
                  Gérez les images et fichiers de votre site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                    <div className="text-center">
                      <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-xs text-gray-500">Ajouter</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>
                    Paramètres de base de votre site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nom de l'association</label>
                    <input 
                      type="text" 
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      defaultValue="Association Test"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL du site</label>
                    <input 
                      type="text" 
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-50"
                      value={`mytzedaka.com/t/${slug}`}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email de contact</label>
                    <input 
                      type="email" 
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      defaultValue="contact@test-asso.org"
                    />
                  </div>
                  <Button>Enregistrer les modifications</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO & Métadonnées</CardTitle>
                  <CardDescription>
                    Optimisez votre site pour les moteurs de recherche
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Titre du site</label>
                    <input 
                      type="text" 
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="Association Test - Site officiel"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea 
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      rows={3}
                      placeholder="Description de votre association pour les moteurs de recherche..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mots-clés</label>
                    <input 
                      type="text" 
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="association, don, charité, solidarité"
                    />
                  </div>
                  <Button>Mettre à jour le SEO</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
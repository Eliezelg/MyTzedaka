'use client'

import React, { useState } from 'react'
import { useTenant } from '@/providers/tenant-provider'
// import { ThemeCustomizer } from '@/components/tenant/theme-customizer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Palette, 
  FileText, 
  Users, 
  BarChart3,
  Globe,
  Shield,
  Eye,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export function TenantAdminDashboard() {
  const { tenant } = useTenant()
  const [activeTab, setActiveTab] = useState('overview')

  const stats = {
    totalDonations: 145200,
    donorsCount: 342,
    campaignsActive: 3,
    pageViews: 12543
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Administration - {tenant.name}
            </h1>
            <p className="text-gray-600">
              Gérez votre site et suivez vos performances
            </p>
          </div>
          <div className="flex gap-3">
            <Link href={`/t/${tenant.slug}`} target="_blank">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Voir le site
              </Button>
            </Link>
            <Link href={`/associations/${tenant.slug}/dashboard`}>
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Dashboard Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total collecté</p>
                <p className="text-2xl font-bold">
                  {formatAmount(stats.totalDonations)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Donateurs</p>
                <p className="text-2xl font-bold">{stats.donorsCount}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campagnes actives</p>
                <p className="text-2xl font-bold">{stats.campaignsActive}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vues ce mois</p>
                <p className="text-2xl font-bold">
                  {stats.pageViews.toLocaleString()}
                </p>
              </div>
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="theme">Apparence</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Accédez rapidement aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Créer une nouvelle campagne
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les donateurs
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Palette className="mr-2 h-4 w-4" />
                  Personnaliser le thème
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres du site
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>
                  Dernières actions sur votre site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveau don</p>
                      <p className="text-sm text-gray-600">100€ - Il y a 2 heures</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Campagne mise à jour</p>
                      <p className="text-sm text-gray-600">Il y a 5 heures</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveau donateur inscrit</p>
                      <p className="text-sm text-gray-600">Il y a 1 jour</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="theme" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personnalisation du thème</CardTitle>
              <CardDescription>
                Cette fonctionnalité sera bientôt disponible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Vous pourrez bientôt personnaliser les couleurs et l'apparence de votre site.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion du contenu</CardTitle>
              <CardDescription>
                Créez et modifiez les pages de votre site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Page d'accueil</h3>
                      <p className="text-sm text-gray-600">Dernière modification: Il y a 3 jours</p>
                    </div>
                    <Button size="sm">Modifier</Button>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">À propos</h3>
                      <p className="text-sm text-gray-600">Dernière modification: Il y a 1 semaine</p>
                    </div>
                    <Button size="sm">Modifier</Button>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Contact</h3>
                      <p className="text-sm text-gray-600">Dernière modification: Il y a 2 semaines</p>
                    </div>
                    <Button size="sm">Modifier</Button>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Créer une nouvelle page
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Paramètres de base de votre organisation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nom de l'organisation</Label>
                  <Input value={tenant.name} className="mt-2" />
                </div>
                <div>
                  <Label>Email de contact</Label>
                  <Input type="email" placeholder="contact@example.com" className="mt-2" />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input type="tel" placeholder="+33 1 23 45 67 89" className="mt-2" />
                </div>
                <Button>Sauvegarder</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Authentification à deux facteurs</p>
                    <p className="text-sm text-gray-600">Protégez votre compte</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Configurer
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Clés API</p>
                    <p className="text-sm text-gray-600">Gérez vos intégrations</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Gérer
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Historique des connexions</p>
                    <p className="text-sm text-gray-600">Consultez l'activité</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Missing imports - adding them
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
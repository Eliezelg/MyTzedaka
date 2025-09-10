'use client'

import { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignManager } from '@/components/tenant/campaign-manager'
import { DonationTracker } from '@/components/tenant/donation-tracker'
import { Button } from '@/components/ui/button'
import { 
  Target, 
  Heart, 
  Calendar, 
  Users, 
  Moon,
  Sun,
  Clock,
  Bell,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Settings,
  Home,
  Globe
} from 'lucide-react'
import Link from 'next/link'

interface AssociationDashboardProps {
  slug: string
  isHub?: boolean
  headerActions?: ReactNode
  additionalTabs?: ReactNode
  stats?: {
    totalDonations: number
    monthlyDonations: number
    activeCampaigns: number
    totalMembers: number
    upcomingEvents: number
  }
}

export function AssociationDashboard({ 
  slug, 
  isHub = false,
  headerActions,
  additionalTabs,
  stats = {
    totalDonations: 125340,
    monthlyDonations: 15200,
    activeCampaigns: 3,
    totalMembers: 456,
    upcomingEvents: 5
  }
}: AssociationDashboardProps) {
  
  const baseUrl = isHub ? `/associations/${slug}` : `/t/${slug}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Home className="h-5 w-5 text-gray-500" />
              <h1 className="text-xl font-semibold">
                Dashboard {isHub ? 'Hub' : 'Association'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {headerActions || (
                <>
                  {!isHub && (
                    <Button variant="outline" asChild>
                      <Link href={`${baseUrl}/site-settings`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Gérer le site
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" asChild>
                    <Link href={isHub ? `/associations/${slug}` : baseUrl} target="_blank">
                      <Globe className="h-4 w-4 mr-2" />
                      Voir {isHub ? 'la page' : 'le site'}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total collecté
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.totalDonations)}
              </div>
              <p className="text-xs text-green-600 mt-1">+12% ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Dons ce mois
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.monthlyDonations)}
              </div>
              <p className="text-xs text-gray-500 mt-1">42 donateurs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Campagnes actives
                </CardTitle>
                <Target className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
              <p className="text-xs text-gray-500 mt-1">2 en cours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Membres
                </CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-green-600 mt-1">+23 ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Événements
                </CardTitle>
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-gray-500 mt-1">À venir</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="donations">Dons</TabsTrigger>
            <TabsTrigger value="zmanim">Zmanim</TabsTrigger>
            <TabsTrigger value="prayers">Prières</TabsTrigger>
            <TabsTrigger value="events">Événements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                  <CardDescription>
                    Dernières actions sur votre association
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm">Nouveau don de 100€</p>
                        <p className="text-xs text-gray-500">Il y a 2 heures</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm">Nouvelle inscription: Sarah Cohen</p>
                        <p className="text-xs text-gray-500">Il y a 5 heures</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-purple-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm">Campagne "Rénovation" mise à jour</p>
                        <p className="text-xs text-gray-500">Hier</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                  <CardDescription>
                    Accès rapide aux fonctionnalités principales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Nouvelle campagne
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Créer un événement
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Inviter des membres
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Envoyer une newsletter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <CampaignManager />
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <DonationTracker />
          </TabsContent>

          {/* Zmanim Tab */}
          <TabsContent value="zmanim">
            <Card>
              <CardHeader>
                <CardTitle>Horaires de prières - Zmanim</CardTitle>
                <CardDescription>
                  Horaires halakhiques pour votre communauté
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Today's Times */}
                  <div>
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Aujourd'hui - {new Date().toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Aube (Alot)</p>
                        <p className="text-lg font-semibold">05:42</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Lever du soleil</p>
                        <p className="text-lg font-semibold">06:58</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Midi solaire</p>
                        <p className="text-lg font-semibold">12:45</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Mincha Guedola</p>
                        <p className="text-lg font-semibold">13:18</p>
                      </div>
                    </div>
                  </div>

                  {/* Shabbat Times */}
                  <div>
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Horaires de Chabbat
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-500 mb-2">Entrée de Chabbat (Vendredi)</p>
                        <p className="text-2xl font-bold">18:15</p>
                        <p className="text-sm text-gray-600 mt-1">Allumage des bougies</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-500 mb-2">Sortie de Chabbat (Samedi)</p>
                        <p className="text-2xl font-bold">19:26</p>
                        <p className="text-sm text-gray-600 mt-1">Havdala</p>
                      </div>
                    </div>
                  </div>

                  <Button>Configurer la localisation</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prayers Tab */}
          <TabsContent value="prayers">
            <Card>
              <CardHeader>
                <CardTitle>Horaires de prières</CardTitle>
                <CardDescription>
                  Organisez les offices de votre synagogue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Daily Prayers */}
                  <div>
                    <h3 className="font-medium mb-4">Offices quotidiens</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">Chaharit</p>
                            <p className="text-sm text-gray-500">Office du matin</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">07:00</p>
                          <p className="text-sm text-gray-500">Tous les jours</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Sun className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">Mincha</p>
                            <p className="text-sm text-gray-500">Office de l'après-midi</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">18:00</p>
                          <p className="text-sm text-gray-500">Variable selon saison</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Moon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">Arvit</p>
                            <p className="text-sm text-gray-500">Office du soir</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">19:30</p>
                          <p className="text-sm text-gray-500">Après les étoiles</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button>Modifier les horaires</Button>
                    <Button variant="outline">Envoyer aux membres</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Événements à venir</CardTitle>
                <CardDescription>
                  Gérez les événements de votre communauté
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Soirée de Gala annuelle</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Samedi 20 Avril 2024 - 20h00
                        </p>
                        <p className="text-sm mt-2">
                          Grande soirée de collecte de fonds avec dîner et spectacle.
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <span>📍 Salle des fêtes</span>
                          <span>👥 150 inscrits</span>
                          <span>🎫 75€/personne</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Gérer
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Créer un nouvel événement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional tabs from props */}
          {additionalTabs}
        </Tabs>
      </div>
    </div>
  )
}
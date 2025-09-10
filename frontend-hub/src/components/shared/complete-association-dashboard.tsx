'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CampaignManager } from '@/components/tenant/campaign-manager'
import { DonationTracker } from '@/components/tenant/donation-tracker'
import AssociationSettings from '@/components/associations/AssociationSettings'
import StripeStatusCard from '@/components/associations/stripe-status-card'
import { TaxReceiptsList } from '@/components/tax-receipts/tax-receipts-list'
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
  Globe,
  UserPlus,
  Mail,
  Shield,
  Receipt,
  Trash2,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface CompleteAssociationDashboardProps {
  slug: string
  isHub?: boolean
  association?: any
  user?: any
}

export function CompleteAssociationDashboard({ 
  slug, 
  isHub = false,
  association,
  user
}: CompleteAssociationDashboardProps) {
  
  const baseUrl = isHub ? `/associations/${slug}` : `/t/${slug}`
  
  // États pour la gestion des admins
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [admins, setAdmins] = useState([
    {
      id: '1',
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'Test',
      role: 'ADMIN',
      isCreator: true
    }
  ])
  
  // États pour les membres
  const [members] = useState([
    {
      id: '1',
      name: 'Sarah Cohen',
      email: 'sarah.cohen@email.com',
      role: 'MEMBER',
      joinedAt: '2024-01-15',
      donations: 5
    },
    {
      id: '2',
      name: 'David Levy',
      email: 'david.levy@email.com',
      role: 'DONOR',
      joinedAt: '2024-02-20',
      donations: 3
    }
  ])

  // Stats
  const stats = {
    totalDonations: association?.totalRaised || 125340,
    monthlyDonations: 15200,
    activeCampaigns: association?.campaignsCount || 3,
    totalMembers: 456,
    upcomingEvents: 5
  }

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return

    setIsAddingAdmin(true)
    try {
      // Simulation
      const newAdmin = {
        id: Date.now().toString(),
        email: newAdminEmail,
        firstName: 'Nouveau',
        lastName: 'Admin',
        role: 'MANAGER' as const,
        isCreator: false
      }
      
      setAdmins([...admins, newAdmin])
      setNewAdminEmail('')
      toast.success('Administrateur ajouté avec succès')
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l'administrateur")
    } finally {
      setIsAddingAdmin(false)
    }
  }

  const handleRemoveAdmin = (adminId: string) => {
    if (confirm('Êtes-vous sûr de vouloir retirer cet administrateur ?')) {
      setAdmins(admins.filter(a => a.id !== adminId))
      toast.success('Administrateur retiré')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Home className="h-5 w-5 text-gray-500" />
              <h1 className="text-xl font-semibold">
                Dashboard {association?.name || 'Association'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
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
                  Voir {isHub ? 'la page publique' : 'le site'}
                </Link>
              </Button>
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

      {/* Main Content avec TOUS les onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 h-auto p-1">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="donations">Dons</TabsTrigger>
            <TabsTrigger value="members">Membres</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="stripe">Stripe</TabsTrigger>
            <TabsTrigger value="receipts">Reçus</TabsTrigger>
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

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestion des membres
                </CardTitle>
                <CardDescription>
                  Liste et gestion des membres de votre association
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-800">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                          <div className="text-xs text-gray-400">
                            Membre depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR')} • {member.donations} dons
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{member.role}</Badge>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Ajouter un administrateur
                </CardTitle>
                <CardDescription>
                  Invitez un nouvel administrateur pour votre association
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="admin-email">Email de l'administrateur</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@exemple.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleAddAdmin}
                      disabled={isAddingAdmin || !newAdminEmail.trim()}
                    >
                      {isAddingAdmin ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Administrateurs actuels</CardTitle>
                <CardDescription>
                  Liste des administrateurs de votre association
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800">
                            {admin.firstName[0]}{admin.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{admin.firstName} {admin.lastName}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={admin.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {admin.role}
                        </Badge>
                        {admin.isCreator && (
                          <Badge variant="outline">Créateur</Badge>
                        )}
                        {!admin.isCreator && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveAdmin(admin.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {association ? (
              <AssociationSettings 
                association={association}
                onUpdate={(data) => {
                  toast.success('Paramètres mis à jour')
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de l'association</CardTitle>
                  <CardDescription>
                    Configurez les informations de base de votre association
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nom de l'association</Label>
                    <Input defaultValue={association?.name || "Association Test"} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" defaultValue={association?.email || "contact@test-asso.org"} />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input defaultValue={association?.phone || "01 23 45 67 89"} />
                  </div>
                  <Button>Enregistrer les modifications</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Stripe Tab */}
          <TabsContent value="stripe">
            {association ? (
              <StripeStatusCard association={association} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Configuration Stripe
                  </CardTitle>
                  <CardDescription>
                    Configurez votre compte Stripe pour recevoir des paiements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Stripe n'est pas encore configuré pour cette association.
                      </p>
                    </div>
                    <Button>
                      Connecter Stripe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Receipts Tab */}
          <TabsContent value="receipts" className="space-y-6">
            {association?.tenantId ? (
              <TaxReceiptsList mode="tenant" tenantId={association.tenantId} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Reçus fiscaux
                  </CardTitle>
                  <CardDescription>
                    Gérez et générez les reçus fiscaux pour vos donateurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Les reçus fiscaux seront disponibles une fois les donations enregistrées.
                  </p>
                </CardContent>
              </Card>
            )}
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
        </Tabs>
      </div>
    </div>
  )
}
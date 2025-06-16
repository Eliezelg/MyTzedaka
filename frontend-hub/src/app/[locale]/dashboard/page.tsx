'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useMyAssociations } from '@/hooks/useMyAssociations'
import { useDonationHistory } from '@/hooks/useDonations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Settings, LogOut, Heart, TrendingUp, Users, Calendar, Building } from 'lucide-react'

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth()
  const { data: myAssociations, isLoading: isLoadingAssociations, error } = useMyAssociations()
  const { data: donationHistory, isLoading: isLoadingDonations } = useDonationHistory()

  console.log('📊 Dashboard - État des associations:', {
    myAssociations,
    isLoadingAssociations,
    error,
    userId: user?.id
  })

  // Calculer les statistiques de dons
  const totalDonations = donationHistory?.reduce((sum, donation) => sum + donation.amount, 0) || 0
  const uniqueCampaigns = new Set(donationHistory?.map(d => d.campaignId)).size
  const recentDonations = donationHistory?.slice(0, 5) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const userId = user?.id

  // Si pas de userId, afficher un message ou rediriger
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Connexion requise</h1>
          <p className="text-gray-600">Vous devez être connecté pour accéder au dashboard</p>
          <div className="space-x-4">
            <Link href="/login">
              <Button>Se connecter</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Retour à l'accueil</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accès non autorisé</CardTitle>
            <CardDescription>Vous devez être connecté pour accéder à cette page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header du Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenue sur votre tableau de bord MyTzedaka
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <Badge variant="outline">
            {user.role === 'PLATFORM_ADMIN' ? 'Administrateur' : user.role === 'ASSOCIATION_ADMIN' ? 'Responsable' : 'Donateur'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des Dons
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingDonations ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${totalDonations.toLocaleString('fr-FR')} €`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {donationHistory?.length || 0} donation{(donationHistory?.length || 0) > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campagnes Soutenues
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingDonations ? (
                <span className="animate-pulse">...</span>
              ) : (
                uniqueCampaigns
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {uniqueCampaigns > 0 ? 'Campagne' + (uniqueCampaigns > 1 ? 's' : '') + ' soutenue' + (uniqueCampaigns > 1 ? 's' : '') : 'Aucune campagne pour le moment'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Associations Suivies
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myAssociations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isLoadingAssociations ? 'Chargement...' : (myAssociations?.length || 0) > 0 ? 'Afficher les associations' : 'Commencez à suivre des associations'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Depuis
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleDateString('fr-FR', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Date d'inscription
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Historique des Dons */}
      {recentDonations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Historique récent des dons</h2>
            <Link href="/donor-portal/history">
              <Button variant="outline" size="sm">
                Voir tout l'historique
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {donation.campaign?.associationListing?.name || 'Association inconnue'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {donation.campaign?.title || 'Campagne générale'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(donation.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {donation.amount.toLocaleString('fr-FR')} €
                      </p>
                      <Badge 
                        variant="outline" 
                        className={donation.status === 'COMPLETED' ? 'text-green-600 border-green-200' : 'text-yellow-600 border-yellow-200'}
                      >
                        {donation.status === 'COMPLETED' ? 'Complété' : 'En cours'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section Mes Associations */}
      {(myAssociations?.length || 0) > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Mes Associations</h2>
            <Link href="/associations/create">
              <Button size="sm">
                <Building className="mr-2 h-4 w-4" />
                Créer une nouvelle association
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAssociations?.map((userAssociation) => (
              <Card key={userAssociation.association.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{userAssociation.association.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {userAssociation.association.description || 'Pas de description'}
                      </CardDescription>
                    </div>
                    <Badge variant={userAssociation.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {userAssociation.role === 'ADMIN' ? 'Administrateur' : userAssociation.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p><strong>Email:</strong> {userAssociation.association.email}</p>
                    {userAssociation.association.phone && (
                      <p><strong>Téléphone:</strong> {userAssociation.association.phone}</p>
                    )}
                    {userAssociation.association.website && (
                      <p><strong>Site web:</strong> 
                        <a href={userAssociation.association.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                          {userAssociation.association.website}
                        </a>
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/associations/${userAssociation.tenant?.slug || userAssociation.association.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Voir les détails
                      </Button>
                    </Link>
                    {userAssociation.role === 'ADMIN' && userAssociation.tenant?.slug && (
                      <Link href={`/associations/${userAssociation.tenant.slug}/dashboard`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Gérer
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>
              Commencez votre expérience de don
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/associations">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Découvrir les Associations
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Explorer les Campagnes
              </Button>
            </Link>
            {(user.role === 'PLATFORM_ADMIN' || user.role === 'ASSOCIATION_ADMIN') && (
              <Link href="/associations/create">
                <Button className="w-full justify-start" variant="outline">
                  <Heart className="mr-2 h-4 w-4" />
                  Créer une Association
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profil Utilisateur</CardTitle>
            <CardDescription>
              Gérez vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Rôle</p>
              <Badge variant="secondary">
                {user.role === 'PLATFORM_ADMIN' ? 'Administrateur' : user.role === 'ASSOCIATION_ADMIN' ? 'Responsable d\'association' : 'Donateur'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Statut</p>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {'Email ' + (user.email ? 'vérifié' : 'non vérifié')}
              </Badge>
            </div>
            <Link href="/profile">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Modifier le Profil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Section Aide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Besoin d'aide ?</CardTitle>
          <CardDescription>
            Découvrez comment utiliser la plateforme MyTzedaka
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/help/getting-started">
              <Button variant="ghost" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <p className="font-medium">Guide de démarrage</p>
                  <p className="text-sm text-gray-600">Apprenez les bases</p>
                </div>
              </Button>
            </Link>
            <Link href="/help/donations">
              <Button variant="ghost" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <p className="font-medium">Comment donner</p>
                  <p className="text-sm text-gray-600">Processus de don</p>
                </div>
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <p className="font-medium">Nous contacter</p>
                  <p className="text-sm text-gray-600">Aide personnalisée</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

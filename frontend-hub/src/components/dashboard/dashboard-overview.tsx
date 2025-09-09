'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, TrendingUp, Users, Calendar, Building } from 'lucide-react'
import { useDonorProfile, useDonorHistory } from '@/hooks/use-donor-profile'
import { useMyAssociations } from '@/hooks/useMyAssociations'
import { useAuthContext } from '@/hooks/useAuthContext'

export function DashboardOverview() {
  const { user } = useAuthContext()
  const { data: myAssociations, isLoading: isLoadingAssociations } = useMyAssociations()
  
  // Hooks pour le profil donateur et l'historique
  const { data: donorProfile, isLoading: isLoadingProfile } = useDonorProfile(user?.email)
  const { data: donorHistory, isLoading: isLoadingDonations } = useDonorHistory(
    donorProfile?.id,
    { limit: 5 }
  )

  // Calculer les statistiques de dons à partir du donor portal
  const stats = donorHistory?.stats || {
    totalAmount: 0,
    totalDonations: 0,
    associationsCount: 0,
    averageDonation: 0
  }
  const recentDonations = donorHistory?.donations?.slice(0, 5) || []

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                `${stats.totalAmount.toLocaleString('fr-FR')} €`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDonations} donation{stats.totalDonations > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Don Moyen
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingDonations ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${stats.averageDonation.toLocaleString('fr-FR')} €`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Par donation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Associations Soutenues
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingDonations ? (
                <span className="animate-pulse">...</span>
              ) : (
                stats.associationsCount
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.associationsCount > 0 ? 'Via vos dons' : 'Commencez à donner'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dernier Don
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingDonations ? (
                <span className="animate-pulse">...</span>
              ) : recentDonations.length > 0 ? (
                new Date(recentDonations[0].createdAt).toLocaleDateString('fr-FR', { 
                  day: 'numeric',
                  month: 'short'
                })
              ) : (
                'Aucun'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {recentDonations.length > 0 ? 'Date du dernier don' : 'Pas encore de don'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Historique des Dons Récents */}
      {recentDonations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Historique récent des dons</h2>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span>💰</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {donation.tenant?.name || 'Association'}
                        </p>
                        {donation.campaign && (
                          <p className="text-sm text-gray-600">
                            Campagne: {donation.campaign.title}
                          </p>
                        )}
                        {donation.purpose && (
                          <p className="text-sm text-gray-500">
                            {donation.purpose}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(donation.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {donation.amount.toFixed(2)} €
                      </p>
                      <Badge 
                        variant={donation.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {donation.status === 'completed' ? 'Complété' : 'En cours'}
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
            {(user?.role === 'PLATFORM_ADMIN' || user?.role === 'ASSOCIATION_ADMIN') && (
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
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Rôle</p>
              <Badge variant="secondary">
                {user?.role === 'PLATFORM_ADMIN' ? 'Administrateur' : user?.role === 'ASSOCIATION_ADMIN' ? 'Responsable d\'association' : 'Donateur'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Statut</p>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {'Email ' + (user?.email ? 'vérifié' : 'non vérifié')}
              </Badge>
            </div>
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
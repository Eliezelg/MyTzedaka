'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useDonorProfile, useDonorHistory } from '@/hooks/use-donor-profile'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface DonorStats {
  totalDonations: number
  totalAmount: number
  associationsSupported: number
  lastDonationDate: string | null
  favoriteAssociations: string[]
  recentDonations: any[]
}

export function DonorDashboard() {
  const { user } = useAuth()
  const params = useParams()
  const locale = params.locale as string
  const [stats, setStats] = useState<DonorStats>({
    totalDonations: 0,
    totalAmount: 0,
    associationsSupported: 0,
    lastDonationDate: null,
    favoriteAssociations: [],
    recentDonations: []
  })
  const [loading, setLoading] = useState(true)

  // Hook pour récupérer le profil donateur
  const { data: profile, isLoading: profileLoading } = useDonorProfile(user?.email)

  useEffect(() => {
    if (profile) {
      const stats = {
        totalDonations: profile.stats?.totalDonations || 0,
        totalAmount: profile.stats?.totalAmount || 0,
        associationsSupported: profile.stats?.associationsCount || 0,
        lastDonationDate: profile.lastLoginAt || null, // Utiliser lastLoginAt temporairement
        favoriteAssociations: [], // À récupérer séparément via useFavoriteAssociations
        recentDonations: [] // À récupérer séparément via useDonorHistory
      }
      setStats(stats)
    }
    setLoading(false)
  }, [profile])

  if (loading || profileLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des dons</CardTitle>
            <span>€</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmount.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDonations} don{stats.totalDonations > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Associations soutenues</CardTitle>
            <span>🏢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.associationsSupported}</div>
            <p className="text-xs text-muted-foreground">
              Associations différentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Don moyen</CardTitle>
            <span>⬆️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalDonations > 0 
                ? (stats.totalAmount / stats.totalDonations).toFixed(2)
                : '0.00'
              }€
            </div>
            <p className="text-xs text-muted-foreground">
              Par don
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernier don</CardTitle>
            <span>📆</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.lastDonationDate 
                ? new Date(stats.lastDonationDate).toLocaleDateString('fr-FR')
                : 'Aucun'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Date du dernier don
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accédez rapidement à vos fonctionnalités favorites
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={`/${locale}/donor-portal/directory`}>
            <Button variant="outline" className="w-full justify-start">
              <span>🏢</span>
              Découvrir des associations
            </Button>
          </Link>
          
          <Link href={`/${locale}/donor-portal/history`}>
            <Button variant="outline" className="w-full justify-start">
              <span>🕒</span>
              Voir l'historique complet
            </Button>
          </Link>
          
          <Link href={`/${locale}/donor-portal/profile`}>
            <Button variant="outline" className="w-full justify-start">
              <span>👨</span>
              Modifier mon profil
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Dons récents (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Dons récents</CardTitle>
          <CardDescription>
            Vos dernières contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentDonations.length === 0 ? (
            <div className="text-center py-8">
              <span>❤️</span>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun don récent</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par découvrir des associations à soutenir
              </p>
              <div className="mt-6">
                <Link href={`/${locale}/donor-portal/directory`}>
                  <Button>
                    <span>🏢</span>
                    Découvrir des associations
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Affichage des dons récents */}
              {stats.recentDonations.map((donation, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {/* Contenu du don */}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

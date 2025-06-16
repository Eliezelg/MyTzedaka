'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, TrendingUp, Calendar, Euro } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface DonationStatsProps {
  totalAmount: number
  donationCount: number
  campaignCount: number
  lastDonationDate?: string
  isLoading?: boolean
}

export function DonationStats({
  totalAmount,
  donationCount,
  campaignCount,
  lastDonationDate,
  isLoading = false
}: DonationStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total des Dons
          </CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalAmount.toLocaleString('fr-FR')} €
          </div>
          <p className="text-xs text-muted-foreground">
            {donationCount} donation{donationCount > 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Nombre de Dons
          </CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{donationCount}</div>
          <p className="text-xs text-muted-foreground">
            Don{donationCount > 1 ? 's' : ''} effectué{donationCount > 1 ? 's' : ''}
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
          <div className="text-2xl font-bold">{campaignCount}</div>
          <p className="text-xs text-muted-foreground">
            {campaignCount > 0 
              ? `Campagne${campaignCount > 1 ? 's' : ''} soutenue${campaignCount > 1 ? 's' : ''}`
              : 'Aucune campagne pour le moment'
            }
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
            {lastDonationDate 
              ? new Date(lastDonationDate).toLocaleDateString('fr-FR', { 
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Aucun don'
            }
          </div>
          <p className="text-xs text-muted-foreground">
            {lastDonationDate ? 'Date du dernier don' : 'Pas encore de don'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
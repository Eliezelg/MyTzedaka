'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDonorHistory } from '@/hooks/use-donor-profile'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useDonorProfile } from '@/hooks/use-donor-profile'

interface HistoryFilters {
  startDate?: string
  endDate?: string
  tenantId?: string
  source?: string
  page: number
  limit: number
}

export function DonationHistory() {
  const { user } = useAuthContext()
  const [filters, setFilters] = useState<HistoryFilters>({
    page: 1,
    limit: 20
  })

  // Récupérer le profil donateur pour obtenir l'ID
  const { data: profile } = useDonorProfile(user?.email)

  const { data: historyData, isLoading, error } = useDonorHistory(profile?.id, filters)

  const handleFilterChange = (key: keyof HistoryFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : Number(value) // Ensure page is always a number
    }))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { label: 'Complété', variant: 'default' as const },
      PENDING: { label: 'En attente', variant: 'secondary' as const },
      FAILED: { label: 'Échoué', variant: 'destructive' as const },
      CANCELLED: { label: 'Annulé', variant: 'outline' as const },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, variant: 'outline' as const }
    
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getSourceBadge = (source: string) => {
    const sourceConfig = {
      PLATFORM: { label: 'Plateforme', color: 'bg-blue-100 text-blue-800' },
      CUSTOM_SITE: { label: 'Site personnalisé', color: 'bg-green-100 text-green-800' },
      API: { label: 'API', color: 'bg-purple-100 text-purple-800' },
      IMPORT: { label: 'Import', color: 'bg-gray-100 text-gray-800' },
    }

    const config = sourceConfig[source as keyof typeof sourceConfig] || 
                   { label: source, color: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton des filtres */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skeleton de la liste */}
        <Card>
          <CardContent className="p-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Erreur lors du chargement de l'historique</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  const donations = historyData?.donations || []
  const pagination = historyData?.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
  const stats = historyData?.stats || { totalAmount: 0, totalDonations: 0, averageDonation: 0, associationsCount: 0 }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Filtrez votre historique de dons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="source">Source</Label>
              <Select
                value={filters.source || 'all'}
                onValueChange={(value) => handleFilterChange('source', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sources</SelectItem>
                  <SelectItem value="PLATFORM">Plateforme</SelectItem>
                  <SelectItem value="CUSTOM_SITE">Site personnalisé</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="IMPORT">Import</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="limit">Éléments par page</Label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters({ page: 1, limit: 20 })}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques de la période */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-500">Total période</div>
            <div className="text-2xl font-bold">{stats.totalAmount.toFixed(2)}€</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-500">Nombre de dons</div>
            <div className="text-2xl font-bold">{stats.totalDonations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-500">Don moyen</div>
            <div className="text-2xl font-bold">{stats.averageDonation.toFixed(2)}€</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-500">Associations</div>
            <div className="text-2xl font-bold">{stats.associationsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des dons */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des dons</CardTitle>
          <CardDescription>
            {pagination.total} don{pagination.total > 1 ? 's' : ''} au total
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {donations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucun don trouvé pour ces critères
            </div>
          ) : (
            <div className="divide-y">
              {donations.map((donation: any) => (
                <div key={donation.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-medium text-lg">
                          {donation.amount.toFixed(2)} {donation.currency}
                        </div>
                        {getStatusBadge(donation.status)}
                        {getSourceBadge(donation.source)}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        <strong>{donation.tenant.name}</strong>
                        {donation.campaign && (
                          <span> • Campagne: {donation.campaign.title}</span>
                        )}
                      </div>
                      
                      {donation.purpose && (
                        <div className="text-sm text-gray-500 mb-1">
                          But: {donation.purpose}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        {format(new Date(donation.createdAt), 'PPpp', { locale: fr })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {pagination.page} sur {pagination.pages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => handleFilterChange('page', pagination.page - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => handleFilterChange('page', pagination.page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

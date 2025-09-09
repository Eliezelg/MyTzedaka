'use client'

import React, { useState, useEffect } from 'react'
import { useTenant } from '@/providers/tenant-provider'
import { CampaignCard } from '@/components/hub/campaign-card'
import { Card, CardContent } from '@/components/ui/card'
import { Target, Users, TrendingUp, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

import type { Campaign } from '@/types/hub'

export function TenantCampaignsPage() {
  const { tenant } = useTenant()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [tenant.id])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/campaigns`
      )
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      // Use mock data for now
      setCampaigns(getMockCampaigns())
    } finally {
      setLoading(false)
    }
  }

  const getMockCampaigns = (): Campaign[] => [
    {
      id: '1',
      title: 'Aide aux familles dans le besoin',
      description: 'Collecte de fonds pour soutenir les familles en difficulté de notre communauté.',
      goal: 50000,
      raised: 32500,
      donorCount: 145,
      endDate: new Date('2025-12-31'),
      startDate: new Date('2025-01-01'),
      status: 'ACTIVE',
      tenantId: tenant.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '1',
      _count: { donations: 145 },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug }
    } as Campaign,
    {
      id: '2',
      title: 'Rénovation de la synagogue',
      description: 'Projet de rénovation et modernisation de notre lieu de culte.',
      goal: 100000,
      raised: 78000,
      donorCount: 234,
      endDate: new Date('2025-10-15'),
      startDate: new Date('2025-01-01'),
      status: 'ACTIVE',
      tenantId: tenant.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '1',
      _count: { donations: 234 },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug }
    } as Campaign,
    {
      id: '3',
      title: 'Programme éducatif pour les jeunes',
      description: 'Financement des activités éducatives et culturelles pour la jeunesse.',
      goal: 25000,
      raised: 25000,
      donorCount: 89,
      endDate: new Date('2025-06-30'),
      startDate: new Date('2025-01-01'),
      status: 'COMPLETED',
      tenantId: tenant.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '1',
      _count: { donations: 89 },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug }
    } as Campaign
  ]

  const handleCampaignClick = (campaign: Campaign) => {
    router.push(`/t/${tenant.slug}/donate?campaign=${campaign.id}`)
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Nos Campagnes
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Découvrez nos projets en cours et participez à ceux qui vous tiennent à cœur.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total collecté</p>
                <p className="text-2xl font-bold">
                  {formatAmount(campaigns.reduce((sum, c) => sum + (c.raised || 0), 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campagnes actives</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'ACTIVE').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Donateurs</p>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + (c.donorCount || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de réussite</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    (campaigns.filter(c => (c.raised || 0) >= c.goal).length / 
                    campaigns.length) * 100
                  )}%
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map((campaign, index) => (
          <CampaignCard 
            key={campaign.id} 
            campaign={campaign} 
            index={index}
            onClick={handleCampaignClick}
          />
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-600">Aucune campagne active pour le moment.</p>
            <p className="text-sm text-gray-500 mt-2">
              Revenez bientôt pour découvrir nos nouveaux projets !
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
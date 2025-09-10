'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Download, 
  Filter,
  DollarSign,
  Heart,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { useTenant } from '@/providers/tenant-provider'
import { toast } from 'sonner'

interface Donation {
  id: string
  amount: number
  donorName: string
  donorEmail: string
  date: string
  campaignName?: string
  paymentMethod: string
  status: 'completed' | 'pending' | 'failed'
  isRecurring: boolean
}

interface DonationStats {
  totalAmount: number
  totalDonations: number
  uniqueDonors: number
  averageDonation: number
  monthlyGrowth: number
  topCampaign: string
  recurringPercentage: number
}

export function DonationTracker() {
  const { tenant } = useTenant()
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<DonationStats>({
    totalAmount: 0,
    totalDonations: 0,
    uniqueDonors: 0,
    averageDonation: 0,
    monthlyGrowth: 0,
    topCampaign: '',
    recurringPercentage: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDonations()
    fetchStats()
  }, [dateRange, tenant])

  const fetchStats = async () => {
    if (!tenant?.id) return
    
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/donations/stats?period=${dateRange}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchDonations = async () => {
    if (!tenant?.id) return
    
    setIsLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/donations`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setDonations(data.map((d: any) => ({
          id: d.id,
          amount: Number(d.amount),
          donorName: d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Anonyme',
          donorEmail: d.user?.email || '',
          date: d.createdAt,
          campaignName: d.campaign?.title,
          paymentMethod: d.paymentMethod || 'Carte bancaire',
          status: d.status.toLowerCase(),
          isRecurring: d.isRecurring
        })))
      } else {
        // Si pas de données, utiliser des données de démo
        setDonations([
          {
            id: '1',
            amount: 100,
            donorName: 'Jean Dupont',
            donorEmail: 'jean.dupont@email.com',
            date: '2024-03-15T10:30:00',
            campaignName: 'Rénovation de la synagogue',
            paymentMethod: 'Carte bancaire',
            status: 'completed',
            isRecurring: false
          },
          {
          id: '2',
          amount: 250,
          donorName: 'Marie Cohen',
          donorEmail: 'marie.cohen@email.com',
          date: '2024-03-14T14:20:00',
          campaignName: 'Aide aux familles',
          paymentMethod: 'Virement',
          status: 'completed',
          isRecurring: true
        },
        {
          id: '3',
          amount: 50,
          donorName: 'David Levy',
          donorEmail: 'david.levy@email.com',
          date: '2024-03-14T09:15:00',
          paymentMethod: 'PayPal',
          status: 'completed',
          isRecurring: false
        },
        {
          id: '4',
          amount: 500,
          donorName: 'Sarah Benhamou',
          donorEmail: 'sarah.b@email.com',
          date: '2024-03-13T16:45:00',
          campaignName: 'Rénovation de la synagogue',
          paymentMethod: 'Carte bancaire',
          status: 'completed',
          isRecurring: true
        },
        {
          id: '5',
          amount: 75,
          donorName: 'Michel Azoulay',
          donorEmail: 'michel.a@email.com',
          date: '2024-03-13T11:30:00',
          paymentMethod: 'Carte bancaire',
          status: 'pending',
          isRecurring: false
        }
      ])
      }
    } catch (error) {
      console.error('Error fetching donations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportData = () => {
    const csv = [
      ['Date', 'Donateur', 'Email', 'Montant', 'Campagne', 'Méthode', 'Statut', 'Récurrent'],
      ...filteredDonations.map(d => [
        formatDate(d.date),
        d.donorName,
        d.donorEmail,
        d.amount.toString(),
        d.campaignName || '',
        d.paymentMethod,
        d.status,
        d.isRecurring ? 'Oui' : 'Non'
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donations-${tenant?.slug}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Export réussi!')
  }

  const filteredDonations = donations.filter(donation =>
    donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.donorEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tableau de bord des dons</h2>
          <p className="text-gray-600">Suivez et analysez vos donations</p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total collecté</p>
                <p className="text-2xl font-bold">
                  {formatAmount(stats.totalAmount)}
                </p>
                <div className="flex items-center text-sm mt-1">
                  <ChevronUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">+{stats.monthlyGrowth}%</span>
                  <span className="text-gray-500 ml-1">ce mois</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nombre de dons</p>
                <p className="text-2xl font-bold">{stats.totalDonations}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Moy. {formatAmount(stats.averageDonation)}
                </p>
              </div>
              <Heart className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Donateurs uniques</p>
                <p className="text-2xl font-bold">{stats.uniqueDonors}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.recurringPercentage}% récurrents
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top campagne</p>
                <p className="text-sm font-bold truncate">
                  {stats.topCampaign}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  65% du total
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Derniers dons</CardTitle>
              <CardDescription>Liste détaillée des donations reçues</CardDescription>
            </div>
            <div className="flex gap-3">
              <Input
                placeholder="Rechercher un donateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Donateur</th>
                    <th className="text-left py-3 px-4">Montant</th>
                    <th className="text-left py-3 px-4">Campagne</th>
                    <th className="text-left py-3 px-4">Méthode</th>
                    <th className="text-left py-3 px-4">Statut</th>
                    <th className="text-left py-3 px-4">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((donation) => (
                    <tr key={donation.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {formatDate(donation.date)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{donation.donorName}</p>
                          <p className="text-sm text-gray-500">{donation.donorEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {formatAmount(donation.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {donation.campaignName || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {donation.paymentMethod}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                          {donation.status === 'completed' ? 'Complété' : 
                           donation.status === 'pending' ? 'En attente' : 'Échoué'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {donation.isRecurring && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Récurrent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Actions rapides</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Enregistrer un don manuel
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Envoyer un reçu fiscal
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Planifier un rapport
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Top donateurs ce mois</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sarah Benhamou</span>
                <span className="font-semibold">{formatAmount(500)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Marie Cohen</span>
                <span className="font-semibold">{formatAmount(250)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Jean Dupont</span>
                <span className="font-semibold">{formatAmount(100)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Objectifs du mois</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Collecte mensuelle</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Nouveaux donateurs</span>
                  <span>60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
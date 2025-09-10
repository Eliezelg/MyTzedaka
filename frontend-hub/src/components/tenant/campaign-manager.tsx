'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Target, Calendar, DollarSign, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useTenant } from '@/providers/tenant-provider'

interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  raised: number
  donorsCount: number
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'COMPLETED' | 'DRAFT'
  image?: string
}

export function CampaignManager() {
  const { tenant } = useTenant()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT' as const
  })

  useEffect(() => {
    fetchCampaigns()
  }, [tenant])

  const fetchCampaigns = async () => {
    if (!tenant?.id) return
    
    setIsLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/campaigns`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          goal: Number(c.goal),
          raised: Number(c.raised),
          donorsCount: c.donorsCount,
          startDate: c.startDate,
          endDate: c.endDate,
          status: c.status,
          image: c.coverImage
        })))
      } else {
        throw new Error('Failed to fetch campaigns')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des campagnes')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenant?.id) return
    
    try {
      const token = localStorage.getItem('accessToken')
      
      if (editingCampaign) {
        // Mise à jour
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/campaigns/${editingCampaign.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
              ...formData,
              goal: Number(formData.goal)
            })
          }
        )
        
        if (response.ok) {
          toast.success('Campagne mise à jour')
          fetchCampaigns()
        } else {
          throw new Error('Failed to update campaign')
        }
      } else {
        // Création
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/campaigns`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
              ...formData,
              goal: Number(formData.goal),
              shortDescription: formData.description.substring(0, 100)
            })
          }
        )
        
        if (response.ok) {
          toast.success('Campagne créée avec succès')
          fetchCampaigns()
        } else {
          throw new Error('Failed to create campaign')
        }
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        goal: '',
        startDate: '',
        endDate: '',
        status: 'DRAFT'
      })
      setEditingCampaign(null)
      setIsCreating(false)
    } catch (error) {
      toast.error(editingCampaign ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création')
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!tenant?.id) return
    
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/campaigns/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      )
      
      if (response.ok) {
        toast.success('Campagne supprimée')
        fetchCampaigns()
      } else {
        throw new Error('Failed to delete campaign')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
      console.error(error)
    }
  }

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setFormData({
      title: campaign.title,
      description: campaign.description,
      goal: campaign.goal.toString(),
      startDate: campaign.startDate.split('T')[0],
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      status: campaign.status
    })
    setIsCreating(true)
  }

  const handleCreate = () => {
    setEditingCampaign(null)
    setFormData({
      title: '',
      description: '',
      goal: '',
      startDate: '',
      endDate: '',
      status: 'DRAFT'
    })
    setIsCreating(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goal: '',
      startDate: '',
      endDate: '',
      status: 'DRAFT'
    })
  }


  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getProgress = (raised: number, goal: number) => {
    return Math.min(100, Math.round((raised / goal) * 100))
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      DRAFT: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status === 'ACTIVE' ? 'Active' : status === 'COMPLETED' ? 'Terminée' : 'Brouillon'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des campagnes</h2>
          <p className="text-gray-600">Créez et gérez vos campagnes de collecte</p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setEditingCampaign(null)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle campagne
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingCampaign ? 'Modifier la campagne' : 'Créer une nouvelle campagne'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations de votre campagne de collecte
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la campagne</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Rénovation de la synagogue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre campagne..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Objectif (€)</Label>
                  <Input
                    id="goal"
                    type="number"
                    value={formData.goal}
                    onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                    placeholder="50000"
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="DRAFT">Brouillon</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Terminée</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreating(false)
                  setEditingCampaign(null)
                  resetForm()
                }}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingCampaign ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune campagne</h3>
            <p className="text-gray-600 mb-4">Créez votre première campagne de collecte</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une campagne
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{campaign.title}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-gray-600 mb-4">{campaign.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">
                          {formatAmount(campaign.raised)} collectés
                        </span>
                        <span className="text-gray-600">
                          Objectif: {formatAmount(campaign.goal)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all"
                          style={{ width: `${getProgress(campaign.raised, campaign.goal)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>{getProgress(campaign.raised, campaign.goal)}% atteint</span>
                        <span>{campaign.donorsCount} donateurs</span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          Du {new Date(campaign.startDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          Au {new Date(campaign.endDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {campaign.donorsCount} donateurs
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(campaign)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
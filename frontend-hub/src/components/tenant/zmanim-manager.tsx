'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'
import { apiClient } from '@/lib/api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Clock, Sun, Moon, Calendar } from 'lucide-react'

interface ZmanimSettings {
  latitude: number
  longitude: number
  elevation: number
  timezone: string
  cityName: string
  showSeconds: boolean
  use24HourFormat: boolean
  showHebrewDate: boolean
  showParasha: boolean
  calculationMethod: string
  candleLightingOffset: number
  havdalahOffset: number
  [key: string]: any
}

interface ZmanimManagerProps {
  tenantId: string
}

export function ZmanimManager({ tenantId }: ZmanimManagerProps) {
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)

  // Récupérer les paramètres
  const { data: settings, isLoading } = useQuery({
    queryKey: ['zmanim-settings', tenantId],
    queryFn: async () => {
      const response = await apiClient.get<ZmanimSettings>(
        `/tenant/${tenantId}/zmanim/settings`
      )
      return response.data
    },
  })

  // Récupérer les zmanim du jour
  const { data: todayZmanim } = useQuery({
    queryKey: ['zmanim-today', tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/tenant/${tenantId}/zmanim/today`)
      return response.data
    },
    refetchInterval: 60000, // Actualiser toutes les minutes
  })

  // Mutation pour mettre à jour les paramètres
  const updateSettings = useMutation({
    mutationFn: async (updatedSettings: Partial<ZmanimSettings>) => {
      const response = await apiClient.put(
        `/tenant/${tenantId}/zmanim/settings`,
        updatedSettings
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zmanim-settings', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['zmanim-today', tenantId] })
      toast.success('Paramètres mis à jour avec succès')
      setEditMode(false)
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })

  const [formData, setFormData] = useState<Partial<ZmanimSettings>>({})

  const handleEdit = () => {
    if (settings) {
      setFormData(settings)
      setEditMode(true)
    }
  }

  const handleSave = () => {
    updateSettings.mutate(formData)
  }

  const handleCancel = () => {
    setFormData({})
    setEditMode(false)
  }

  const formatTime = (time: string) => {
    if (!time) return '--:--'
    return time
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Paramètres de localisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Localisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cityName">Ville</Label>
                  <Input
                    id="cityName"
                    value={formData.cityName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, cityName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Input
                    id="timezone"
                    value={formData.timezone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    value={formData.latitude || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    value={formData.longitude || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="elevation">Élévation (m)</Label>
                  <Input
                    id="elevation"
                    type="number"
                    value={formData.elevation || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        elevation: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">{settings?.cityName}</p>
              <p className="text-sm text-muted-foreground">
                {settings?.latitude}, {settings?.longitude}
              </p>
              <p className="text-sm text-muted-foreground">
                Fuseau: {settings?.timezone}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zmanim du jour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Zmanim du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayZmanim ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(todayZmanim).map(([key, value]) => {
                if (key === 'date' || key === 'hebrewDate') return null
                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm font-medium">{key}:</span>
                    <span className="text-sm">{formatTime(value as string)}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          )}
        </CardContent>
      </Card>

      {/* Options d'affichage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Options d'affichage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="use24HourFormat">Format 24 heures</Label>
                <Switch
                  id="use24HourFormat"
                  checked={formData.use24HourFormat}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, use24HourFormat: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showSeconds">Afficher les secondes</Label>
                <Switch
                  id="showSeconds"
                  checked={formData.showSeconds}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showSeconds: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showHebrewDate">Afficher la date hébraïque</Label>
                <Switch
                  id="showHebrewDate"
                  checked={formData.showHebrewDate}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showHebrewDate: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showParasha">Afficher la Paracha</Label>
                <Switch
                  id="showParasha"
                  checked={formData.showParasha}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showParasha: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="candleLightingOffset">
                    Allumage des bougies (min avant)
                  </Label>
                  <Input
                    id="candleLightingOffset"
                    type="number"
                    value={formData.candleLightingOffset || 18}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        candleLightingOffset: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="havdalahOffset">Havdalah (min après)</Label>
                  <Input
                    id="havdalahOffset"
                    type="number"
                    value={formData.havdalahOffset || 72}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        havdalahOffset: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p>Format: {settings?.use24HourFormat ? '24h' : '12h'}</p>
              <p>Date hébraïque: {settings?.showHebrewDate ? 'Oui' : 'Non'}</p>
              <p>Paracha: {settings?.showParasha ? 'Oui' : 'Non'}</p>
              <p>Allumage: {settings?.candleLightingOffset} min avant</p>
              <p>Havdalah: {settings?.havdalahOffset} min après</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-2">
        {editMode ? (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </>
        ) : (
          <Button onClick={handleEdit}>Modifier les paramètres</Button>
        )}
      </div>
    </div>
  )
}
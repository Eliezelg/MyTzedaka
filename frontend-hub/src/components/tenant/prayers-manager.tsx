'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { apiClient } from '@/lib/api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Calendar, Users, Edit, Save, X } from 'lucide-react'

interface PrayerTime {
  shaharit?: string
  minha?: string
  arvit?: string
  kriatShema?: string
  musaf?: string
  neila?: string
  [key: string]: string | undefined
}

interface PrayerSettings {
  weekdayTimes: PrayerTime
  fridayTimes: PrayerTime
  shabbatTimes: PrayerTime
  holidayTimes: PrayerTime
  specialNotices?: string
}

interface PrayersManagerProps {
  tenantId: string
}

const prayerLabels: Record<string, string> = {
  shaharit: 'Chaharit',
  minha: 'Minha',
  arvit: 'Arvit',
  kriatShema: 'Kriat Chema',
  musaf: 'Moussaf',
  neila: 'Neila',
}

const dayTypeLabels: Record<string, string> = {
  weekdayTimes: 'Jours de semaine',
  fridayTimes: 'Vendredi',
  shabbatTimes: 'Chabbat',
  holidayTimes: 'Jours de fête',
}

export function PrayersManager({ tenantId }: PrayersManagerProps) {
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('weekdayTimes')

  // Récupérer les paramètres de prières
  const { data: settings, isLoading } = useQuery({
    queryKey: ['prayer-settings', tenantId],
    queryFn: async () => {
      const response = await apiClient.get<PrayerSettings>(
        `/tenant/${tenantId}/prayers/settings`
      )
      return response.data
    },
  })

  // Récupérer les prières du jour
  const { data: todayPrayers } = useQuery({
    queryKey: ['prayers-today', tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/tenant/${tenantId}/prayers/today`)
      return response.data
    },
  })

  // Récupérer les prières de la semaine
  const { data: weekPrayers } = useQuery({
    queryKey: ['prayers-week', tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/tenant/${tenantId}/prayers/week`)
      return response.data
    },
  })

  // Mutation pour mettre à jour les paramètres
  const updateSettings = useMutation({
    mutationFn: async (updatedSettings: PrayerSettings) => {
      const response = await apiClient.put(
        `/tenant/${tenantId}/prayers/settings`,
        updatedSettings
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-settings', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['prayers-today', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['prayers-week', tenantId] })
      toast.success('Horaires de prières mis à jour')
      setEditMode(false)
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })

  const [formData, setFormData] = useState<PrayerSettings>({
    weekdayTimes: {},
    fridayTimes: {},
    shabbatTimes: {},
    holidayTimes: {},
  })

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
    setFormData({
      weekdayTimes: {},
      fridayTimes: {},
      shabbatTimes: {},
      holidayTimes: {},
    })
    setEditMode(false)
  }

  const updatePrayerTime = (
    dayType: string,
    prayer: string,
    time: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [dayType]: {
        ...prev[dayType as keyof PrayerSettings],
        [prayer]: time,
      },
    }))
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Prières du jour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horaires d'aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayPrayers ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(todayPrayers)
                .filter(([key]) => key !== 'date' && key !== 'dayType')
                .map(([prayer, time]) => (
                  <div
                    key={prayer}
                    className="p-3 bg-muted rounded-lg text-center"
                  >
                    <p className="font-medium text-sm">
                      {prayerLabels[prayer] || prayer}
                    </p>
                    <p className="text-lg font-bold">{time as string}</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Aucun horaire disponible pour aujourd'hui
            </p>
          )}
        </CardContent>
      </Card>

      {/* Configuration des horaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Configuration des horaires
            </span>
            {!editMode && (
              <Button size="sm" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs pour les différents types de jours */}
          <div className="flex gap-2 mb-4 border-b">
            {Object.keys(dayTypeLabels).map((dayType) => (
              <button
                key={dayType}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === dayType
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab(dayType)}
              >
                {dayTypeLabels[dayType]}
              </button>
            ))}
          </div>

          {/* Contenu de l'onglet actif */}
          <div className="space-y-4">
            {editMode ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(prayerLabels).map((prayer) => {
                  const currentValue =
                    formData[activeTab as keyof PrayerSettings]?.[prayer] || ''
                  return (
                    <div key={prayer}>
                      <Label htmlFor={`${activeTab}-${prayer}`}>
                        {prayerLabels[prayer]}
                      </Label>
                      <Input
                        id={`${activeTab}-${prayer}`}
                        type="time"
                        value={currentValue}
                        onChange={(e) =>
                          updatePrayerTime(activeTab, prayer, e.target.value)
                        }
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {settings &&
                  Object.entries(
                    settings[activeTab as keyof PrayerSettings] || {}
                  ).map(([prayer, time]) => (
                    <div key={prayer} className="flex justify-between">
                      <span className="font-medium">
                        {prayerLabels[prayer] || prayer}:
                      </span>
                      <span>{time as string || '--:--'}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Notes spéciales */}
          {editMode && (
            <div className="mt-4">
              <Label htmlFor="specialNotices">Notes spéciales</Label>
              <textarea
                id="specialNotices"
                className="w-full mt-1 p-2 border rounded-md"
                rows={3}
                placeholder="Informations supplémentaires sur les horaires..."
                value={formData.specialNotices || ''}
                onChange={(e) =>
                  setFormData({ ...formData, specialNotices: e.target.value })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programme de la semaine */}
      {weekPrayers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Programme de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Jour</th>
                    <th className="text-center px-2">Chaharit</th>
                    <th className="text-center px-2">Minha</th>
                    <th className="text-center px-2">Arvit</th>
                  </tr>
                </thead>
                <tbody>
                  {weekPrayers.map((day: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{day.dayName}</td>
                      <td className="text-center px-2">
                        {day.shaharit || '--:--'}
                      </td>
                      <td className="text-center px-2">
                        {day.minha || '--:--'}
                      </td>
                      <td className="text-center px-2">
                        {day.arvit || '--:--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boutons d'action */}
      {editMode && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateSettings.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSettings.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      )}
    </div>
  )
}
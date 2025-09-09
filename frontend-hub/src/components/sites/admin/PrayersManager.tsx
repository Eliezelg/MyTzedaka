'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, Bell, Save, RefreshCw, Sunrise, Sunset, Moon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTenant } from '@/providers/tenant-provider';
import { getAuthHeaders } from '@/lib/security/cookie-auth';

interface PrayerSettings {
  calculationMode: string;
  roundingMode: string;
  
  // Shaharit
  shaharitMode: string;
  shaharitTime: string;
  shaharitOffset: number;
  shaharitWeekday: string;
  shaharitShabbat: string;
  shaharitYomTov: string;
  
  // Minha
  minhaMode: string;
  minhaTime: string;
  minhaOffset: number;
  minhaWeekday: string;
  minhaShabbat: string;
  minhaYomTov: string;
  
  // Arvit
  arvitMode: string;
  arvitTime: string;
  arvitOffset: number;
  arvitWeekday: string;
  arvitShabbat: string;
  
  // Selichot
  selichotEnabled: boolean;
  selichotTime: string;
  
  // Notifications
  enableNotifications: boolean;
  notificationMinutes: number;
}

const DEFAULT_SETTINGS: PrayerSettings = {
  calculationMode: 'ZMANIM',
  roundingMode: 'NONE',
  shaharitMode: 'FIXED',
  shaharitTime: '07:00',
  shaharitOffset: 30,
  shaharitWeekday: '06:30',
  shaharitShabbat: '08:30',
  shaharitYomTov: '09:00',
  minhaMode: 'BEFORE_SHKIA',
  minhaTime: '18:30',
  minhaOffset: 20,
  minhaWeekday: '18:30',
  minhaShabbat: '17:00',
  minhaYomTov: '17:30',
  arvitMode: 'AFTER_SHKIA',
  arvitTime: '20:00',
  arvitOffset: 0,
  arvitWeekday: '20:00',
  arvitShabbat: '21:00',
  selichotEnabled: false,
  selichotTime: '05:30',
  enableNotifications: true,
  notificationMinutes: 10,
};

export function PrayersManager() {
  const { tenant } = useTenant();
  const [settings, setSettings] = useState<PrayerSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [todayPrayers, setTodayPrayers] = useState<any>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
    loadTodayPrayers();
    loadWeeklySchedule();
  }, [tenant?.id]);

  const loadSettings = async () => {
    if (!tenant?.id) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenant.id}/prayers/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading prayer settings:', error);
    }
  };

  const loadTodayPrayers = async () => {
    if (!tenant?.id) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenant.id}/prayers/today`);
      if (response.ok) {
        const data = await response.json();
        setTodayPrayers(data);
      }
    } catch (error) {
      console.error('Error loading today\'s prayers:', error);
    }
  };

  const loadWeeklySchedule = async () => {
    if (!tenant?.id) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenant.id}/prayers/weekly`);
      if (response.ok) {
        const data = await response.json();
        setWeeklySchedule(data);
      }
    } catch (error) {
      console.error('Error loading weekly schedule:', error);
    }
  };

  const saveSettings = async () => {
    if (!tenant?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenant.id}/prayers/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Paramètres de prières sauvegardés');
        loadTodayPrayers();
        loadWeeklySchedule();
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async (days: number = 30) => {
    if (!tenant?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenant.id}/prayers/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ days }),
      });

      if (response.ok) {
        toast.success(`Planning généré pour ${days} jours`);
        loadWeeklySchedule();
      } else {
        toast.error('Erreur lors de la génération');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Horaires de Prières</h2>
        <div className="flex gap-2">
          <Button onClick={() => generateSchedule(30)} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Générer 30 jours
          </Button>
          <Button onClick={saveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="shaharit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="shaharit">Shaharit</TabsTrigger>
          <TabsTrigger value="minha">Minha</TabsTrigger>
          <TabsTrigger value="arvit">Arvit</TabsTrigger>
          <TabsTrigger value="special">Spécial</TabsTrigger>
          <TabsTrigger value="schedule">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="shaharit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sunrise className="h-5 w-5" />
                Configuration Shaharit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shaharitMode">Mode de calcul</Label>
                <Select
                  value={settings.shaharitMode}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, shaharitMode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Heure fixe</SelectItem>
                    <SelectItem value="BEFORE_NETZ">Avant le lever (Vatikin)</SelectItem>
                    <SelectItem value="AFTER_NETZ">Après le lever</SelectItem>
                    <SelectItem value="BEFORE_SHEMA_GRA">Avant fin Shema (GRA)</SelectItem>
                    <SelectItem value="BEFORE_SHEMA_MGA">Avant fin Shema (MGA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.shaharitMode === 'FIXED' ? (
                <div>
                  <Label htmlFor="shaharitTime">Heure par défaut</Label>
                  <Input
                    id="shaharitTime"
                    type="time"
                    value={settings.shaharitTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, shaharitTime: e.target.value }))}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="shaharitOffset">Minutes {settings.shaharitMode.includes('BEFORE') ? 'avant' : 'après'}</Label>
                  <Input
                    id="shaharitOffset"
                    type="number"
                    min="0"
                    max="120"
                    value={settings.shaharitOffset}
                    onChange={(e) => setSettings(prev => ({ ...prev, shaharitOffset: parseInt(e.target.value) }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="shaharitWeekday">Semaine</Label>
                  <Input
                    id="shaharitWeekday"
                    type="time"
                    value={settings.shaharitWeekday}
                    onChange={(e) => setSettings(prev => ({ ...prev, shaharitWeekday: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="shaharitShabbat">Shabbat</Label>
                  <Input
                    id="shaharitShabbat"
                    type="time"
                    value={settings.shaharitShabbat}
                    onChange={(e) => setSettings(prev => ({ ...prev, shaharitShabbat: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="shaharitYomTov">Yom Tov</Label>
                  <Input
                    id="shaharitYomTov"
                    type="time"
                    value={settings.shaharitYomTov}
                    onChange={(e) => setSettings(prev => ({ ...prev, shaharitYomTov: e.target.value }))}
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Vatikin:</strong> Pour dire le Shema au lever du soleil<br />
                  <strong>Avant Shema:</strong> Pour finir la Amida avant la fin du temps du Shema
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minha" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sunset className="h-5 w-5" />
                Configuration Minha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="minhaMode">Mode de calcul</Label>
                <Select
                  value={settings.minhaMode}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, minhaMode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Heure fixe</SelectItem>
                    <SelectItem value="BEFORE_SHKIA">Avant le coucher</SelectItem>
                    <SelectItem value="ZMANIM_BASED">Basé sur les Zmanim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.minhaMode === 'FIXED' ? (
                <div>
                  <Label htmlFor="minhaTime">Heure par défaut</Label>
                  <Input
                    id="minhaTime"
                    type="time"
                    value={settings.minhaTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, minhaTime: e.target.value }))}
                  />
                </div>
              ) : settings.minhaMode === 'BEFORE_SHKIA' && (
                <div>
                  <Label htmlFor="minhaOffset">Minutes avant le coucher</Label>
                  <Input
                    id="minhaOffset"
                    type="number"
                    min="0"
                    max="60"
                    value={settings.minhaOffset}
                    onChange={(e) => setSettings(prev => ({ ...prev, minhaOffset: parseInt(e.target.value) }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minhaWeekday">Semaine</Label>
                  <Input
                    id="minhaWeekday"
                    type="time"
                    value={settings.minhaWeekday}
                    onChange={(e) => setSettings(prev => ({ ...prev, minhaWeekday: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="minhaShabbat">Shabbat</Label>
                  <Input
                    id="minhaShabbat"
                    type="time"
                    value={settings.minhaShabbat}
                    onChange={(e) => setSettings(prev => ({ ...prev, minhaShabbat: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="minhaYomTov">Yom Tov</Label>
                  <Input
                    id="minhaYomTov"
                    type="time"
                    value={settings.minhaYomTov}
                    onChange={(e) => setSettings(prev => ({ ...prev, minhaYomTov: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arvit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Configuration Arvit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="arvitMode">Mode de calcul</Label>
                <Select
                  value={settings.arvitMode}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, arvitMode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">Heure fixe</SelectItem>
                    <SelectItem value="AFTER_SHKIA">Après le coucher</SelectItem>
                    <SelectItem value="AFTER_TZET">Après Tzet Hakochavim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.arvitMode === 'FIXED' ? (
                <div>
                  <Label htmlFor="arvitTime">Heure par défaut</Label>
                  <Input
                    id="arvitTime"
                    type="time"
                    value={settings.arvitTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, arvitTime: e.target.value }))}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="arvitOffset">Minutes après</Label>
                  <Input
                    id="arvitOffset"
                    type="number"
                    min="0"
                    max="60"
                    value={settings.arvitOffset}
                    onChange={(e) => setSettings(prev => ({ ...prev, arvitOffset: parseInt(e.target.value) }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="arvitWeekday">Semaine</Label>
                  <Input
                    id="arvitWeekday"
                    type="time"
                    value={settings.arvitWeekday}
                    onChange={(e) => setSettings(prev => ({ ...prev, arvitWeekday: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="arvitShabbat">Motzei Shabbat</Label>
                  <Input
                    id="arvitShabbat"
                    type="time"
                    value={settings.arvitShabbat}
                    onChange={(e) => setSettings(prev => ({ ...prev, arvitShabbat: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prières spéciales et options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="selichotEnabled">Selichot</Label>
                    <p className="text-sm text-gray-500">Activer pendant la période de Selichot</p>
                  </div>
                  <Switch
                    id="selichotEnabled"
                    checked={settings.selichotEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, selichotEnabled: checked }))}
                  />
                </div>

                {settings.selichotEnabled && (
                  <div>
                    <Label htmlFor="selichotTime">Heure des Selichot</Label>
                    <Input
                      id="selichotTime"
                      type="time"
                      value={settings.selichotTime}
                      onChange={(e) => setSettings(prev => ({ ...prev, selichotTime: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label>Arrondi des horaires</Label>
                <Select
                  value={settings.roundingMode}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, roundingMode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Pas d'arrondi</SelectItem>
                    <SelectItem value="FIVE_MIN">Arrondi à 5 minutes</SelectItem>
                    <SelectItem value="TEN_MIN">Arrondi à 10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableNotifications">Notifications</Label>
                    <p className="text-sm text-gray-500">Envoyer des rappels avant les prières</p>
                  </div>
                  <Switch
                    id="enableNotifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableNotifications: checked }))}
                  />
                </div>

                {settings.enableNotifications && (
                  <div>
                    <Label htmlFor="notificationMinutes">Minutes avant la prière</Label>
                    <Input
                      id="notificationMinutes"
                      type="number"
                      min="5"
                      max="60"
                      value={settings.notificationMinutes}
                      onChange={(e) => setSettings(prev => ({ ...prev, notificationMinutes: parseInt(e.target.value) }))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Planning de la semaine</CardTitle>
              <Button onClick={loadWeeklySchedule} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </CardHeader>
            <CardContent>
              {todayPrayers && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Aujourd'hui</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {todayPrayers.shaharit && (
                      <div>
                        <span className="text-sm text-gray-600">Shaharit:</span>
                        <span className="ml-2 font-medium">{todayPrayers.shaharit}</span>
                      </div>
                    )}
                    {todayPrayers.minha && (
                      <div>
                        <span className="text-sm text-gray-600">Minha:</span>
                        <span className="ml-2 font-medium">{todayPrayers.minha}</span>
                      </div>
                    )}
                    {todayPrayers.arvit && (
                      <div>
                        <span className="text-sm text-gray-600">Arvit:</span>
                        <span className="ml-2 font-medium">{todayPrayers.arvit}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Jour</th>
                      <th className="text-left p-2">Shaharit</th>
                      <th className="text-left p-2">Minha</th>
                      <th className="text-left p-2">Arvit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklySchedule.map((day, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{day.dayName}</td>
                        <td className="p-2">{day.shaharit || '-'}</td>
                        <td className="p-2">{day.minha || '-'}</td>
                        <td className="p-2">{day.arvit || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
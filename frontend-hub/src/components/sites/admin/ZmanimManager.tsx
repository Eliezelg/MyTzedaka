'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Globe, Sunrise, Sunset, Clock, Save, RefreshCw, Moon, Sun } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTenant } from '@/providers/tenant-provider';
import { getAuthHeaders } from '@/lib/security/cookie-auth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ZmanimSettings {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  cityName: string;
  calculationMethod: string;
  candleLightingOffset: number;
  havdalahOffset: number;
  use24HourFormat: boolean;
  showSeconds: boolean;
  showHebrewDate: boolean;
  showParasha: boolean;
  
  // Aube - Dawn display options
  displayAlotHashachar72: boolean;
  displayAlotHashachar90: boolean;
  displayAlotHashachar120: boolean;
  displayAlotHashachar16_1: boolean;
  
  // Misheyakir display options
  displayMisheyakir10_2: boolean;
  displayMisheyakir11: boolean;
  displayMisheyakir11_5: boolean;
  
  // Sunrise display options
  displayHanetzHaChama: boolean;
  displayHanetzElevation: boolean;
  
  // Shema display options
  displaySofZmanShmaGRA: boolean;
  displaySofZmanShmaMGA: boolean;
  displaySofZmanShmaFixed: boolean;
  
  // Tefila display options
  displaySofZmanTfilaGRA: boolean;
  displaySofZmanTfilaMGA: boolean;
  displaySofZmanTfilaFixed: boolean;
  
  // Midday
  displayChatzot: boolean;
  
  // Mincha display options
  displayMinchaGedola: boolean;
  displayMinchaGedolaAteret: boolean;
  displayMinchaKetana: boolean;
  displayMinchaKetanaAteret: boolean;
  displayPlagHamincha: boolean;
  displayPlagHaminchaAteret: boolean;
  
  // Candle lighting display options
  displayCandleLighting: boolean;
  displayCandleLighting20: boolean;
  displayCandleLighting30: boolean;
  displayCandleLighting40: boolean;
  
  // Sunset display options
  displayShkiatHaChama: boolean;
  displayShkiatElevation: boolean;
  displayBainHashmashot: boolean;
  
  // Tzeis display options
  displayTzeitHakochavim: boolean;
  displayTzeit5_95: boolean;
  displayTzeit7_083: boolean;
  displayTzeit8_5: boolean;
  displayTzeit13: boolean;
  displayTzeit16_1: boolean;
  displayTzeit18: boolean;
  displayTzeit19_8: boolean;
  displayTzeit24: boolean;
  displayTzeit26: boolean;
  displayTzeit42: boolean;
  displayTzeit50: boolean;
  displayTzeit72: boolean;
  displayTzeit90: boolean;
  displayTzeit120: boolean;
  
  // Shabbat/Yom Tov display options
  displayTzeitShabbat: boolean;
  displayTzeitShabbatRT: boolean;
  displayHavdalah8_5: boolean;
  displayHavdalah42: boolean;
  displayHavdalah50: boolean;
  displayHavdalah60: boolean;
  displayHavdalah72: boolean;
  
  // Additional display options
  displayShaahZmanisGRA: boolean;
  displayShaahZmanisMGA: boolean;
  displayEarliestTallit: boolean;
  displayEarliestTefillin: boolean;
}

const DEFAULT_SETTINGS: ZmanimSettings = {
  latitude: 48.8566,
  longitude: 2.3522,
  elevation: 35,
  timezone: 'Europe/Paris',
  cityName: 'Paris',
  calculationMethod: 'GRA',
  candleLightingOffset: 18,
  havdalahOffset: 72,
  use24HourFormat: true,
  showSeconds: false,
  showHebrewDate: true,
  showParasha: true,
  
  // Default display settings - Dawn
  displayAlotHashachar72: false,
  displayAlotHashachar90: false,
  displayAlotHashachar120: true,
  displayAlotHashachar16_1: false,
  displayMisheyakir10_2: false,
  displayMisheyakir11: true,
  displayMisheyakir11_5: false,
  
  // Sunrise
  displayHanetzHaChama: true,
  displayHanetzElevation: false,
  
  // Shema
  displaySofZmanShmaGRA: true,
  displaySofZmanShmaMGA: true,
  displaySofZmanShmaFixed: false,
  
  // Tefila
  displaySofZmanTfilaGRA: true,
  displaySofZmanTfilaMGA: false,
  displaySofZmanTfilaFixed: false,
  
  // Midday
  displayChatzot: true,
  
  // Mincha
  displayMinchaGedola: true,
  displayMinchaGedolaAteret: false,
  displayMinchaKetana: true,
  displayMinchaKetanaAteret: false,
  displayPlagHamincha: false,
  displayPlagHaminchaAteret: false,
  
  // Candle lighting
  displayCandleLighting: true,
  displayCandleLighting20: false,
  displayCandleLighting30: false,
  displayCandleLighting40: false,
  
  // Sunset
  displayShkiatHaChama: true,
  displayShkiatElevation: false,
  displayBainHashmashot: false,
  
  // Tzeis
  displayTzeitHakochavim: true,
  displayTzeit5_95: false,
  displayTzeit7_083: false,
  displayTzeit8_5: false,
  displayTzeit13: false,
  displayTzeit16_1: false,
  displayTzeit18: false,
  displayTzeit19_8: false,
  displayTzeit24: false,
  displayTzeit26: false,
  displayTzeit42: false,
  displayTzeit50: false,
  displayTzeit72: true,
  displayTzeit90: false,
  displayTzeit120: false,
  
  // Shabbat/Yom Tov
  displayTzeitShabbat: true,
  displayTzeitShabbatRT: false,
  displayHavdalah8_5: false,
  displayHavdalah42: false,
  displayHavdalah50: false,
  displayHavdalah60: false,
  displayHavdalah72: true,
  
  // Additional
  displayShaahZmanisGRA: false,
  displayShaahZmanisMGA: false,
  displayEarliestTallit: false,
  displayEarliestTefillin: false,
};

const PRESET_LOCATIONS = [
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Jerusalem', latitude: 31.7651178, longitude: 35.1746176, timezone: 'Asia/Jerusalem' }, // Coordonnées optimisées pour עתים לבינה
  { name: 'Tel Aviv', latitude: 32.0853, longitude: 34.7818, timezone: 'Asia/Jerusalem' },
  { name: 'New York', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: 'London', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Marseille', latitude: 43.2965, longitude: 5.3698, timezone: 'Europe/Paris' },
  { name: 'Lyon', latitude: 45.7640, longitude: 4.8357, timezone: 'Europe/Paris' },
  { name: 'Nice', latitude: 43.7102, longitude: 7.2620, timezone: 'Europe/Paris' },
];

export function ZmanimManager() {
  const { tenant } = useTenant();
  const [settings, setSettings] = useState<ZmanimSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [todayZmanim, setTodayZmanim] = useState<any>(null);

  useEffect(() => {
    loadSettings();
    loadTodayZmanim();
  }, [tenant?.id]);

  const loadSettings = async () => {
    if (!tenant?.id) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenant.id}/zmanim/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadTodayZmanim = async () => {
    if (!tenant?.id) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenant.id}/zmanim/today`);
      if (response.ok) {
        const data = await response.json();
        setTodayZmanim(data);
      }
    } catch (error) {
      console.error('Error loading today\'s zmanim:', error);
    }
  };

  const saveSettings = async () => {
    if (!tenant?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenant.id}/zmanim/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Paramètres Zmanim enregistrés');
        await loadTodayZmanim(); // Reload zmanim with new settings
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setSettings({
      ...settings,
      cityName: preset.name,
      latitude: preset.latitude,
      longitude: preset.longitude,
      timezone: preset.timezone,
    });
  };

  const handleToggleZman = (key: keyof ZmanimSettings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sunrise className="h-5 w-5" />
            Configuration des Zmanim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="location" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="location">Localisation</TabsTrigger>
              <TabsTrigger value="display">Affichage</TabsTrigger>
              <TabsTrigger value="times">Horaires</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>

            <TabsContent value="location" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Localisation rapide</Label>
                  <Select onValueChange={(value) => {
                    const preset = PRESET_LOCATIONS.find(p => p.name === value);
                    if (preset) handleLocationPreset(preset);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_LOCATIONS.map(location => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cityName">Nom de la ville</Label>
                    <Input
                      id="cityName"
                      value={settings.cityName}
                      onChange={(e) => setSettings({...settings, cityName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Input
                      id="timezone"
                      value={settings.timezone}
                      onChange={(e) => setSettings({...settings, timezone: e.target.value})}
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
                      value={settings.latitude}
                      onChange={(e) => setSettings({...settings, latitude: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.0001"
                      value={settings.longitude}
                      onChange={(e) => setSettings({...settings, longitude: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="elevation">Élévation (m)</Label>
                    <Input
                      id="elevation"
                      type="number"
                      value={settings.elevation}
                      onChange={(e) => setSettings({...settings, elevation: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="candleLightingOffset">Allumage des bougies (min avant)</Label>
                    <Input
                      id="candleLightingOffset"
                      type="number"
                      value={settings.candleLightingOffset}
                      onChange={(e) => setSettings({...settings, candleLightingOffset: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="havdalahOffset">Havdala (min après)</Label>
                    <Input
                      id="havdalahOffset"
                      type="number"
                      value={settings.havdalahOffset}
                      onChange={(e) => setSettings({...settings, havdalahOffset: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="display" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Format 24 heures</Label>
                  <Switch
                    checked={settings.use24HourFormat}
                    onCheckedChange={(checked) => setSettings({...settings, use24HourFormat: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Afficher les secondes</Label>
                  <Switch
                    checked={settings.showSeconds}
                    onCheckedChange={(checked) => setSettings({...settings, showSeconds: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Afficher la date hébraïque</Label>
                  <Switch
                    checked={settings.showHebrewDate}
                    onCheckedChange={(checked) => setSettings({...settings, showHebrewDate: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Afficher la Parasha</Label>
                  <Switch
                    checked={settings.showParasha}
                    onCheckedChange={(checked) => setSettings({...settings, showParasha: checked})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="calculationMethod">Méthode de calcul</Label>
                  <Select 
                    value={settings.calculationMethod}
                    onValueChange={(value) => setSettings({...settings, calculationMethod: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRA">GRA (Vilna Gaon)</SelectItem>
                      <SelectItem value="MGA">MGA (Magen Avraham)</SelectItem>
                      <SelectItem value="CUSTOM">Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="times" className="space-y-4">
              <div className="space-y-4">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="dawn">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Aube (Alot Hashachar)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Alot 72 minutes</Label>
                          <Switch
                            checked={settings.displayAlotHashachar72}
                            onCheckedChange={() => handleToggleZman('displayAlotHashachar72')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Alot 90 minutes</Label>
                          <Switch
                            checked={settings.displayAlotHashachar90}
                            onCheckedChange={() => handleToggleZman('displayAlotHashachar90')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Alot 120 minutes (MGA)</Label>
                          <Switch
                            checked={settings.displayAlotHashachar120}
                            onCheckedChange={() => handleToggleZman('displayAlotHashachar120')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Alot 16.1°</Label>
                          <Switch
                            checked={settings.displayAlotHashachar16_1}
                            onCheckedChange={() => handleToggleZman('displayAlotHashachar16_1')}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="misheyakir">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Misheyakir (Tallit/Tefillin)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Misheyakir 10.2°</Label>
                          <Switch
                            checked={settings.displayMisheyakir10_2}
                            onCheckedChange={() => handleToggleZman('displayMisheyakir10_2')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Misheyakir 11°</Label>
                          <Switch
                            checked={settings.displayMisheyakir11}
                            onCheckedChange={() => handleToggleZman('displayMisheyakir11')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Misheyakir 11.5°</Label>
                          <Switch
                            checked={settings.displayMisheyakir11_5}
                            onCheckedChange={() => handleToggleZman('displayMisheyakir11_5')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Plus tôt pour Tallit</Label>
                          <Switch
                            checked={settings.displayEarliestTallit}
                            onCheckedChange={() => handleToggleZman('displayEarliestTallit')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Plus tôt pour Tefillin</Label>
                          <Switch
                            checked={settings.displayEarliestTefillin}
                            onCheckedChange={() => handleToggleZman('displayEarliestTefillin')}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="sunrise">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Sunrise className="h-4 w-4" />
                        Lever du soleil
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Hanetz HaChama</Label>
                          <Switch
                            checked={settings.displayHanetzHaChama}
                            onCheckedChange={() => handleToggleZman('displayHanetzHaChama')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Hanetz (ajusté élévation)</Label>
                          <Switch
                            checked={settings.displayHanetzElevation}
                            onCheckedChange={() => handleToggleZman('displayHanetzElevation')}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="shema">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Shema
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Sof Zman Shema (GRA)</Label>
                          <Switch
                            checked={settings.displaySofZmanShmaGRA}
                            onCheckedChange={() => handleToggleZman('displaySofZmanShmaGRA')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Sof Zman Shema (MGA)</Label>
                          <Switch
                            checked={settings.displaySofZmanShmaMGA}
                            onCheckedChange={() => handleToggleZman('displaySofZmanShmaMGA')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Sof Zman Shema (3h fixes)</Label>
                          <Switch
                            checked={settings.displaySofZmanShmaFixed}
                            onCheckedChange={() => handleToggleZman('displaySofZmanShmaFixed')}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tefila">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Tefila
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Sof Zman Tefila (GRA)</Label>
                          <Switch
                            checked={settings.displaySofZmanTfilaGRA}
                            onCheckedChange={() => handleToggleZman('displaySofZmanTfilaGRA')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Sof Zman Tefila (MGA)</Label>
                          <Switch
                            checked={settings.displaySofZmanTfilaMGA}
                            onCheckedChange={() => handleToggleZman('displaySofZmanTfilaMGA')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Sof Zman Tefila (4h fixes)</Label>
                          <Switch
                            checked={settings.displaySofZmanTfilaFixed}
                            onCheckedChange={() => handleToggleZman('displaySofZmanTfilaFixed')}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="midday">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Midi
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Chatzot</Label>
                          <Switch
                            checked={settings.displayChatzot}
                            onCheckedChange={() => handleToggleZman('displayChatzot')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Shaah Zmanis (GRA)</Label>
                          <Switch
                            checked={settings.displayShaahZmanisGRA}
                            onCheckedChange={() => handleToggleZman('displayShaahZmanisGRA')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Shaah Zmanis (MGA)</Label>
                          <Switch
                            checked={settings.displayShaahZmanisMGA}
                            onCheckedChange={() => handleToggleZman('displayShaahZmanisMGA')}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="mincha">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Mincha
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Mincha Gedola</Label>
                          <Switch
                            checked={settings.displayMinchaGedola}
                            onCheckedChange={() => handleToggleZman('displayMinchaGedola')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Mincha Gedola (Ateret)</Label>
                          <Switch
                            checked={settings.displayMinchaGedolaAteret}
                            onCheckedChange={() => handleToggleZman('displayMinchaGedolaAteret')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Mincha Ketana</Label>
                          <Switch
                            checked={settings.displayMinchaKetana}
                            onCheckedChange={() => handleToggleZman('displayMinchaKetana')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Mincha Ketana (Ateret)</Label>
                          <Switch
                            checked={settings.displayMinchaKetanaAteret}
                            onCheckedChange={() => handleToggleZman('displayMinchaKetanaAteret')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Plag HaMincha</Label>
                          <Switch
                            checked={settings.displayPlagHamincha}
                            onCheckedChange={() => handleToggleZman('displayPlagHamincha')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Plag HaMincha (Ateret)</Label>
                          <Switch
                            checked={settings.displayPlagHaminchaAteret}
                            onCheckedChange={() => handleToggleZman('displayPlagHaminchaAteret')}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="sunset">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Sunset className="h-4 w-4" />
                        Coucher du soleil
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Shkiat HaChama</Label>
                          <Switch
                            checked={settings.displayShkiatHaChama}
                            onCheckedChange={() => handleToggleZman('displayShkiatHaChama')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Shkia (ajusté élévation)</Label>
                          <Switch
                            checked={settings.displayShkiatElevation}
                            onCheckedChange={() => handleToggleZman('displayShkiatElevation')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Bain Hashmashot</Label>
                          <Switch
                            checked={settings.displayBainHashmashot}
                            onCheckedChange={() => handleToggleZman('displayBainHashmashot')}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="candles">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Allumage des bougies
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Standard (18 min)</Label>
                          <Switch
                            checked={settings.displayCandleLighting}
                            onCheckedChange={() => handleToggleZman('displayCandleLighting')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>20 minutes (Yeroushalayim)</Label>
                          <Switch
                            checked={settings.displayCandleLighting20}
                            onCheckedChange={() => handleToggleZman('displayCandleLighting20')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>30 minutes</Label>
                          <Switch
                            checked={settings.displayCandleLighting30}
                            onCheckedChange={() => handleToggleZman('displayCandleLighting30')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>40 minutes</Label>
                          <Switch
                            checked={settings.displayCandleLighting40}
                            onCheckedChange={() => handleToggleZman('displayCandleLighting40')}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="night">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Sortie des étoiles (Tzeis)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>3 étoiles moyennes</Label>
                          <Switch
                            checked={settings.displayTzeitHakochavim}
                            onCheckedChange={() => handleToggleZman('displayTzeitHakochavim')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>5.95°</Label>
                          <Switch
                            checked={settings.displayTzeit5_95}
                            onCheckedChange={() => handleToggleZman('displayTzeit5_95')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>7.083° (3 petites étoiles)</Label>
                          <Switch
                            checked={settings.displayTzeit7_083}
                            onCheckedChange={() => handleToggleZman('displayTzeit7_083')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>8.5°</Label>
                          <Switch
                            checked={settings.displayTzeit8_5}
                            onCheckedChange={() => handleToggleZman('displayTzeit8_5')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>13° (Rabbeinu Tam)</Label>
                          <Switch
                            checked={settings.displayTzeit13}
                            onCheckedChange={() => handleToggleZman('displayTzeit13')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>16.1°</Label>
                          <Switch
                            checked={settings.displayTzeit16_1}
                            onCheckedChange={() => handleToggleZman('displayTzeit16_1')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>18°</Label>
                          <Switch
                            checked={settings.displayTzeit18}
                            onCheckedChange={() => handleToggleZman('displayTzeit18')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>19.8°</Label>
                          <Switch
                            checked={settings.displayTzeit19_8}
                            onCheckedChange={() => handleToggleZman('displayTzeit19_8')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>26°</Label>
                          <Switch
                            checked={settings.displayTzeit26}
                            onCheckedChange={() => handleToggleZman('displayTzeit26')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>42 minutes</Label>
                          <Switch
                            checked={settings.displayTzeit42}
                            onCheckedChange={() => handleToggleZman('displayTzeit42')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>50 minutes</Label>
                          <Switch
                            checked={settings.displayTzeit50}
                            onCheckedChange={() => handleToggleZman('displayTzeit50')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>72 minutes (Rabbeinu Tam)</Label>
                          <Switch
                            checked={settings.displayTzeit72}
                            onCheckedChange={() => handleToggleZman('displayTzeit72')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>90 minutes</Label>
                          <Switch
                            checked={settings.displayTzeit90}
                            onCheckedChange={() => handleToggleZman('displayTzeit90')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>120 minutes</Label>
                          <Switch
                            checked={settings.displayTzeit120}
                            onCheckedChange={() => handleToggleZman('displayTzeit120')}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="shabbat">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Shabbat / Yom Tov
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Sortie Shabbat</Label>
                          <Switch
                            checked={settings.displayTzeitShabbat}
                            onCheckedChange={() => handleToggleZman('displayTzeitShabbat')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Sortie Shabbat (R. Tam)</Label>
                          <Switch
                            checked={settings.displayTzeitShabbatRT}
                            onCheckedChange={() => handleToggleZman('displayTzeitShabbatRT')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Havdala 8.5°</Label>
                          <Switch
                            checked={settings.displayHavdalah8_5}
                            onCheckedChange={() => handleToggleZman('displayHavdalah8_5')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Havdala 42 min</Label>
                          <Switch
                            checked={settings.displayHavdalah42}
                            onCheckedChange={() => handleToggleZman('displayHavdalah42')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Havdala 50 min</Label>
                          <Switch
                            checked={settings.displayHavdalah50}
                            onCheckedChange={() => handleToggleZman('displayHavdalah50')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Havdala 60 min</Label>
                          <Switch
                            checked={settings.displayHavdalah60}
                            onCheckedChange={() => handleToggleZman('displayHavdalah60')}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Havdala 72 min</Label>
                          <Switch
                            checked={settings.displayHavdalah72}
                            onCheckedChange={() => handleToggleZman('displayHavdalah72')}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {todayZmanim ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Zmanim pour {todayZmanim.location}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadTodayZmanim}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualiser
                    </Button>
                  </div>
                  
                  {todayZmanim.zmanim && (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(todayZmanim.zmanim).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{formatZmanName(key)}:</span>
                          <span className="font-mono">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Chargement des zmanim...
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button onClick={saveSettings} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatZmanName(key: string): string {
  const names: Record<string, string> = {
    alotHaShachar_72: 'Alot (72 min)',
    alotHaShachar_90: 'Alot (90 min)',
    alotHaShachar_120: 'Alot (120 min)',
    alotHaShachar_16_1: 'Alot (16.1°)',
    misheyakir_10_2: 'Misheyakir (10.2°)',
    misheyakir_11: 'Misheyakir (11°)',
    misheyakir_11_5: 'Misheyakir (11.5°)',
    hanetzHaChama: 'Lever du soleil',
    hanetzHaChamaElevation: 'Lever (élévation)',
    sofZmanShmaGRA: 'Fin Shema (GRA)',
    sofZmanShmaMGA: 'Fin Shema (MGA)',
    sofZmanShmaFixedLocal: 'Fin Shema (3h)',
    sofZmanTefilaGRA: 'Fin Tefila (GRA)',
    sofZmanTefilaMGA: 'Fin Tefila (MGA)',
    sofZmanTefilaFixedLocal: 'Fin Tefila (4h)',
    chatzot: 'Chatzot',
    minchaGedola: 'Mincha Gedola',
    minchaGedola_Ateret: 'Mincha Gedola (Ateret)',
    minchaKetana: 'Mincha Ketana',
    minchaKetana_Ateret: 'Mincha Ketana (Ateret)',
    plagHaMincha: 'Plag HaMincha',
    plagHaMincha_Ateret: 'Plag (Ateret)',
    candleLighting: 'Allumage',
    candleLighting_20: 'Allumage (20 min)',
    candleLighting_30: 'Allumage (30 min)',
    candleLighting_40: 'Allumage (40 min)',
    shkiatHaChama: 'Coucher du soleil',
    shkiatHaChamaElevation: 'Coucher (élévation)',
    bainHashmashot: 'Bain Hashmashot',
    tzeitHakochavim: 'Sortie (3 étoiles)',
    tzeitHakochavim_5_95: 'Sortie (5.95°)',
    tzeitHakochavim_7_083: 'Sortie (7.083°)',
    tzeitHakochavim_8_5: 'Sortie (8.5°)',
    tzeitHakochavim_13: 'Sortie (13° RT)',
    tzeitHakochavim_16_1: 'Sortie (16.1°)',
    tzeitHakochavim_18: 'Sortie (18°)',
    tzeitHakochavim_19_8: 'Sortie (19.8°)',
    tzeitHakochavim_26: 'Sortie (26°)',
    tzeitHakochavim_42: 'Sortie (42 min)',
    tzeitHakochavim_50: 'Sortie (50 min)',
    tzeitHakochavim_72: 'Sortie (72 min RT)',
    tzeitHakochavim_90: 'Sortie (90 min)',
    tzeitHakochavim_120: 'Sortie (120 min)',
    tzeitShabbat: 'Sortie Shabbat',
    tzeitShabbat_RT: 'Sortie Shabbat (RT)',
    havdalah_8_5: 'Havdala (8.5°)',
    havdalah_42: 'Havdala (42 min)',
    havdalah_50: 'Havdala (50 min)',
    havdalah_60: 'Havdala (60 min)',
    havdalah_72: 'Havdala (72 min)',
    shaahZmanisGRA: 'Heure (GRA)',
    shaahZmanisMGA: 'Heure (MGA)',
    earliestTallit: 'Plus tôt Tallit',
    earliestTefillin: 'Plus tôt Tefillin',
    hebrewDate: 'Date hébraïque',
    parasha: 'Parasha',
    isShabbat: 'Shabbat',
    isRoshChodesh: 'Rosh Hodesh',
    omerCount: 'Omer',
  };
  
  return names[key] || key;
}
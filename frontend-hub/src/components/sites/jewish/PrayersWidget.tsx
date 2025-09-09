'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Sunrise, Sun, Moon, Bell, ChevronRight } from 'lucide-react';
import { useModule } from '@/providers/tenant-provider';

interface PrayerTimes {
  shaharit?: string;
  minha?: string;
  arvit?: string;
  musaf?: string;
  dayType: string;
  specialName?: string;
}

interface NextPrayer {
  name: string;
  time: string;
}

interface PrayersWidgetProps {
  tenantId: string;
  compact?: boolean;
}

export function PrayersWidget({ tenantId, compact = true }: PrayersWidgetProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [loading, setLoading] = useState(true);
  const isModuleEnabled = useModule('prayers');

  useEffect(() => {
    if (!isModuleEnabled) return;
    
    const loadPrayerTimes = async () => {
      try {
        setLoading(true);
        
        // Charger les horaires du jour
        const todayResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenantId}/prayers/today`
        );
        
        if (todayResponse.ok) {
          const data = await todayResponse.json();
          setPrayerTimes(data);
        }
        
        // Charger la prochaine prière
        const nextResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenantId}/prayers/next`
        );
        
        if (nextResponse.ok) {
          const data = await nextResponse.json();
          setNextPrayer(data.next);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des horaires de prières:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrayerTimes();
    
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(loadPrayerTimes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tenantId, isModuleEnabled]);

  if (!isModuleEnabled) return null;

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (!prayerTimes) return null;

  const getTimeUntilPrayer = (prayerTime: string) => {
    const now = new Date();
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const prayerDate = new Date(now);
    prayerDate.setHours(hours, minutes, 0, 0);
    
    if (prayerDate < now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }
    
    const diff = prayerDate.getTime() - now.getTime();
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntil > 0) {
      return `${hoursUntil}h ${minutesUntil}min`;
    }
    return `${minutesUntil} min`;
  };

  const getPrayerIcon = (name: string) => {
    switch (name?.toLowerCase()) {
      case 'shaharit':
        return <Sunrise className="h-4 w-4" />;
      case 'minha':
        return <Sun className="h-4 w-4" />;
      case 'arvit':
      case 'maariv':
        return <Moon className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (compact) {
    // Version compacte pour la page d'accueil
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horaires de Prières
          </h3>
          {prayerTimes.dayType === 'SHABBAT' && (
            <Badge variant="secondary" className="text-xs">
              Shabbat
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          {/* Prochaine prière en évidence */}
          {nextPrayer && (
            <div className="bg-primary/5 rounded-lg p-2 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPrayerIcon(nextPrayer.name)}
                  <span className="font-medium">{nextPrayer.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{nextPrayer.time}</span>
                  <span className="text-xs text-muted-foreground block">
                    dans {getTimeUntilPrayer(nextPrayer.time)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Liste des prières */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            {prayerTimes.shaharit && (
              <div className="text-center">
                <Sunrise className="h-4 w-4 mx-auto mb-1 text-gray-400" />
                <div className="font-medium">{prayerTimes.shaharit}</div>
                <div className="text-xs text-gray-500">Shaharit</div>
              </div>
            )}
            {prayerTimes.minha && (
              <div className="text-center">
                <Sun className="h-4 w-4 mx-auto mb-1 text-gray-400" />
                <div className="font-medium">{prayerTimes.minha}</div>
                <div className="text-xs text-gray-500">Minha</div>
              </div>
            )}
            {prayerTimes.arvit && (
              <div className="text-center">
                <Moon className="h-4 w-4 mx-auto mb-1 text-gray-400" />
                <div className="font-medium">{prayerTimes.arvit}</div>
                <div className="text-xs text-gray-500">Arvit</div>
              </div>
            )}
          </div>
          
          {/* Musaf pour Shabbat */}
          {prayerTimes.musaf && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Musaf:</span>
                <span className="font-medium">{prayerTimes.musaf}</span>
              </div>
            </div>
          )}
        </div>
        
        <Button 
          variant="link" 
          className="w-full mt-3 text-xs"
          onClick={() => window.location.href = '/prayers'}
        >
          Voir tous les horaires →
        </Button>
      </Card>
    );
  }

  // Version complète (non utilisée actuellement mais disponible)
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horaires de Prières
        </h2>
        {prayerTimes.specialName && (
          <Badge variant="secondary" className="mt-2">
            {prayerTimes.specialName}
          </Badge>
        )}
      </div>

      {/* Prochaine prière */}
      {nextPrayer && (
        <div className="bg-primary/5 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Prochaine prière</p>
              <div className="flex items-center gap-2 mt-1">
                {getPrayerIcon(nextPrayer.name)}
                <span className="text-lg font-bold">{nextPrayer.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{nextPrayer.time}</p>
              <p className="text-sm text-muted-foreground">
                dans {getTimeUntilPrayer(nextPrayer.time)}
              </p>
            </div>
            <Button size="sm" variant="ghost">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Grille des horaires */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {prayerTimes.shaharit && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sunrise className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Shaharit</span>
            </div>
            <p className="text-xl font-bold">{prayerTimes.shaharit}</p>
          </div>
        )}
        
        {prayerTimes.minha && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Minha</span>
            </div>
            <p className="text-xl font-bold">{prayerTimes.minha}</p>
          </div>
        )}
        
        {prayerTimes.arvit && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Arvit</span>
            </div>
            <p className="text-xl font-bold">{prayerTimes.arvit}</p>
          </div>
        )}
        
        {prayerTimes.musaf && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Musaf</span>
            </div>
            <p className="text-xl font-bold">{prayerTimes.musaf}</p>
          </div>
        )}
      </div>

      <Button 
        className="w-full mt-4 gap-1"
        variant="outline"
        onClick={() => window.location.href = '/prayers'}
      >
        Voir le planning complet
        <ChevronRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}
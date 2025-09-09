'use client';

import { useState, useEffect } from 'react';
import { Clock, Sun, Moon, Calendar, Info } from 'lucide-react';
import { ZmanimService, ZmanimData, SynagogueLocation } from '@/lib/services/zmanim.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useModule } from '@/providers/tenant-provider';

interface ZmanimWidgetProps {
  tenantId: string;
  location?: SynagogueLocation;
  compact?: boolean;
  showAllTimes?: boolean;
}

const defaultLocation: SynagogueLocation = {
  name: 'Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  elevation: 35,
  timezone: 'Europe/Paris'
};

const zmanimCategories = {
  morning: {
    title: 'Matin',
    icon: Sun,
    times: [
      { key: 'alotHaShachar_72', label: 'Alot HaShachar (72 min)', default: false },
      { key: 'misheyakir_11', label: 'Misheyakir', default: true },
      { key: 'hanetzHaChama', label: 'Lever du soleil', default: true },
      { key: 'sofZmanShmaGRA', label: 'Fin du Shema (GRA)', default: true },
      { key: 'sofZmanTefilaGRA', label: 'Fin de la Tefila (GRA)', default: true },
    ]
  },
  afternoon: {
    title: 'Après-midi',
    icon: Clock,
    times: [
      { key: 'chatzot', label: 'Hatzot', default: true },
      { key: 'minchaGedola', label: 'Minha Guedola', default: true },
      { key: 'minchaKetana', label: 'Minha Ketana', default: true },
      { key: 'plagHaMincha', label: 'Plag HaMinha', default: false },
    ]
  },
  evening: {
    title: 'Soir',
    icon: Moon,
    times: [
      { key: 'candleLighting', label: 'Allumage des bougies', default: true, special: true },
      { key: 'shkiatHaChama', label: 'Coucher du soleil', default: true },
      { key: 'tzeitHakochavim', label: 'Sortie des étoiles', default: true },
      { key: 'tzeitHakochavim_72', label: 'Sortie (72 min)', default: false },
      { key: 'havdalah', label: 'Havdala', default: true, special: true },
    ]
  }
};

export function ZmanimWidget({ 
  tenantId, 
  location = defaultLocation,
  compact = false,
  showAllTimes = false
}: ZmanimWidgetProps) {
  const [zmanim, setZmanim] = useState<ZmanimData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const isModuleEnabled = useModule('zmanim');

  useEffect(() => {
    if (!isModuleEnabled) return;
    
    const loadZmanim = async () => {
      try {
        setLoading(true);
        // Fetch zmanim from backend API
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenantId}/zmanim/date?date=${dateStr}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setZmanim(data);
        } else {
          // Si l'API échoue, utiliser le service local comme fallback
          const zmanimService = new ZmanimService(location);
          const data = zmanimService.getZmanimForDate(selectedDate);
          setZmanim(data);
        }
      } catch (error) {
        console.error('Error loading zmanim:', error);
        // En cas d'erreur, utiliser le service local comme fallback
        try {
          const zmanimService = new ZmanimService(location);
          const data = zmanimService.getZmanimForDate(selectedDate);
          setZmanim(data);
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadZmanim();
  }, [tenantId, selectedDate, isModuleEnabled, location]);

  if (!isModuleEnabled) return null;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (!zmanim) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (compact) {
    // Version compacte pour la page d'accueil
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Zmanim du jour
          </h3>
          {zmanim.isShabbat && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              Shabbat
            </span>
          )}
        </div>
        
        <div className="space-y-2 text-sm">
          {zmanim.hebrewDate && (
            <div className="font-medium text-primary">{zmanim.hebrewDate}</div>
          )}
          {zmanim.parasha && (
            <div className="text-gray-600">Parashat {zmanim.parasha}</div>
          )}
          
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div>
              <span className="text-gray-500">Shaharit:</span>
              <span className="ml-2 font-medium">{zmanim.hanetzHaChama}</span>
            </div>
            <div>
              <span className="text-gray-500">Minha:</span>
              <span className="ml-2 font-medium">{zmanim.minchaKetana}</span>
            </div>
            {zmanim.candleLighting && (
              <div className="col-span-2">
                <span className="text-gray-500">Allumage:</span>
                <span className="ml-2 font-medium text-primary">{zmanim.candleLighting}</span>
              </div>
            )}
            {zmanim.havdalah && (
              <div className="col-span-2">
                <span className="text-gray-500">Havdala:</span>
                <span className="ml-2 font-medium">{zmanim.havdalah}</span>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="link" 
          className="w-full mt-3 text-xs"
          onClick={() => window.location.href = '/zmanim'}
        >
          Voir tous les horaires →
        </Button>
      </Card>
    );
  }

  // Version complète
  return (
    <Card className="p-6">
      {/* Header with date navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Zmanim
          </h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => changeDate(-1)}
            >
              ←
            </Button>
            <Button 
              variant={isToday(selectedDate) ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Aujourd'hui
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => changeDate(1)}
            >
              →
            </Button>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-medium">{formatDate(selectedDate)}</div>
          {zmanim.hebrewDate && (
            <div className="text-primary font-semibold">{zmanim.hebrewDate}</div>
          )}
          {zmanim.parasha && (
            <div className="text-sm text-gray-600">Parashat {zmanim.parasha}</div>
          )}
        </div>
        
        {/* Special indicators */}
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {zmanim.isShabbat && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Shabbat
            </span>
          )}
          {zmanim.yomTov && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {zmanim.yomTov}
            </span>
          )}
          {zmanim.isRoshChodesh && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Rosh Hodesh
            </span>
          )}
          {zmanim.isFastDay && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              {zmanim.fastName}
            </span>
          )}
          {zmanim.omerCount && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {zmanim.omerCount}ème jour du Omer
            </span>
          )}
        </div>
      </div>

      {/* Zmanim times by category */}
      <div className="space-y-4">
        {Object.entries(zmanimCategories).map(([categoryKey, category]) => {
          const CategoryIcon = category.icon;
          const visibleTimes = category.times.filter(time => 
            showAllTimes || time.default || (time.special && zmanim[time.key as keyof ZmanimData])
          );
          
          if (visibleTimes.length === 0) return null;
          
          return (
            <div key={categoryKey} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold">{category.title}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {expandedCategory === categoryKey ? '−' : '+'}
                </span>
              </button>
              
              {(expandedCategory === categoryKey || !expandedCategory) && (
                <div className="p-4 space-y-2">
                  {visibleTimes.map(time => {
                    const value = zmanim[time.key as keyof ZmanimData];
                    if (!value) return null;
                    
                    return (
                      <div key={time.key} className="flex justify-between items-center py-1">
                        <span className="text-gray-600">{time.label}</span>
                        <span className={`font-medium ${time.special ? 'text-primary' : ''}`}>
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fast times if applicable */}
      {zmanim.isFastDay && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <div className="font-semibold text-red-800 mb-2">{zmanim.fastName}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Début du jeûne:</span>
              <span className="font-medium">{zmanim.fastStarts}</span>
            </div>
            <div className="flex justify-between">
              <span>Fin du jeûne:</span>
              <span className="font-medium">{zmanim.fastEnds}</span>
            </div>
          </div>
        </div>
      )}

      {/* Location info */}
      <div className="mt-4 pt-4 border-t text-center text-xs text-gray-500">
        <Info className="inline h-3 w-3 mr-1" />
        Horaires calculés pour {location.name}
      </div>
    </Card>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, Calendar, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useModule } from '@/providers/tenant-provider';
import { ZmanimService, SynagogueLocation } from '@/lib/services/zmanim.service';

interface Prayer {
  id: string;
  name: string;
  type: 'SHAHARIT' | 'MINHA' | 'ARVIT' | 'MOUSSAF' | 'SELICHOT' | 'SPECIAL';
  timeMode: 'FIXED' | 'ZMAN_BASED' | 'CONDITIONAL';
  fixedTime?: string;
  zmanBased?: {
    baseZman: string;
    offset: number; // minutes
  };
  conditions?: {
    season?: 'summer' | 'winter';
    dayType?: 'weekday' | 'shabbat' | 'holiday';
  };
  location?: string;
  roomId?: string;
  recurrence?: {
    days: number[]; // 0-6 (Sunday-Saturday)
    exceptions?: string[]; // Dates to exclude
  };
  minyan?: {
    required: number;
    current?: number;
  };
  notes?: string;
}

interface PrayerScheduleProps {
  tenantId: string;
  date?: Date;
  compact?: boolean;
}

const defaultLocation: SynagogueLocation = {
  name: 'Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  elevation: 35,
  timezone: 'Europe/Paris'
};

const prayerTypeLabels = {
  SHAHARIT: 'Shaharit',
  MINHA: 'Minha',
  ARVIT: 'Arvit',
  MOUSSAF: 'Moussaf',
  SELICHOT: 'Selichot',
  SPECIAL: 'Spécial'
};

const prayerTypeColors = {
  SHAHARIT: 'bg-yellow-100 text-yellow-800',
  MINHA: 'bg-orange-100 text-orange-800',
  ARVIT: 'bg-indigo-100 text-indigo-800',
  MOUSSAF: 'bg-purple-100 text-purple-800',
  SELICHOT: 'bg-gray-100 text-gray-800',
  SPECIAL: 'bg-pink-100 text-pink-800'
};

export function PrayerSchedule({ 
  tenantId, 
  date = new Date(),
  compact = false 
}: PrayerScheduleProps) {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [calculatedTimes, setCalculatedTimes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(date);
  const isModuleEnabled = useModule('prayers');

  useEffect(() => {
    if (!isModuleEnabled) return;
    
    const loadPrayers = async () => {
      try {
        setLoading(true);
        
        // Fetch prayers from backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${tenantId}/prayers?date=${selectedDay.toISOString()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setPrayers(data);
          
          // Calculate times for zman-based prayers
          await calculatePrayerTimes(data);
        } else {
          // Use mock data for demo
          const mockPrayers = getMockPrayers(selectedDay);
          setPrayers(mockPrayers);
          await calculatePrayerTimes(mockPrayers);
        }
      } catch (error) {
        console.error('Error loading prayers:', error);
        // Use mock data on error
        const mockPrayers = getMockPrayers(selectedDay);
        setPrayers(mockPrayers);
        await calculatePrayerTimes(mockPrayers);
      } finally {
        setLoading(false);
      }
    };

    loadPrayers();
  }, [tenantId, selectedDay, isModuleEnabled]);

  const calculatePrayerTimes = async (prayerList: Prayer[]) => {
    const zmanimService = new ZmanimService(defaultLocation);
    const zmanim = zmanimService.getZmanimForDate(selectedDay);
    const times: Record<string, string> = {};

    prayerList.forEach(prayer => {
      if (prayer.timeMode === 'FIXED' && prayer.fixedTime) {
        times[prayer.id] = prayer.fixedTime;
      } else if (prayer.timeMode === 'ZMAN_BASED' && prayer.zmanBased) {
        const baseTime = zmanim[prayer.zmanBased.baseZman as keyof typeof zmanim] as string;
        if (baseTime) {
          const [hours, minutes] = baseTime.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + prayer.zmanBased.offset;
          const newHours = Math.floor(totalMinutes / 60);
          const newMinutes = totalMinutes % 60;
          times[prayer.id] = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        }
      }
    });

    setCalculatedTimes(times);
  };

  const getMockPrayers = (date: Date): Prayer[] => {
    const dayOfWeek = date.getDay();
    const isShabbat = dayOfWeek === 6;
    const isFriday = dayOfWeek === 5;

    const weekdayPrayers: Prayer[] = [
      {
        id: '1',
        name: 'Shaharit',
        type: 'SHAHARIT',
        timeMode: 'FIXED',
        fixedTime: '07:00',
        location: 'Salle principale',
        recurrence: { days: [0, 1, 2, 3, 4, 5] },
        minyan: { required: 10, current: 8 }
      },
      {
        id: '2',
        name: 'Minha',
        type: 'MINHA',
        timeMode: 'ZMAN_BASED',
        zmanBased: { baseZman: 'minchaKetana', offset: 0 },
        location: 'Salle principale',
        recurrence: { days: [0, 1, 2, 3, 4, 5, 6] }
      },
      {
        id: '3',
        name: 'Arvit',
        type: 'ARVIT',
        timeMode: 'ZMAN_BASED',
        zmanBased: { baseZman: 'tzeitHakochavim', offset: 5 },
        location: 'Salle principale',
        recurrence: { days: [0, 1, 2, 3, 4, 5, 6] }
      }
    ];

    const shabbatPrayers: Prayer[] = [
      {
        id: '4',
        name: 'Kabbalat Shabbat',
        type: 'SPECIAL',
        timeMode: 'ZMAN_BASED',
        zmanBased: { baseZman: 'candleLighting', offset: 0 },
        location: 'Salle principale',
        recurrence: { days: [5] },
        notes: 'Suivi de Arvit'
      },
      {
        id: '5',
        name: 'Shaharit Shabbat',
        type: 'SHAHARIT',
        timeMode: 'FIXED',
        fixedTime: '09:00',
        location: 'Salle principale',
        recurrence: { days: [6] }
      },
      {
        id: '6',
        name: 'Moussaf',
        type: 'MOUSSAF',
        timeMode: 'FIXED',
        fixedTime: '10:30',
        location: 'Salle principale',
        recurrence: { days: [6] }
      }
    ];

    if (isShabbat) {
      return shabbatPrayers.filter(p => p.recurrence?.days.includes(6));
    } else if (isFriday) {
      return [
        ...weekdayPrayers.filter(p => p.recurrence?.days.includes(5)),
        ...shabbatPrayers.filter(p => p.recurrence?.days.includes(5))
      ];
    } else {
      return weekdayPrayers.filter(p => p.recurrence?.days.includes(dayOfWeek));
    }
  };

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

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const changeDay = (days: number) => {
    const newDate = new Date(selectedDay);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDay(newDate);
  };

  if (compact) {
    // Version compacte
    const nextPrayers = prayers
      .filter(p => {
        const time = calculatedTimes[p.id];
        if (!time) return false;
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        const prayerTime = new Date(selectedDay);
        prayerTime.setHours(hours, minutes, 0, 0);
        return prayerTime > now;
      })
      .slice(0, 3);

    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horaires de Prières
          </h3>
          <span className="text-xs text-gray-500">
            {getDayName(selectedDay)}
          </span>
        </div>
        
        <div className="space-y-2">
          {prayers.slice(0, 4).map(prayer => (
            <div key={prayer.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${prayerTypeColors[prayer.type]}`}>
                  {prayerTypeLabels[prayer.type]}
                </Badge>
                <span>{prayer.name}</span>
              </div>
              <span className="font-medium">
                {calculatedTimes[prayer.id] || '--:--'}
              </span>
            </div>
          ))}
        </div>
        
        <Button 
          variant="link" 
          className="w-full mt-3 text-xs"
          onClick={() => window.location.href = '/prayers'}
        >
          Voir tous les offices →
        </Button>
      </Card>
    );
  }

  // Version complète
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Horaires de Prières</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => changeDay(-1)}
            >
              ←
            </Button>
            <Button 
              variant={isToday(selectedDay) ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDay(new Date())}
            >
              Aujourd'hui
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => changeDay(1)}
            >
              →
            </Button>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-medium capitalize">{getDayName(selectedDay)}</div>
          <div className="text-sm text-gray-600">{formatDate(selectedDay)}</div>
        </div>
      </div>

      {/* Prayer List */}
      <div className="space-y-3">
        {prayers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun office programmé pour ce jour
          </div>
        ) : (
          prayers.map(prayer => {
            const time = calculatedTimes[prayer.id];
            const isPast = () => {
              if (!time) return false;
              const now = new Date();
              const [hours, minutes] = time.split(':').map(Number);
              const prayerTime = new Date(selectedDay);
              prayerTime.setHours(hours, minutes, 0, 0);
              return prayerTime < now && isToday(selectedDay);
            };

            return (
              <div 
                key={prayer.id} 
                className={`border rounded-lg p-4 ${isPast() ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={prayerTypeColors[prayer.type]}>
                        {prayerTypeLabels[prayer.type]}
                      </Badge>
                      <h3 className="font-semibold text-lg">{prayer.name}</h3>
                      {time && (
                        <span className="text-xl font-bold text-primary ml-auto mr-4">
                          {time}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {prayer.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{prayer.location}</span>
                        </div>
                      )}
                      
                      {prayer.minyan && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            Minyan: {prayer.minyan.current || 0}/{prayer.minyan.required}
                          </span>
                          {prayer.minyan.current && prayer.minyan.current < prayer.minyan.required && (
                            <span className="text-orange-600 font-medium">
                              (Manque {prayer.minyan.required - prayer.minyan.current})
                            </span>
                          )}
                        </div>
                      )}
                      
                      {prayer.timeMode === 'ZMAN_BASED' && prayer.zmanBased && (
                        <div className="text-xs text-gray-500">
                          Basé sur {prayer.zmanBased.baseZman}
                          {prayer.zmanBased.offset !== 0 && ` ${prayer.zmanBased.offset > 0 ? '+' : ''}${prayer.zmanBased.offset} min`}
                        </div>
                      )}
                    </div>
                    
                    {prayer.notes && (
                      <div className="mt-2 text-sm text-gray-600 italic">
                        {prayer.notes}
                      </div>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Weekly View Link */}
      <div className="mt-6 pt-4 border-t">
        <Button variant="outline" className="w-full">
          <Calendar className="h-4 w-4 mr-2" />
          Voir le planning de la semaine
        </Button>
      </div>
    </Card>
  );
}
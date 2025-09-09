'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Star,
  Heart,
  Gift,
  Cake,
  Baby,
  BookOpen,
  Music
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  room?: string;
  rabbi?: string;
  capacity?: number;
  attendees?: number;
  isRecurring?: boolean;
  recurrencePattern?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isSpecial?: boolean;
}

enum EventType {
  SHAHARIT = 'SHAHARIT',
  MINHA = 'MINHA',
  ARVIT = 'ARVIT',
  SEUDA = 'SEUDA',
  SHIUR = 'SHIUR',
  BAR_MITZVAH = 'BAR_MITZVAH',
  BAT_MITZVAH = 'BAT_MITZVAH',
  BRIT_MILA = 'BRIT_MILA',
  WEDDING = 'WEDDING',
  PIDYON_HABEN = 'PIDYON_HABEN',
  SIYUM = 'SIYUM',
  MELAVA_MALKA = 'MELAVA_MALKA',
  KIDDUSH = 'KIDDUSH',
  YAHRTZEIT = 'YAHRTZEIT',
  COMMUNITY = 'COMMUNITY',
  YOUTH = 'YOUTH',
  WOMEN = 'WOMEN',
  OTHER = 'OTHER'
}

interface EventsCalendarWidgetProps {
  tenantId: string;
  className?: string;
  displayMode?: 'calendar' | 'list' | 'agenda' | 'minimal';
  showFilters?: boolean;
  maxEvents?: number;
  eventTypes?: EventType[];
}

const EVENT_ICONS: Record<EventType, any> = {
  SHAHARIT: Clock,
  MINHA: Clock,
  ARVIT: Clock,
  SEUDA: Heart,
  SHIUR: BookOpen,
  BAR_MITZVAH: Star,
  BAT_MITZVAH: Star,
  BRIT_MILA: Baby,
  WEDDING: Heart,
  PIDYON_HABEN: Gift,
  SIYUM: BookOpen,
  MELAVA_MALKA: Music,
  KIDDUSH: Gift,
  YAHRTZEIT: Star,
  COMMUNITY: Users,
  YOUTH: Users,
  WOMEN: Users,
  OTHER: Calendar
};

const EVENT_COLORS: Record<EventType, string> = {
  SHAHARIT: 'bg-blue-100 text-blue-800',
  MINHA: 'bg-orange-100 text-orange-800',
  ARVIT: 'bg-indigo-100 text-indigo-800',
  SEUDA: 'bg-green-100 text-green-800',
  SHIUR: 'bg-purple-100 text-purple-800',
  BAR_MITZVAH: 'bg-pink-100 text-pink-800',
  BAT_MITZVAH: 'bg-pink-100 text-pink-800',
  BRIT_MILA: 'bg-cyan-100 text-cyan-800',
  WEDDING: 'bg-red-100 text-red-800',
  PIDYON_HABEN: 'bg-yellow-100 text-yellow-800',
  SIYUM: 'bg-emerald-100 text-emerald-800',
  MELAVA_MALKA: 'bg-violet-100 text-violet-800',
  KIDDUSH: 'bg-amber-100 text-amber-800',
  YAHRTZEIT: 'bg-gray-100 text-gray-800',
  COMMUNITY: 'bg-teal-100 text-teal-800',
  YOUTH: 'bg-lime-100 text-lime-800',
  WOMEN: 'bg-rose-100 text-rose-800',
  OTHER: 'bg-slate-100 text-slate-800'
};

const EVENT_LABELS: Record<EventType, string> = {
  SHAHARIT: 'Shaharit',
  MINHA: 'Minha',
  ARVIT: 'Arvit',
  SEUDA: 'Séouda',
  SHIUR: 'Cours Torah',
  BAR_MITZVAH: 'Bar Mitzvah',
  BAT_MITZVAH: 'Bat Mitzvah',
  BRIT_MILA: 'Brit Mila',
  WEDDING: 'Mariage',
  PIDYON_HABEN: 'Pidyon HaBen',
  SIYUM: 'Siyoum',
  MELAVA_MALKA: 'Melava Malka',
  KIDDUSH: 'Kiddoush',
  YAHRTZEIT: 'Yahrtzeit',
  COMMUNITY: 'Communautaire',
  YOUTH: 'Jeunesse',
  WOMEN: 'Femmes',
  OTHER: 'Autre'
};

// Mock data - replace with API call
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Shaharit',
    type: EventType.SHAHARIT,
    date: new Date().toISOString().split('T')[0],
    startTime: '07:00',
    location: 'Synagogue principale',
    status: 'upcoming',
    isRecurring: true,
    recurrencePattern: 'Tous les jours'
  },
  {
    id: '2',
    title: 'Cours de Guemara',
    description: 'Traité Berakhot',
    type: EventType.SHIUR,
    date: new Date().toISOString().split('T')[0],
    startTime: '19:30',
    endTime: '20:30',
    location: 'Beit Midrash',
    rabbi: 'Rav Cohen',
    status: 'upcoming',
    isRecurring: true,
    recurrencePattern: 'Tous les mardis'
  },
  {
    id: '3',
    title: 'Bar Mitzvah de David',
    type: EventType.BAR_MITZVAH,
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '09:00',
    location: 'Synagogue principale',
    status: 'upcoming',
    isSpecial: true
  }
];

export function EventsCalendarWidget({ 
  tenantId, 
  className,
  displayMode = 'list',
  showFilters = true,
  maxEvents = 10,
  eventTypes
}: EventsCalendarWidgetProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>(eventTypes || []);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadEvents();
  }, [tenantId, selectedDate, selectedTypes]);

  const loadEvents = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/tenant/${tenantId}/events`);
      // const data = await response.json();
      
      // For now, use mock data
      let filteredEvents = [...MOCK_EVENTS];
      
      if (selectedTypes.length > 0) {
        filteredEvents = filteredEvents.filter(e => selectedTypes.includes(e.type));
      }
      
      setEvents(filteredEvents.slice(0, maxEvents));
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const toggleEventType = (type: EventType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getEventIcon = (type: EventType) => {
    const Icon = EVENT_ICONS[type] || Calendar;
    return <Icon className="h-4 w-4" />;
  };

  const formatEventTime = (event: Event): string => {
    let time = event.startTime;
    if (event.endTime) {
      time += ` - ${event.endTime}`;
    }
    return time;
  };

  const isToday = (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const isFuture = (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return date > today;
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="h-64" />
      </Card>
    );
  }

  // Minimal mode
  if (displayMode === 'minimal') {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Prochains événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getEventIcon(event.type)}
                  <span>{event.title}</span>
                </div>
                <span className="text-muted-foreground">{event.startTime}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agenda mode
  if (displayMode === 'agenda') {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Agenda</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeDate(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-normal">
                {selectedDate.toLocaleDateString('fr-FR')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeDate(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Time slots */}
            <div className="space-y-px">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="h-12 border-t border-dashed relative">
                  <span className="text-xs text-muted-foreground absolute -top-2 left-0 bg-background px-1">
                    {i.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>
            
            {/* Events overlay */}
            <div className="absolute inset-0">
              {events.map((event) => {
                const [hours, minutes] = event.startTime.split(':').map(Number);
                const top = (hours + minutes / 60) * 48; // 48px per hour
                
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "absolute left-12 right-0 p-1 rounded text-xs",
                      EVENT_COLORS[event.type]
                    )}
                    style={{ top: `${top}px` }}
                  >
                    <div className="font-medium">{event.title}</div>
                    {event.location && (
                      <div className="opacity-75">{event.location}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List mode (default)
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>Événements</span>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {showFilters && (
          <Tabs defaultValue="all" className="mb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="prayers">Prières</TabsTrigger>
              <TabsTrigger value="courses">Cours</TabsTrigger>
              <TabsTrigger value="special">Spéciaux</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={cn(
                "p-3 rounded-lg border",
                isToday(event.date) && "border-primary bg-primary/5",
                event.status === 'cancelled' && "opacity-50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded", EVENT_COLORS[event.type])}>
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      {event.isSpecial && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {event.isRecurring && (
                        <Badge variant="secondary" className="text-xs">
                          Récurrent
                        </Badge>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatEventTime(event)}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                      
                      {event.rabbi && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.rabbi}
                        </div>
                      )}
                    </div>
                    
                    {event.recurrencePattern && (
                      <p className="text-xs text-muted-foreground">
                        {event.recurrencePattern}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge 
                    variant={event.status === 'cancelled' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {EVENT_LABELS[event.type]}
                  </Badge>
                  
                  {event.capacity && event.attendees && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {event.attendees}/{event.capacity} inscrits
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucun événement prévu</p>
          </div>
        )}
        
        {events.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="outline" className="w-full">
              Voir tous les événements
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
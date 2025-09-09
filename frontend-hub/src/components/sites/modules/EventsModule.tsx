'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, ChevronRight, Plus } from 'lucide-react';
import { useTenant } from '@/providers/tenant-provider';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  category: 'prayer' | 'course' | 'community' | 'celebration' | 'conference';
  maxParticipants?: number;
  currentParticipants: number;
  imageUrl?: string;
  price?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

const categoryColors = {
  prayer: 'bg-purple-100 text-purple-800',
  course: 'bg-blue-100 text-blue-800',
  community: 'bg-green-100 text-green-800',
  celebration: 'bg-yellow-100 text-yellow-800',
  conference: 'bg-indigo-100 text-indigo-800',
};

const categoryLabels = {
  prayer: 'Office',
  course: 'Cours',
  community: 'Communautaire',
  celebration: 'Célébration',
  conference: 'Conférence',
};

export function EventsModule() {
  const { tenant, isModuleEnabled } = useTenant();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  if (!isModuleEnabled('events')) {
    return null;
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Pour l'instant, utilisons des données fictives
      setEvents([
        {
          id: '1',
          title: 'Office de Shabbat',
          description: 'Office traditionnel du vendredi soir suivi d\'un kiddouch communautaire',
          startDate: '2024-01-19T18:30:00',
          endDate: '2024-01-19T20:00:00',
          location: 'Synagogue principale',
          category: 'prayer',
          currentParticipants: 45,
          maxParticipants: 100,
          isRecurring: true,
          recurrenceRule: 'Tous les vendredis',
        },
        {
          id: '2',
          title: 'Cours de Talmud',
          description: 'Étude approfondie du traité Berakhot avec le Rav Cohen',
          startDate: '2024-01-21T20:00:00',
          endDate: '2024-01-21T21:30:00',
          location: 'Salle d\'étude',
          category: 'course',
          currentParticipants: 12,
          maxParticipants: 20,
          isRecurring: true,
          recurrenceRule: 'Tous les lundis',
        },
        {
          id: '3',
          title: 'Soirée caritative',
          description: 'Grande soirée de collecte de fonds pour les familles dans le besoin',
          startDate: '2024-01-28T19:00:00',
          location: 'Salle des fêtes',
          category: 'community',
          currentParticipants: 78,
          maxParticipants: 150,
          price: 50,
        },
        {
          id: '4',
          title: 'Bar Mitzvah de David',
          description: 'Célébration de la Bar Mitzvah de David Cohen',
          startDate: '2024-01-27T09:00:00',
          endDate: '2024-01-27T13:00:00',
          location: 'Synagogue principale',
          category: 'celebration',
          currentParticipants: 120,
        },
        {
          id: '5',
          title: 'Conférence: Histoire du Judaïsme',
          description: 'Conférence exceptionnelle du Professeur Levy sur l\'histoire du judaïsme français',
          startDate: '2024-02-04T19:30:00',
          endDate: '2024-02-04T21:30:00',
          location: 'Auditorium',
          category: 'conference',
          currentParticipants: 35,
          maxParticipants: 80,
          price: 10,
        },
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.category === filter);

  const formatEventDate = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    const dateStr = format(start, 'EEEE d MMMM', { locale: fr });
    const startTime = format(start, 'HH:mm');
    const endTime = end ? format(end, 'HH:mm') : '';
    
    return {
      date: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
      time: end ? `${startTime} - ${endTime}` : startTime
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Événements à venir</h2>
          <p className="text-muted-foreground">
            Découvrez tous les événements de {tenant.name}
          </p>
        </div>
        
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Proposer un événement
        </Button>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Tous ({events.length})
        </Button>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const count = events.filter(e => e.category === key).length;
          if (count === 0) return null;
          
          return (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key)}
            >
              {label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Liste des événements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map(event => {
          const { date, time } = formatEventDate(event.startDate, event.endDate);
          const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;
          
          return (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image placeholder */}
              <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/20 relative">
                <Badge 
                  className={`absolute top-2 right-2 ${categoryColors[event.category]}`}
                  variant="secondary"
                >
                  {categoryLabels[event.category]}
                </Badge>
                {event.isRecurring && (
                  <Badge className="absolute top-2 left-2" variant="outline">
                    Récurrent
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{date}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>

                  {event.maxParticipants && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.currentParticipants}/{event.maxParticipants} participants
                      </span>
                      {isFull && (
                        <Badge variant="destructive" className="text-xs">
                          Complet
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  {event.price !== undefined && (
                    <span className="font-semibold">
                      {event.price === 0 ? 'Gratuit' : `${event.price}€`}
                    </span>
                  )}
                  
                  <Button 
                    size="sm" 
                    className="ml-auto gap-1"
                    disabled={isFull}
                  >
                    {isFull ? 'Complet' : 'Détails'}
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Aucun événement dans cette catégorie
          </p>
        </Card>
      )}
    </div>
  );
}
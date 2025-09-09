'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/providers/tenant-provider';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  price?: number;
  type: string;
  status: string;
}

interface EventsPageProps {
  tenantId: string;
}

export function EventsPage({ tenantId }: EventsPageProps) {
  const { tenant } = useTenant();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    fetchEvents();
  }, [tenantId]);

  useEffect(() => {
    filterEvents();
  }, [events, selectedType, selectedMonth]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${tenantId}/events`);
      const data = await response.json();
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    // Filter by month (for calendar view)
    if (viewMode === 'calendar') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getMonth() === selectedMonth.getMonth() &&
               eventDate.getFullYear() === selectedMonth.getFullYear();
      });
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    setFilteredEvents(filtered);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      RELIGIOUS: 'bg-purple-100 text-purple-800',
      CULTURAL: 'bg-blue-100 text-blue-800',
      EDUCATIONAL: 'bg-green-100 text-green-800',
      SOCIAL: 'bg-yellow-100 text-yellow-800',
      FUNDRAISING: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      RELIGIOUS: 'Religieux',
      CULTURAL: 'Culturel',
      EDUCATIONAL: 'Éducatif',
      SOCIAL: 'Social',
      FUNDRAISING: 'Collecte de fonds'
    };
    return labels[type] || type;
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedMonth(newDate);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Événements</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Participez aux événements de notre communauté
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              Liste
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={() => setViewMode('calendar')}
            >
              Calendrier
            </Button>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tous les types</option>
              <option value="RELIGIOUS">Religieux</option>
              <option value="CULTURAL">Culturel</option>
              <option value="EDUCATIONAL">Éducatif</option>
              <option value="SOCIAL">Social</option>
              <option value="FUNDRAISING">Collecte de fonds</option>
            </select>
          </div>

          {/* Month Navigation (for calendar view) */}
          {viewMode === 'calendar' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold min-w-[150px] text-center">
                {selectedMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun événement trouvé</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Date Block */}
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {new Date(event.startDate).getDate()}
                    </div>
                    <div className="text-sm text-primary/80">
                      {new Date(event.startDate).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.type)}`}>
                        {getEventTypeLabel(event.type)}
                      </span>
                    </div>
                    {event.price !== undefined && event.price > 0 && (
                      <div className="text-lg font-bold text-primary">
                        {event.price}€
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-gray-600 mb-3">
                      {event.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(event.startDate)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.maxParticipants && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.currentParticipants || 0}/{event.maxParticipants} participants
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button>
                      S'inscrire
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CalendarView events={filteredEvents} selectedMonth={selectedMonth} />
      )}
    </div>
  );
}

// Simple Calendar View Component
function CalendarView({ events, selectedMonth }: { events: Event[]; selectedMonth: Date }) {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedMonth);
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getDate() === day;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="h-24" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayEvents = getEventsForDay(day);

          return (
            <div key={day} className="border rounded-lg p-2 h-24 overflow-hidden hover:shadow-md transition-shadow">
              <div className="font-semibold text-sm mb-1">{day}</div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event, index) => (
                  <div
                    key={index}
                    className="text-xs p-1 bg-primary/10 text-primary rounded truncate cursor-pointer hover:bg-primary/20"
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
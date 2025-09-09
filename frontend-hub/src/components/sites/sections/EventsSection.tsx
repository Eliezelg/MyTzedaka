import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

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
  image?: string;
  type: string;
}

interface EventsSectionProps {
  events: Event[];
  title?: string;
  viewAllLink?: string;
}

export function EventsSection({ 
  events, 
  title = 'Prochains Événements',
  viewAllLink = '/events'
}: EventsSectionProps) {
  if (!events || events.length === 0) return null;

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

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
          <h2 className="text-3xl font-bold mb-4 sm:mb-0">{title}</h2>
          <Button asChild variant="outline">
            <Link href={viewAllLink}>
              Voir tous les événements
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {events.slice(0, 3).map((event) => (
            <div key={event.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
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
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
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

                  <Button asChild size="sm">
                    <Link href={`/events/${event.id}`}>
                      En savoir plus
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Heart, Star, Clock } from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { fr, he } from 'date-fns/locale';
import { useTenant } from '@/providers/tenant-provider';
import { HDate } from '@hebcal/core';

interface ParnassSponsor {
  id: string;
  type: 'DAILY' | 'MONTHLY' | 'YEARLY';
  sponsorDate: Date;
  sponsorName: string;
  sponsorMessage?: string;
  isAnonymous: boolean;
  dedicationType?: string;
  dedicationName?: string;
  dedicationNameHebrew?: string;
  amount: number;
  isHighlighted: boolean;
}

interface ParnassWidgetProps {
  type?: 'DAILY' | 'MONTHLY' | 'YEARLY' | 'ALL';
  variant?: 'compact' | 'full' | 'banner';
  showUpcoming?: boolean;
  allowBooking?: boolean;
}

const dedicationLabels = {
  IN_MEMORY: { fr: "À la mémoire de", he: "לעילוי נשמת" },
  FOR_HEALING: { fr: "Pour la guérison de", he: "לרפואה שלמה" },
  FOR_SUCCESS: { fr: "Pour la réussite de", he: "להצלחת" },
  IN_HONOR: { fr: "En l'honneur de", he: "לכבוד" },
  FOR_MERIT: { fr: "Pour le mérite de", he: "לזכות" }
};

export function ParnassWidget({ 
  type = 'ALL',
  variant = 'full',
  showUpcoming = true,
  allowBooking = true 
}: ParnassWidgetProps) {
  const { tenant } = useTenant();
  const [sponsors, setSponsors] = useState<ParnassSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchSponsors();
  }, [selectedDate, type]);

  const fetchSponsors = async () => {
    try {
      const params = new URLSearchParams({
        date: selectedDate.toISOString(),
        ...(type !== 'ALL' && { type })
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sites/${tenant.slug}/parnass?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        setSponsors(data);
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHebrewDate = (date: Date) => {
    const hDate = new HDate(date);
    return hDate.renderGematriya();
  };

  const getSponsorForType = (sponsorType: string) => {
    return sponsors.find(s => s.type === sponsorType && 
      new Date(s.sponsorDate).toDateString() === selectedDate.toDateString());
  };

  const handleBooking = (sponsorType: string) => {
    window.location.href = `/sites/${tenant.slug}/parnass/book?type=${sponsorType}&date=${selectedDate.toISOString()}`;
  };

  const renderCompact = () => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Sponsors du Jour</h3>
        <Badge variant="secondary">
          {getHebrewDate(selectedDate)}
        </Badge>
      </div>

      <div className="space-y-2">
        {['DAILY', 'MONTHLY', 'YEARLY'].map(sponsorType => {
          const sponsor = getSponsorForType(sponsorType);
          const title = sponsorType === 'DAILY' ? 'Jour' : 
                       sponsorType === 'MONTHLY' ? 'Mois' : 'Année';
          
          if (!sponsor && !allowBooking) return null;

          return (
            <div key={sponsorType} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{title}:</span>
              </div>
              {sponsor ? (
                <span className="text-sm">{sponsor.isAnonymous ? 'Anonyme' : sponsor.sponsorName}</span>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => handleBooking(sponsorType)}>
                  Réserver
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );

  const renderFull = () => (
    <div className="space-y-4">
      {/* Date Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
              <p className="text-sm text-gray-600">
                {getHebrewDate(selectedDate)}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            >
              ← Précédent
            </Button>
            <Button
              size="sm"
              variant={isToday(selectedDate) ? 'default' : 'outline'}
              onClick={() => setSelectedDate(new Date())}
            >
              Aujourd'hui
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              Suivant →
            </Button>
          </div>
        </div>
      </Card>

      {/* Sponsors Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { type: 'DAILY', title: 'Parnass HaYom', titleHe: 'פרנס היום', icon: Clock, color: 'blue' },
          { type: 'MONTHLY', title: 'Parnass HaChodesh', titleHe: 'פרנס החודש', icon: Calendar, color: 'purple' },
          { type: 'YEARLY', title: 'Parnass HaShana', titleHe: 'פרנס השנה', icon: Star, color: 'yellow' }
        ].map(({ type: sponsorType, title, titleHe, icon: Icon, color }) => {
          const sponsor = getSponsorForType(sponsorType);
          
          return (
            <Card 
              key={sponsorType}
              className={`p-6 ${sponsor?.isHighlighted ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-lg">{title}</h4>
                  <p className="text-sm text-gray-600 font-hebrew">{titleHe}</p>
                </div>
                <Icon className={`h-8 w-8 text-${color}-500`} />
              </div>

              {sponsor ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">
                      {sponsor.isAnonymous ? 'Donateur Anonyme' : sponsor.sponsorName}
                    </span>
                  </div>

                  {sponsor.dedicationType && sponsor.dedicationName && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        {dedicationLabels[sponsor.dedicationType as keyof typeof dedicationLabels].fr}
                      </p>
                      <p className="font-semibold">{sponsor.dedicationName}</p>
                      {sponsor.dedicationNameHebrew && (
                        <p className="font-hebrew text-right">{sponsor.dedicationNameHebrew}</p>
                      )}
                    </div>
                  )}

                  {sponsor.sponsorMessage && (
                    <p className="text-sm italic text-gray-700 border-l-4 border-primary pl-3">
                      "{sponsor.sponsorMessage}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-3">Emplacement disponible</p>
                  {allowBooking && (
                    <Button 
                      onClick={() => handleBooking(sponsorType)}
                      className="w-full"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Devenir Sponsor
                    </Button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Upcoming Sponsors */}
      {showUpcoming && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Prochains Sponsors</h4>
          <div className="space-y-2">
            {sponsors
              .filter(s => new Date(s.sponsorDate) > selectedDate)
              .slice(0, 5)
              .map(sponsor => (
                <div key={sponsor.id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">
                      {format(new Date(sponsor.sponsorDate), 'd MMMM', { locale: fr })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {sponsor.type === 'DAILY' ? 'Jour' : 
                       sponsor.type === 'MONTHLY' ? 'Mois' : 'Année'}
                    </p>
                  </div>
                  <p className="text-sm">
                    {sponsor.isAnonymous ? 'Anonyme' : sponsor.sponsorName}
                  </p>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderBanner = () => {
    const todaySponsor = sponsors.find(s => 
      s.type === 'DAILY' && isToday(new Date(s.sponsorDate))
    );

    if (!todaySponsor) return null;

    return (
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-gray-600">Parnass HaYom - פרנס היום</p>
              <p className="font-semibold">
                {todaySponsor.isAnonymous ? 'Donateur Anonyme' : todaySponsor.sponsorName}
              </p>
            </div>
          </div>
          {todaySponsor.dedicationType && todaySponsor.dedicationName && (
            <p className="text-sm text-gray-700">
              {dedicationLabels[todaySponsor.dedicationType as keyof typeof dedicationLabels].fr} {todaySponsor.dedicationName}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />;
  }

  switch (variant) {
    case 'compact':
      return renderCompact();
    case 'banner':
      return renderBanner();
    default:
      return renderFull();
  }
}
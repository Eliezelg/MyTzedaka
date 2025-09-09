'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Calendar, User, Heart, Trophy, ChevronRight } from 'lucide-react';
import { useTenant } from '@/providers/tenant-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ParnassSponsor {
  id: string;
  type: 'DAILY' | 'MONTHLY' | 'YEARLY';
  sponsorDate: string;
  sponsorName: string;
  sponsorMessage?: string;
  isAnonymous: boolean;
  dedicationType?: string;
  dedicationName?: string;
  dedicationNameHebrew?: string;
  amount: number;
  displayPriority: number;
  isHighlighted: boolean;
}

interface CurrentSponsors {
  daily?: ParnassSponsor;
  monthly?: ParnassSponsor;
  yearly?: ParnassSponsor;
}

const DEDICATION_TYPES = {
  IN_MEMORY: { label: 'לעילוי נשמת', color: 'bg-gray-100 text-gray-800' },
  FOR_HEALING: { label: 'לרפואה שלמה', color: 'bg-green-100 text-green-800' },
  FOR_SUCCESS: { label: 'להצלחת', color: 'bg-blue-100 text-blue-800' },
  IN_HONOR: { label: 'לכבוד', color: 'bg-purple-100 text-purple-800' },
  FOR_MERIT: { label: 'לזכות', color: 'bg-yellow-100 text-yellow-800' },
};

export function ParnassWidget() {
  const { tenant } = useTenant();
  const [currentSponsors, setCurrentSponsors] = useState<CurrentSponsors>({});
  const [loading, setLoading] = useState(true);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      loadCurrentSponsors();
    }
  }, [tenant?.id]);

  const loadCurrentSponsors = async () => {
    if (!tenant?.id) return;
    
    try {
      const response = await fetch(`/api/tenant/${tenant.id}/parnass/current`);
      if (response.ok) {
        const data = await response.json();
        setCurrentSponsors(data);
      }
    } catch (error) {
      console.error('Error loading sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSponsorTypeLabel = (type: string) => {
    switch (type) {
      case 'DAILY':
        return { label: 'פרנס היום', sublabel: 'Parnass HaYom' };
      case 'MONTHLY':
        return { label: 'פרנס החודש', sublabel: 'Parnass HaChodesh' };
      case 'YEARLY':
        return { label: 'פרנס השנה', sublabel: 'Parnass HaShana' };
      default:
        return { label: '', sublabel: '' };
    }
  };

  const renderSponsorCard = (sponsor: ParnassSponsor | undefined, type: 'DAILY' | 'MONTHLY' | 'YEARLY') => {
    const typeInfo = getSponsorTypeLabel(type);
    const icon = type === 'DAILY' ? <Calendar className="h-5 w-5" /> :
                 type === 'MONTHLY' ? <Star className="h-5 w-5" /> :
                 <Trophy className="h-5 w-5" />;
    
    const bgColor = type === 'DAILY' ? 'bg-blue-50' :
                   type === 'MONTHLY' ? 'bg-purple-50' :
                   'bg-yellow-50';
    
    const borderColor = type === 'DAILY' ? 'border-blue-200' :
                       type === 'MONTHLY' ? 'border-purple-200' :
                       'border-yellow-200';

    if (!sponsor) {
      return (
        <Card className={`${bgColor} ${borderColor} border-2 border-dashed`}>
          <CardContent className="p-6 text-center">
            <div className="mb-3 flex justify-center text-gray-400">
              {icon}
            </div>
            <p className="text-lg font-hebrew mb-1">{typeInfo.label}</p>
            <p className="text-sm text-gray-600 mb-4">{typeInfo.sublabel}</p>
            <p className="text-sm text-gray-500 mb-3">Disponible</p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowBookingDialog(true)}
            >
              Devenir sponsor
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`${sponsor.isHighlighted ? 'ring-2 ring-yellow-400' : ''} ${bgColor} border-${borderColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <div>
                <p className="font-hebrew text-lg">{typeInfo.label}</p>
                <p className="text-xs text-gray-600">{typeInfo.sublabel}</p>
              </div>
            </div>
            {sponsor.isHighlighted && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <Star className="h-3 w-3 mr-1" />
                En vedette
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-2">
            {sponsor.isAnonymous ? (
              <p className="text-lg font-medium text-gray-500">Donateur anonyme</p>
            ) : (
              <p className="text-xl font-semibold">{sponsor.sponsorName}</p>
            )}
          </div>

          {sponsor.dedicationType && sponsor.dedicationName && (
            <div className="p-3 bg-white rounded-lg">
              <Badge className={DEDICATION_TYPES[sponsor.dedicationType as keyof typeof DEDICATION_TYPES]?.color || ''}>
                {DEDICATION_TYPES[sponsor.dedicationType as keyof typeof DEDICATION_TYPES]?.label}
              </Badge>
              <p className="mt-2 font-medium">{sponsor.dedicationName}</p>
              {sponsor.dedicationNameHebrew && (
                <p className="text-sm text-gray-600 font-hebrew">{sponsor.dedicationNameHebrew}</p>
              )}
            </div>
          )}

          {sponsor.sponsorMessage && !sponsor.isAnonymous && (
            <div className="p-3 bg-white/70 rounded-lg">
              <p className="text-sm italic text-gray-700">"{sponsor.sponsorMessage}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Titre de la section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-500" />
          Sponsors Parnass
        </h2>
        <Button variant="outline" size="sm" onClick={() => setShowBookingDialog(true)}>
          <Heart className="h-4 w-4 mr-2" />
          Devenir sponsor
        </Button>
      </div>

      {/* Cartes des sponsors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderSponsorCard(currentSponsors.daily, 'DAILY')}
        {renderSponsorCard(currentSponsors.monthly, 'MONTHLY')}
        {renderSponsorCard(currentSponsors.yearly, 'YEARLY')}
      </div>

      {/* Dialog de réservation */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Devenir Sponsor Parnass</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center space-y-3">
              <p className="text-gray-600">
                Soutenez notre communauté en devenant Parnass et bénéficiez d'une dédicace spéciale.
              </p>
              
              <div className="space-y-2">
                <Button 
                  className="w-full justify-between" 
                  variant="outline"
                  onClick={() => window.location.href = `/donate?type=parnass&period=daily`}
                >
                  <span>Parnass du Jour</span>
                  <span className="font-semibold">100€</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button 
                  className="w-full justify-between" 
                  variant="outline"
                  onClick={() => window.location.href = `/donate?type=parnass&period=monthly`}
                >
                  <span>Parnass du Mois</span>
                  <span className="font-semibold">500€</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button 
                  className="w-full justify-between" 
                  variant="outline"
                  onClick={() => window.location.href = `/donate?type=parnass&period=yearly`}
                >
                  <span>Parnass de l'Année</span>
                  <span className="font-semibold">1800€</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                Votre nom sera affiché en tant que sponsor pour la période choisie.
                Possibilité de dédicace à la mémoire ou pour la guérison.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
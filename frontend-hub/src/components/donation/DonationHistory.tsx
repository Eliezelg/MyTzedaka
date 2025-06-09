'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Heart, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDonationHistory } from '@/hooks/useDonations';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DonationHistoryProps {
  className?: string;
}

export function DonationHistory({ className }: DonationHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useDonationHistory({
    page: currentPage,
    limit,
    enabled: true
  });

  // Formatage du montant
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount / 100); // Convertir depuis les centimes
  };

  // Formatage du statut
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Échoué</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Gestion de la pagination
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Historique des dons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Heart className="h-5 w-5" />
            Erreur
          </CardTitle>
          <CardDescription>
            Impossible de charger l'historique des donations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const donations = data?.donations || [];
  const pagination = data?.pagination;

  if (donations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Historique des dons
          </CardTitle>
          <CardDescription>
            Vous n'avez pas encore fait de don.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun don trouvé</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Historique des dons
        </CardTitle>
        <CardDescription>
          {pagination?.total || 0} don{(pagination?.total || 0) > 1 ? 's' : ''} au total
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {donations.map((donation) => (
          <div
            key={donation.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg">
                    {formatAmount(donation.amount, donation.currency)}
                  </span>
                  {getStatusBadge(donation.status)}
                </div>
                
                {donation.campaign && (
                  <div className="text-sm text-gray-600 mb-1">
                    Pour : <span className="font-medium">{donation.campaign.title}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {format(new Date(donation.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </span>
                  <span>
                    {formatDistanceToNow(new Date(donation.createdAt), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>
              </div>

              {donation.campaign && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-4"
                  onClick={() => {
                    // Navigation vers la campagne
                    window.open(`/campaigns/${donation.campaign?.slug}`, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>

            {donation.confirmedAt && (
              <div className="text-xs text-green-600 mt-2">
                Confirmé le {format(new Date(donation.confirmedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
              </div>
            )}
          </div>
        ))}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Page {pagination.page} sur {pagination.totalPages}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

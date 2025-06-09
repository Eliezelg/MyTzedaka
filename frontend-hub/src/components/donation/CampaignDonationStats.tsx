'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Heart, 
  Calendar,
  Euro,
  Target
} from 'lucide-react';
import { useCampaignDonationStats } from '@/hooks/useDonations';

interface CampaignDonationStatsProps {
  campaignId: string;
  targetAmount?: number;
  className?: string;
}

export function CampaignDonationStats({ 
  campaignId, 
  targetAmount,
  className 
}: CampaignDonationStatsProps) {
  const { data: stats, isLoading, error } = useCampaignDonationStats(campaignId);

  // Formatage du montant
  const formatAmount = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100); // Convertir depuis les centimes
  };

  // Calcul du pourcentage d'objectif atteint
  const progressPercentage = targetAmount 
    ? Math.min((stats?.totalAmount || 0) / (targetAmount * 100) * 100, 100)
    : 0;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistiques des dons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingUp className="h-5 w-5" />
            Erreur
          </CardTitle>
          <CardDescription>
            Impossible de charger les statistiques des donations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Statistiques des dons
        </CardTitle>
        <CardDescription>
          Performance actuelle de la campagne
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Montant total et objectif */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <h3 className="text-2xl font-bold text-green-600">
                {formatAmount(stats.totalAmount, stats.currency)}
              </h3>
              <p className="text-sm text-gray-600">Montant total collecté</p>
            </div>
            {targetAmount && (
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-700">
                  {formatAmount(targetAmount * 100, stats.currency)}
                </div>
                <p className="text-sm text-gray-600">Objectif</p>
              </div>
            )}
          </div>

          {/* Barre de progression vers l'objectif */}
          {targetAmount && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-xs text-gray-500">
                {progressPercentage >= 100 
                  ? '🎉 Objectif atteint !' 
                  : `Plus que ${formatAmount((targetAmount * 100) - stats.totalAmount, stats.currency)} pour atteindre l'objectif`
                }
              </p>
            </div>
          )}
        </div>

        {/* Grille des statistiques */}
        <div className="grid grid-cols-2 gap-4">
          {/* Nombre total de donations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total dons</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {stats.totalDonations}
            </div>
          </div>

          {/* Nombre de donateurs uniques */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Donateurs</span>
            </div>
            <div className="text-2xl font-bold text-purple-800">
              {stats.uniqueDonors}
            </div>
          </div>

          {/* Don moyen */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Euro className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Don moyen</span>
            </div>
            <div className="text-lg font-bold text-orange-800">
              {formatAmount(stats.averageDonation, stats.currency)}
            </div>
          </div>

          {/* Dons récents */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Récents (7j)</span>
            </div>
            <div className="text-2xl font-bold text-green-800">
              {stats.recentDonations}
            </div>
          </div>
        </div>

        {/* Badges d'encouragement */}
        <div className="flex flex-wrap gap-2">
          {stats.totalDonations >= 100 && (
            <Badge className="bg-yellow-100 text-yellow-800">
              🏆 100+ dons
            </Badge>
          )}
          {stats.uniqueDonors >= 50 && (
            <Badge className="bg-blue-100 text-blue-800">
              👥 50+ donateurs
            </Badge>
          )}
          {progressPercentage >= 100 && (
            <Badge className="bg-green-100 text-green-800">
              🎯 Objectif atteint
            </Badge>
          )}
          {stats.recentDonations >= 10 && (
            <Badge className="bg-purple-100 text-purple-800">
              🔥 Tendance active
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

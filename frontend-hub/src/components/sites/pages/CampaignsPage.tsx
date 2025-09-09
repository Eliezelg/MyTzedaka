'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Search, Filter, Calendar, Users, Target, TrendingUp } from 'lucide-react';
import { useTenant } from '@/providers/tenant-provider';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  donorsCount: number;
  endDate?: string;
  image?: string;
  category?: string;
  isUrgent?: boolean;
}

interface CampaignsPageProps {
  tenantId: string;
}

export function CampaignsPage({ tenantId }: CampaignsPageProps) {
  const { tenant } = useTenant();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchCampaigns();
  }, [tenantId]);

  useEffect(() => {
    filterAndSortCampaigns();
  }, [campaigns, searchTerm, selectedCategory, sortBy]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${tenantId}/campaigns`);
      const data = await response.json();
      setCampaigns(data);
      setFilteredCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCampaigns = () => {
    let filtered = [...campaigns];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(campaign => campaign.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'goal':
        filtered.sort((a, b) => b.goal - a.goal);
        break;
      case 'progress':
        filtered.sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
        break;
      case 'urgent':
        filtered.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
        break;
      case 'recent':
      default:
        // Assuming campaigns are already sorted by date from API
        break;
    }

    setFilteredCampaigns(filtered);
  };

  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des campagnes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nos Campagnes</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Soutenez les projets qui vous tiennent à cœur et suivez leur progression
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une campagne..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Toutes les catégories</option>
            <option value="education">Éducation</option>
            <option value="social">Social</option>
            <option value="religious">Religieux</option>
            <option value="emergency">Urgence</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="recent">Plus récentes</option>
            <option value="goal">Objectif le plus élevé</option>
            <option value="progress">Plus proche de l'objectif</option>
            <option value="urgent">Urgentes d'abord</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { 
            icon: TrendingUp, 
            value: filteredCampaigns.length, 
            label: 'Campagnes actives' 
          },
          { 
            icon: Target, 
            value: formatAmount(
              filteredCampaigns.reduce((sum, c) => sum + c.goal, 0)
            ), 
            label: 'Objectif total' 
          },
          { 
            icon: Users, 
            value: filteredCampaigns.reduce((sum, c) => sum + c.donorsCount, 0), 
            label: 'Donateurs' 
          },
          { 
            icon: Calendar, 
            value: filteredCampaigns.filter(c => c.isUrgent).length, 
            label: 'Campagnes urgentes' 
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
              <stat.icon className="h-8 w-8 text-primary/20" />
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucune campagne trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const progress = calculateProgress(campaign.raised, campaign.goal);
            const daysRemaining = getDaysRemaining(campaign.endDate);

            return (
              <div key={campaign.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                {/* Urgent Badge */}
                {campaign.isUrgent && (
                  <div className="bg-red-500 text-white text-center py-1 text-sm font-semibold">
                    URGENT
                  </div>
                )}

                {/* Image */}
                {campaign.image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={campaign.image} 
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {campaign.description}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-bold text-primary">
                        {formatAmount(campaign.raised)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 mb-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Objectif: {formatAmount(campaign.goal)}</span>
                      {daysRemaining !== null && (
                        <span>{daysRemaining} jours restants</span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{campaign.donorsCount} donateurs</span>
                    </div>
                    {campaign.category && (
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {campaign.category}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <Button asChild className="w-full">
                    <Link href={`/campaigns/${campaign.id}`}>
                      Soutenir cette campagne
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
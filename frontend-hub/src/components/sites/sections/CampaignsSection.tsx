import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Calendar, Target, Users } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  donorsCount: number;
  endDate?: string;
  image?: string;
}

interface CampaignsSectionProps {
  campaigns: Campaign[];
  title?: string;
  viewAllLink?: string;
}

export function CampaignsSection({ 
  campaigns, 
  title = 'Nos Campagnes',
  viewAllLink = '/campaigns'
}: CampaignsSectionProps) {
  if (!campaigns || campaigns.length === 0) return null;

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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
          <h2 className="text-3xl font-bold mb-4 sm:mb-0">{title}</h2>
          <Button asChild variant="outline">
            <Link href={viewAllLink}>
              Voir toutes les campagnes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.slice(0, 3).map((campaign) => {
            const progress = calculateProgress(campaign.raised, campaign.goal);
            const daysRemaining = getDaysRemaining(campaign.endDate);
            
            return (
              <div key={campaign.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Image */}
                {campaign.image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={campaign.image} 
                      alt={campaign.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
                        sur {formatAmount(campaign.goal)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 mb-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{Math.round(progress)}% atteint</span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{campaign.donorsCount} donateurs</span>
                    </div>
                    {daysRemaining !== null && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{daysRemaining} jours restants</span>
                      </div>
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
      </div>
    </section>
  );
}
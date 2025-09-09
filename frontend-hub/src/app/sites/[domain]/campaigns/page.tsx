import { Card } from '@/components/ui/card';

export default function CampaignsPage({ params }: { params: { domain: string } }) {
  // Données de démonstration
  const campaigns = [
    {
      id: 1,
      title: 'Rénovation de la synagogue',
      description: 'Aidez-nous à rénover notre lieu de prière',
      goal: 50000,
      raised: 32000,
      progress: 64,
      daysLeft: 15,
      image: '/api/placeholder/400/250'
    },
    {
      id: 2,
      title: 'Aide aux familles',
      description: 'Soutenons les familles dans le besoin',
      goal: 20000,
      raised: 12500,
      progress: 62.5,
      daysLeft: 30,
      image: '/api/placeholder/400/250'
    },
    {
      id: 3,
      title: 'Programme éducatif',
      description: 'Finançons l\'éducation de nos enfants',
      goal: 15000,
      raised: 8000,
      progress: 53,
      daysLeft: 45,
      image: '/api/placeholder/400/250'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Nos Campagnes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition">
            <div className="h-48 bg-gray-200 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm opacity-90">{campaign.daysLeft} jours restants</p>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
              <p className="text-gray-600 mb-4">{campaign.description}</p>
              
              {/* Barre de progression */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{campaign.raised.toLocaleString()}€ collectés</span>
                  <span>{campaign.goal.toLocaleString()}€</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {campaign.progress}% de l'objectif atteint
                </p>
              </div>
              
              <a
                href={`/sites/${params.domain}/donate?campaign=${campaign.id}`}
                className="block text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Contribuer
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
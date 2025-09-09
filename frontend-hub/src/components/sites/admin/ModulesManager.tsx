'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save,
  Heart,
  Calendar,
  Book,
  Users,
  Clock,
  DollarSign,
  Globe,
  Camera,
  MessageSquare,
  Shield,
  Star,
  Lock,
  Check,
  X
} from 'lucide-react';
import { useTenant } from '@/providers/tenant-provider';

const moduleDescriptions = {
  donations: {
    name: 'Système de dons',
    description: 'Collecte de dons en ligne avec Stripe',
    icon: Heart,
    category: 'basic',
    premium: false
  },
  campaigns: {
    name: 'Campagnes',
    description: 'Gestion des campagnes de financement',
    icon: DollarSign,
    category: 'basic',
    premium: false
  },
  events: {
    name: 'Événements',
    description: 'Gestion des événements',
    icon: Calendar,
    category: 'basic',
    premium: false
  },
  blog: {
    name: 'Blog',
    description: 'Blog et actualités',
    icon: MessageSquare,
    category: 'basic',
    premium: false
  },
  gallery: {
    name: 'Galerie',
    description: 'Galerie photos et vidéos',
    icon: Camera,
    category: 'basic',
    premium: false
  },
  zmanim: {
    name: 'Zmanim',
    description: 'Horaires halakhiques',
    icon: Clock,
    category: 'synagogue',
    premium: true
  },
  prayers: {
    name: 'Prières',
    description: 'Horaires de prières',
    icon: Users,
    category: 'synagogue',
    premium: true
  },
  courses: {
    name: 'Cours Torah',
    description: 'Cours de Torah',
    icon: Book,
    category: 'synagogue',
    premium: true
  },
  hebrewCalendar: {
    name: 'Calendrier hébraïque',
    description: 'Calendrier hébraïque',
    icon: Calendar,
    category: 'synagogue',
    premium: true
  },
  members: {
    name: 'Membres',
    description: 'Gestion des membres',
    icon: Users,
    category: 'synagogue',
    premium: true
  },
  library: {
    name: 'Bibliothèque',
    description: 'Bibliothèque Torah',
    icon: Book,
    category: 'advanced',
    premium: true
  },
  yahrzeits: {
    name: 'Yahrzeits',
    description: 'Gestion des Yahrzeits',
    icon: Star,
    category: 'advanced',
    premium: true
  },
  seatingChart: {
    name: 'Plan de synagogue',
    description: 'Plan de synagogue',
    icon: Users,
    category: 'advanced',
    premium: true
  },
  mikvah: {
    name: 'Mikvah',
    description: 'Réservation Mikvah',
    icon: Users,
    category: 'community',
    premium: true
  },
  kashrut: {
    name: 'Cacheroute',
    description: 'Informations cacheroute',
    icon: Shield,
    category: 'community',
    premium: true
  },
  eruv: {
    name: 'Erouv',
    description: 'Statut de l\'Erouv',
    icon: Globe,
    category: 'community',
    premium: true
  },
  marketplace: {
    name: 'Petites annonces',
    description: 'Petites annonces',
    icon: Globe,
    category: 'community',
    premium: true
  },
  directory: {
    name: 'Annuaire',
    description: 'Annuaire communautaire',
    icon: Users,
    category: 'community',
    premium: true
  },
  chesed: {
    name: 'Entraide',
    description: 'Entraide communautaire',
    icon: Heart,
    category: 'community',
    premium: true
  },
  newsletter: {
    name: 'Newsletter',
    description: 'Newsletter',
    icon: MessageSquare,
    category: 'community',
    premium: false
  }
};

const categoryLabels = {
  basic: 'Modules de base',
  synagogue: 'Modules synagogue',
  advanced: 'Modules avancés',
  community: 'Modules communautaires'
};

export function ModulesManager() {
  const { tenant, modules } = useTenant();
  const [moduleStates, setModuleStates] = useState(modules || {});
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleToggle = (moduleName: string) => {
    setModuleStates(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName as keyof typeof prev]
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/modules`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(moduleStates)
        }
      );

      if (response.ok) {
        setIsDirty(false);
        // TODO: Show success toast
        alert('Modules sauvegardés avec succès !');
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving modules:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Grouper les modules par catégorie
  const groupedModules = Object.entries(moduleDescriptions).reduce((acc, [key, module]) => {
    const category = module.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ id: key, ...module });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {/* Header avec bouton sauvegarder */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Modules</h2>
          <p className="text-gray-600">Activez ou désactivez les fonctionnalités de votre site</p>
        </div>
        
        {isDirty && (
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        )}
      </div>

      {/* Alerte modifications non sauvegardées */}
      {isDirty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Vous avez des modifications non enregistrées. N\'oubliez pas de sauvegarder !
          </p>
        </div>
      )}

      {/* Modules par catégorie */}
      {Object.entries(groupedModules).map(([category, categoryModules]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-4">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryModules.map(module => {
              const Icon = module.icon;
              const isEnabled = moduleStates[module.id as keyof typeof moduleStates] as boolean;
              const isPremium = module.premium;
              const isLocked = isPremium && tenant.settings?.plan !== 'PREMIUM';
              
              return (
                <Card 
                  key={module.id}
                  className={`p-6 ${isEnabled ? 'border-primary' : ''} ${isLocked ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        isEnabled ? 'bg-primary/10' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          isEnabled ? 'text-primary' : 'text-gray-500'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{module.name}</h4>
                          {isPremium && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          {module.description}
                        </p>

                        {isLocked && (
                          <div className="flex items-center gap-1 text-xs text-orange-600 mt-2">
                            <Lock className="h-3 w-3" />
                            <span>Passez au plan Premium pour activer</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => !isLocked && handleToggle(module.id)}
                        disabled={isLocked}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Info Premium */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Modules Premium</h4>
            <p className="text-sm text-blue-800">
              Les modules premium offrent des fonctionnalités avancées pour votre communauté.
              Votre plan actuel : <strong>{tenant.settings?.plan === 'PREMIUM' ? 'Premium' : 'Gratuit'}</strong>
            </p>
            {tenant.settings?.plan !== 'PREMIUM' && (
              <Button variant="link" className="p-0 h-auto mt-2 text-blue-900">
                Passer au plan Premium →
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
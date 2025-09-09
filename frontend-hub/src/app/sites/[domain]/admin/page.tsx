'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  FileText, 
  Palette, 
  Settings, 
  Users,
  Heart,
  Calendar,
  Star,
  TrendingUp,
  DollarSign,
  Wand2,
  Sun,
  Clock as ClockIcon
} from 'lucide-react';
import { useTenant } from '@/providers/tenant-provider';
import { useAuth, withAuth } from '@/providers/auth-provider';
import { ThemeCustomizer } from '@/components/sites/admin/ThemeCustomizer';
import { ModulesManager } from '@/components/sites/admin/ModulesManager';
import { ParnassManager } from '@/components/sites/admin/ParnassManager';
import { PageEditor } from '@/components/sites/admin/PageEditor';
import { TemplateManager } from '@/components/sites/admin/TemplateManager';
import { ZmanimManager } from '@/components/sites/admin/ZmanimManager';
import { PrayersManager } from '@/components/sites/admin/PrayersManager';

function AdminDashboard() {
  const { tenant } = useTenant();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = {
    totalDonations: 125000,
    donationsCount: 342,
    activeCampaigns: 3,
    totalMembers: 156,
    monthlyGrowth: 12.5,
    parnassSponsors: 24
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total des dons</p>
              <p className="text-2xl font-bold">{stats.totalDonations.toLocaleString()}€</p>
              <p className="text-xs text-green-600">+{stats.monthlyGrowth}% ce mois</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nombre de dons</p>
              <p className="text-2xl font-bold">{stats.donationsCount}</p>
            </div>
            <Heart className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Membres actifs</p>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sponsors Parnass</p>
              <p className="text-2xl font-bold">{stats.parnassSponsors}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Derniers dons</h3>
          <div className="space-y-3">
            {[
              { name: 'David Cohen', amount: 180, time: 'Il y a 2h' },
              { name: 'Sarah Levy', amount: 100, time: 'Il y a 5h' },
              { name: 'Anonyme', amount: 500, time: 'Il y a 1 jour' },
              { name: 'Michel Azoulay', amount: 36, time: 'Il y a 2 jours' },
            ].map((donation, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{donation.name}</p>
                  <p className="text-sm text-gray-600">{donation.time}</p>
                </div>
                <span className="font-semibold text-green-600">+{donation.amount}€</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Campagnes actives</h3>
          <div className="space-y-3">
            {[
              { name: 'Rénovation du Beth Hamidrash', progress: 75, raised: 15000, goal: 20000 },
              { name: 'Aide aux familles', progress: 45, raised: 4500, goal: 10000 },
              { name: 'Nouveau Sefer Torah', progress: 30, raised: 9000, goal: 30000 },
            ].map((campaign, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <p className="font-medium">{campaign.name}</p>
                  <span className="text-sm text-gray-600">{campaign.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {campaign.raised.toLocaleString()}€ sur {campaign.goal.toLocaleString()}€
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <FileText className="h-5 w-5" />
            <span className="text-xs">Nouvelle page</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Créer événement</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Heart className="h-5 w-5" />
            <span className="text-xs">Nouvelle campagne</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Users className="h-5 w-5" />
            <span className="text-xs">Inviter membre</span>
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Administration - {tenant.name}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Wand2 className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="pages">
              <FileText className="h-4 w-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="zmanim">
              <Sun className="h-4 w-4 mr-2" />
              Zmanim
            </TabsTrigger>
            <TabsTrigger value="prayers">
              <ClockIcon className="h-4 w-4 mr-2" />
              Prières
            </TabsTrigger>
            <TabsTrigger value="parnass">
              <Star className="h-4 w-4 mr-2" />
              Parnass
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Palette className="h-4 w-4 mr-2" />
              Thème
            </TabsTrigger>
            <TabsTrigger value="modules">
              <Settings className="h-4 w-4 mr-2" />
              Modules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManager tenant={tenant} />
          </TabsContent>

          <TabsContent value="pages">
            <PageEditor />
          </TabsContent>

          <TabsContent value="zmanim">
            <ZmanimManager />
          </TabsContent>

          <TabsContent value="prayers">
            <PrayersManager />
          </TabsContent>

          <TabsContent value="parnass">
            <ParnassManager />
          </TabsContent>

          <TabsContent value="theme">
            <ThemeCustomizer />
          </TabsContent>

          <TabsContent value="modules">
            <ModulesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Export with authentication HOC
export default withAuth(AdminDashboard, { requireAdmin: true });
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/hooks/useAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAssociationBySlug, useUpdateAssociation } from '@/lib/services/associations-service';
import { AssociationFromAPI } from '@/types/association-with-campaigns';
import AssociationSettings from '@/components/associations/AssociationSettings';
import StripeStatusCard from '@/components/associations/stripe-status-card';
import { TaxReceiptsList } from '@/components/tax-receipts/tax-receipts-list';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Mail, 
  UserPlus, 
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Save,
  X,
  Target,
  Star,
  Receipt
} from 'lucide-react';

export default function AssociationDashboard({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // États pour la gestion des données - TOUS LES HOOKS DOIVENT ÊTRE AU DÉBUT
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('admins');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    location: ''
  });

  // États pour les campagnes simulées
  const [campaigns] = useState([
    {
      id: '1',
      title: 'Campagne d\'urgence',
      description: 'Aide aux victimes des inondations',
      goal: 50000,
      raised: 32500,
      status: 'ACTIVE',
      endDate: '2025-12-31',
      donorsCount: 125
    },
    {
      id: '2',
      title: 'Éducation pour tous',
      description: 'Fournitures scolaires pour enfants défavorisés',
      goal: 25000,
      raised: 18750,
      status: 'ACTIVE',
      endDate: '2025-08-31',
      donorsCount: 87
    }
  ]);

  // États pour les membres simulés
  const [members] = useState([
    { id: '1', name: 'Jean Dupont', email: 'jean@email.com', role: 'MEMBER', joinedAt: '2025-01-15', donations: 5 },
    { id: '2', name: 'Marie Martin', email: 'marie@email.com', role: 'MEMBER', joinedAt: '2025-02-20', donations: 3 },
    { id: '3', name: 'Pierre Durand', email: 'pierre@email.com', role: 'MEMBER', joinedAt: '2025-03-10', donations: 8 }
  ]);

  // Liste des admins - à remplacer par un appel API
  const [admins, setAdmins] = useState([
    { id: '1', email: 'admin@association.com', firstName: 'Jean', lastName: 'Dupont', role: 'ADMIN', isCreator: true },
    { id: '2', email: 'manager@association.com', firstName: 'Marie', lastName: 'Martin', role: 'MANAGER', isCreator: false }
  ]);

  // Récupération des données de l'association
  const { data: association, isLoading, error } = useAssociationBySlug(slug as string);
  const updateAssociation = useUpdateAssociation();
  
  // Authentification et permissions
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuthContext();

  // Initialiser le formulaire d'édition avec les données de l'association
  useEffect(() => {
    if (association) {
      setEditForm({
        name: association.name || '',
        description: association.description || '',
        email: association.email || '',
        phone: association.phone || '',
        website: association.siteUrl || '',
        location: association.location || ''
      });
    }
  }, [association]);

  // Vérification de l'authentification
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  // Si pas connecté, rediriger vers la connexion
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900">Accès restreint</h1>
          <p className="text-gray-600">Vous devez être connecté en tant qu'administrateur de cette association</p>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button>Se connecter</Button>
            </Link>
            <Link href={`/associations/${slug}`}>
              <Button variant="outline">
                Voir la page publique
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !association) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Association non trouvée</h1>
          <p className="text-gray-600 mb-4">Impossible de charger les données de l'association.</p>
          <Link href="/dashboard">
            <Button>
              Retour au dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    setIsAddingAdmin(true);
    try {
      // TODO: Appel API pour ajouter un admin
      // await addAdminToAssociation(slug, newAdminEmail);
      
      // Simulation temporaire
      const newAdmin = {
        id: Date.now().toString(),
        email: newAdminEmail,
        firstName: 'Nouveau',
        lastName: 'Admin',
        role: 'MANAGER',
        isCreator: false
      };
      
      setAdmins([...admins, newAdmin]);
      setNewAdminEmail('');
      
      alert('Admin ajouté avec succès !');
    } catch (error) {
      alert('Erreur lors de l\'ajout de l\'admin');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (confirm('Êtes-vous sûr de vouloir retirer cet admin ?')) {
      setAdmins(admins.filter(admin => admin.id !== adminId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{association.name}</h1>
              <p className="text-gray-600 mt-2">Dashboard de gestion</p>
            </div>
            <div className="flex space-x-3">
              <Link href={`${process.env.NEXT_PUBLIC_SITES_URL || 'http://localhost:3000'}/sites/${slug}/admin`} target="_blank">
                <Button variant="default" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Personnaliser le site</span>
                </Button>
              </Link>
              <Link href={`/associations/${slug}`}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir la page publique
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membres</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total collecté</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{association.totalRaised?.toLocaleString('fr-FR') || '0'} €</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campagnes actives</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.length}</div>
            </CardContent>
          </Card>

          {/* Statut Stripe */}
          <StripeStatusCard />
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="settings">Configuration</TabsTrigger>
            <TabsTrigger value="admins">Gestion des admins</TabsTrigger>
            <TabsTrigger value="members">Membres</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="receipts" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Reçus fiscaux
            </TabsTrigger>
            <TabsTrigger value="advanced">Paramètres avancés</TabsTrigger>
          </TabsList>

          {/* Configuration complète avec composants réutilisables */}
          <TabsContent value="settings" className="space-y-6">
            <AssociationSettings 
              association={association}
              onUpdate={(data) => {
                updateAssociation.mutate({ 
                  id: association.id, 
                  data 
                })
              }}
            />
          </TabsContent>

          {/* Gestion des admins */}
          <TabsContent value="admins" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Ajouter un administrateur
                </CardTitle>
                <CardDescription>
                  Invitez un nouvel administrateur pour votre association
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="admin-email">Email de l'administrateur</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@exemple.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleAddAdmin}
                      disabled={isAddingAdmin || !newAdminEmail.trim()}
                    >
                      {isAddingAdmin ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Administrateurs actuels</CardTitle>
                <CardDescription>
                  Liste des administrateurs de votre association
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800">
                            {admin.firstName[0]}{admin.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{admin.firstName} {admin.lastName}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={admin.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {admin.role}
                        </Badge>
                        {admin.isCreator && (
                          <Badge variant="outline">Créateur</Badge>
                        )}
                        {!admin.isCreator && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveAdmin(admin.id)}
                          >
                            Retirer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Autres onglets */}
          <TabsContent value="members">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestion des membres
                  </CardTitle>
                  <CardDescription>
                    Liste et gestion des membres de votre association
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-800">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                            <div className="text-xs text-gray-400">
                              Membre depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR')} • {member.donations} dons
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{member.role}</Badge>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Gestion des campagnes
                      </CardTitle>
                      <CardDescription>
                        Créez et gérez vos campagnes de collecte de fonds
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle campagne
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{campaign.title}</h3>
                            <p className="text-sm text-gray-600">{campaign.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {campaign.raised.toLocaleString('fr-FR')} €
                            </div>
                            <div className="text-xs text-gray-600">Collecté</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {campaign.goal.toLocaleString('fr-FR')} €
                            </div>
                            <div className="text-xs text-gray-600">Objectif</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {Math.round((campaign.raised / campaign.goal) * 100)}%
                            </div>
                            <div className="text-xs text-gray-600">Progression</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">
                              {campaign.donorsCount}
                            </div>
                            <div className="text-xs text-gray-600">Donateurs</div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <span>
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Fin le {new Date(campaign.endDate).toLocaleDateString('fr-FR')}
                          </span>
                          <span>{Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} jours restants</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="space-y-6">
              {/* Statistiques détaillées */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Statistiques détaillées
                  </CardTitle>
                  <CardDescription>
                    Vue d'ensemble des performances de votre association
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">Dons ce mois</span>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-900">2,450€</div>
                      <div className="text-xs text-blue-600">+12% vs mois dernier</div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-800">Nouveaux membres</span>
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-900">8</div>
                      <div className="text-xs text-green-600">Ce mois-ci</div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-800">Taux de rétention</span>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-900">78%</div>
                      <div className="text-xs text-purple-600">Donateurs récurrents</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                  <CardDescription>
                    Raccourcis vers les actions fréquentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                      <Download className="h-6 w-6" />
                      <span className="text-sm">Exporter données</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Importer membres</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                      <Mail className="h-6 w-6" />
                      <span className="text-sm">Newsletter</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                      <BarChart3 className="h-6 w-6" />
                      <span className="text-sm">Rapport complet</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Reçus fiscaux */}
          <TabsContent value="receipts" className="space-y-6">
            <TaxReceiptsList mode="tenant" tenantId={association.tenantId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

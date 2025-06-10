'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, BarChart3, Mail, UserPlus, Shield } from 'lucide-react';

export default function AssociationDashboard() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Données simulées pour l'association - à remplacer par un appel API
  const associationData = {
    name: "Association Test",
    slug: slug as string,
    description: "Description de l'association de test",
    memberCount: 12,
    adminCount: 2,
    totalDonations: 15420.50,
    activeCampaigns: 3
  };

  // Liste des admins - à remplacer par un appel API
  const [admins, setAdmins] = useState([
    { id: '1', email: 'admin@association.com', firstName: 'Jean', lastName: 'Dupont', role: 'ADMIN', isCreator: true },
    { id: '2', email: 'manager@association.com', firstName: 'Marie', lastName: 'Martin', role: 'MANAGER', isCreator: false }
  ]);

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
              <h1 className="text-3xl font-bold text-gray-900">{associationData.name}</h1>
              <p className="text-gray-600 mt-2">Dashboard de gestion</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/associations/${slug}`)}
            >
              Voir la page publique
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membres</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{associationData.memberCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{associationData.adminCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total collecté</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{associationData.totalDonations.toLocaleString('fr-FR')} €</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campagnes actives</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{associationData.activeCampaigns}</div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="admins" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="admins">Gestion des admins</TabsTrigger>
            <TabsTrigger value="members">Membres</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

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

          {/* Autres onglets (à développer) */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des membres</CardTitle>
                <CardDescription>À développer</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des campagnes</CardTitle>
                <CardDescription>À développer</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de l'association</CardTitle>
                <CardDescription>À développer</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

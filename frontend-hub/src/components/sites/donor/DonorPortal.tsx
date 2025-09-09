'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Receipt, 
  Heart, 
  Download, 
  Calendar,
  TrendingUp,
  Award,
  FileText,
  Mail,
  Phone,
  MapPin,
  Settings,
  LogOut,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/providers/auth-provider';
import { useTenant } from '@/providers/tenant-provider';

interface Donation {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  campaign?: {
    id: string;
    title: string;
  };
  isRecurring: boolean;
  frequency?: string;
  taxReceiptNumber?: string;
  taxReceiptUrl?: string;
}

interface DonorStats {
  totalDonated: number;
  donationsCount: number;
  firstDonationDate: string;
  lastDonationDate: string;
  averageDonation: number;
  taxReceiptsCount: number;
  sponsorships: {
    daily: number;
    monthly: number;
    yearly: number;
  };
}

interface TaxReceipt {
  id: string;
  receiptNumber: string;
  issueDate: string;
  donationAmount: number;
  donationDate: string;
  pdfUrl?: string;
  status: 'GENERATED' | 'SENT' | 'DRAFT';
}

export function DonorPortal() {
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState('overview');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [taxReceipts, setTaxReceipts] = useState<TaxReceipt[]>([]);
  const [stats, setStats] = useState<DonorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      fetchDonorData();
    }
  }, [user, selectedYear]);

  const fetchDonorData = async () => {
    setLoading(true);
    try {
      // Fetch donations
      const donationsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/donor/donations?year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json();
        setDonations(donationsData);
      }

      // Fetch tax receipts
      const receiptsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/donor/tax-receipts?year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (receiptsResponse.ok) {
        const receiptsData = await receiptsResponse.json();
        setTaxReceipts(receiptsData);
      }

      // Fetch stats
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/donor/stats`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching donor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (receiptId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/donor/tax-receipts/${receiptId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-fiscal-${receiptId}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Complété</Badge>;
      case 'PENDING':
        return <Badge variant="warning">En attente</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connexion requise</h3>
        <p className="text-gray-600 mb-4">
          Connectez-vous pour accéder à votre espace donateur
        </p>
        <Button onClick={() => window.location.href = '/auth/login'}>
          Se connecter
        </Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Espace Donateur</h1>
            <p className="text-gray-600">
              Bienvenue, {user.firstName} {user.lastName}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total des dons</p>
                <p className="text-2xl font-bold">{stats.totalDonated}€</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nombre de dons</p>
                <p className="text-2xl font-bold">{stats.donationsCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Don moyen</p>
                <p className="text-2xl font-bold">{Math.round(stats.averageDonation)}€</p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reçus fiscaux</p>
                <p className="text-2xl font-bold">{stats.taxReceiptsCount}</p>
              </div>
              <Receipt className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="donations">Mes dons</TabsTrigger>
          <TabsTrigger value="receipts">Reçus fiscaux</TabsTrigger>
          <TabsTrigger value="profile">Mon profil</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Donations */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Derniers dons</h3>
            <div className="space-y-3">
              {donations.slice(0, 5).map(donation => (
                <div key={donation.id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">
                      {donation.amount} {donation.currency}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(donation.date), 'd MMMM yyyy', { locale: fr })}
                      {donation.campaign && ` - ${donation.campaign.title}`}
                    </p>
                  </div>
                  {getStatusBadge(donation.status)}
                </div>
              ))}
            </div>
            
            {donations.length > 5 && (
              <Button 
                variant="link" 
                className="mt-3"
                onClick={() => setActiveTab('donations')}
              >
                Voir tous les dons →
              </Button>
            )}
          </Card>

          {/* Sponsorships */}
          {stats && (stats.sponsorships.daily > 0 || stats.sponsorships.monthly > 0 || stats.sponsorships.yearly > 0) && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Mes parrainages Parnass</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.sponsorships.daily}</p>
                  <p className="text-sm text-gray-600">Jours sponsorisés</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{stats.sponsorships.monthly}</p>
                  <p className="text-sm text-gray-600">Mois sponsorisés</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">{stats.sponsorships.yearly}</p>
                  <p className="text-sm text-gray-600">Années sponsorisées</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Donations Tab */}
        <TabsContent value="donations">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Historique des dons</h3>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1 border rounded-md"
              >
                {[2024, 2023, 2022].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Montant</th>
                    <th className="text-left py-2">Campagne</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Statut</th>
                    <th className="text-left py-2">Reçu</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(donation => (
                    <tr key={donation.id} className="border-b">
                      <td className="py-3">
                        {format(new Date(donation.date), 'd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="py-3 font-semibold">
                        {donation.amount} {donation.currency}
                      </td>
                      <td className="py-3">
                        {donation.campaign?.title || '-'}
                      </td>
                      <td className="py-3">
                        {donation.isRecurring ? (
                          <Badge variant="secondary">
                            Récurrent {donation.frequency}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Ponctuel</Badge>
                        )}
                      </td>
                      <td className="py-3">
                        {getStatusBadge(donation.status)}
                      </td>
                      <td className="py-3">
                        {donation.taxReceiptNumber ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => donation.taxReceiptUrl && window.open(donation.taxReceiptUrl)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total for year */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total {selectedYear}:</span>
                <span className="text-xl font-bold">
                  {donations.reduce((sum, d) => sum + d.amount, 0)}€
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tax Receipts Tab */}
        <TabsContent value="receipts">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Reçus fiscaux (CERFA)</h3>
              <p className="text-sm text-gray-600">
                Téléchargez vos reçus fiscaux pour vos déclarations d'impôts
              </p>
            </div>

            <div className="space-y-3">
              {taxReceipts.map(receipt => (
                <Card key={receipt.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-semibold">
                          Reçu N° {receipt.receiptNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          Don du {format(new Date(receipt.donationDate), 'd MMMM yyyy', { locale: fr })}
                          {' - '}
                          Montant: {receipt.donationAmount}€
                        </p>
                        <p className="text-xs text-gray-500">
                          Émis le {format(new Date(receipt.issueDate), 'd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {receipt.status === 'GENERATED' ? (
                        <Badge variant="success">Disponible</Badge>
                      ) : receipt.status === 'SENT' ? (
                        <Badge variant="secondary">Envoyé</Badge>
                      ) : (
                        <Badge variant="outline">Brouillon</Badge>
                      )}
                      
                      {receipt.pdfUrl && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(receipt.pdfUrl)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => downloadReceipt(receipt.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {taxReceipts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun reçu fiscal disponible pour {selectedYear}</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Information fiscale:</strong> Les dons à {tenant.name} sont déductibles 
                des impôts à hauteur de 66% dans la limite de 20% du revenu imposable.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Mes informations</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Prénom</Label>
                  <p className="font-medium">{user.firstName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Nom</Label>
                  <p className="font-medium">{user.lastName}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </Label>
                <p className="font-medium">{user.email}</p>
              </div>

              {user.phone && (
                <div>
                  <Label className="text-sm text-gray-600">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Téléphone
                  </Label>
                  <p className="font-medium">{user.phone}</p>
                </div>
              )}

              {(user.addressLine1 || user.city) && (
                <div>
                  <Label className="text-sm text-gray-600">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Adresse
                  </Label>
                  <p className="font-medium">
                    {user.addressLine1}
                    {user.addressLine2 && <><br />{user.addressLine2}</>}
                    {user.city && <><br />{user.postalCode} {user.city}</>}
                    {user.country && <><br />{user.country}</>}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Label className="text-sm text-gray-600">Membre depuis</Label>
                <p className="font-medium">
                  {format(new Date(user.createdAt), 'd MMMM yyyy', { locale: fr })}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Modifier mes informations
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Préférences emails
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add missing Label component import
import { Label } from '@/components/ui/label';
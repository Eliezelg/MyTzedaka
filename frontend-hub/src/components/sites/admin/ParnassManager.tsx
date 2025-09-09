'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarDays, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  DollarSign,
  Settings,
  User,
  Clock,
  Star
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTenant } from '@/providers/tenant-provider';
import { HDate } from '@hebcal/core';

interface ParnassSponsor {
  id: string;
  type: 'DAILY' | 'MONTHLY' | 'YEARLY';
  sponsorDate: string;
  sponsorName: string;
  sponsorMessage?: string;
  isAnonymous: boolean;
  dedicationType?: string;
  dedicationName?: string;
  dedicationNameHebrew?: string;
  amount: number;
  isPaid: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
}

interface ParnassSettings {
  dailyEnabled: boolean;
  monthlyEnabled: boolean;
  yearlyEnabled: boolean;
  dailyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  displayLocation: string[];
  requireApproval: boolean;
  allowMultipleSponsors: boolean;
  showInDonationPage: boolean;
}

export function ParnassManager() {
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState('calendar');
  const [sponsors, setSponsors] = useState<ParnassSponsor[]>([]);
  const [settings, setSettings] = useState<ParnassSettings>({
    dailyEnabled: true,
    monthlyEnabled: true,
    yearlyEnabled: true,
    dailyPrice: 100,
    monthlyPrice: 500,
    yearlyPrice: 1800,
    currency: 'EUR',
    displayLocation: ['homepage', 'sidebar'],
    requireApproval: true,
    allowMultipleSponsors: false,
    showInDonationPage: true
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<ParnassSponsor | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    type: 'DAILY' as 'DAILY' | 'MONTHLY' | 'YEARLY',
    sponsorDate: new Date(),
    sponsorName: '',
    isAnonymous: false,
    dedicationType: 'NONE',
    dedicationName: '',
    dedicationNameHebrew: '',
    sponsorMessage: '',
    amount: 100,
    isPaid: true,
    status: 'APPROVED' as const
  });

  useEffect(() => {
    fetchSponsors();
    fetchSettings();
  }, [selectedMonth]);

  const fetchSponsors = async () => {
    try {
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tenants/${tenant.id}/parnass?` +
        `startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSponsors(data);
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tenants/${tenant.id}/parnass/settings`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleAddSponsor = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tenants/${tenant.id}/parnass`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            sponsorDate: formData.sponsorDate.toISOString()
          })
        }
      );

      if (response.ok) {
        await fetchSponsors();
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding sponsor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSponsor = async (sponsorId: string, updates: Partial<ParnassSponsor>) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tenants/${tenant.id}/parnass/${sponsorId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }
      );

      if (response.ok) {
        await fetchSponsors();
      }
    } catch (error) {
      console.error('Error updating sponsor:', error);
    }
  };

  const handleDeleteSponsor = async (sponsorId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sponsor?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tenants/${tenant.id}/parnass/${sponsorId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchSponsors();
      }
    } catch (error) {
      console.error('Error deleting sponsor:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tenants/${tenant.id}/parnass/settings`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        }
      );

      if (response.ok) {
        // Show success toast
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'DAILY',
      sponsorDate: new Date(),
      sponsorName: '',
      isAnonymous: false,
      dedicationType: 'NONE',
      dedicationName: '',
      dedicationNameHebrew: '',
      sponsorMessage: '',
      amount: settings.dailyPrice,
      isPaid: true,
      status: 'APPROVED'
    });
  };

  const getHebrewDate = (date: Date) => {
    const hDate = new HDate(date);
    return hDate.renderGematriya();
  };

  const getSponsorForDate = (date: Date, type: string) => {
    return sponsors.find(s => 
      s.type === type && 
      new Date(s.sponsorDate).toDateString() === date.toDateString()
    );
  };

  const renderCalendarView = () => {
    const days = eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth)
    });

    return (
      <div className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            >
              ← Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(new Date())}
            >
              Aujourd'hui
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
            >
              Suivant →
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="text-center text-sm font-semibold p-2">
              {day}
            </div>
          ))}
          
          {days.map(day => {
            const dailySponsor = getSponsorForDate(day, 'DAILY');
            const monthlySponsor = getSponsorForDate(day, 'MONTHLY');
            const yearlySponsor = getSponsorForDate(day, 'YEARLY');
            
            return (
              <Card
                key={day.toISOString()}
                className="p-2 min-h-[100px] hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setFormData(prev => ({ ...prev, sponsorDate: day }));
                  setShowAddModal(true);
                }}
              >
                <div className="text-xs text-gray-600 mb-1">
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dailySponsor && (
                    <div className="text-xs p-1 bg-blue-100 rounded">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {dailySponsor.isAnonymous ? 'Anonyme' : dailySponsor.sponsorName.split(' ')[0]}
                    </div>
                  )}
                  {monthlySponsor && (
                    <div className="text-xs p-1 bg-purple-100 rounded">
                      <CalendarDays className="h-3 w-3 inline mr-1" />
                      {monthlySponsor.isAnonymous ? 'Anonyme' : monthlySponsor.sponsorName.split(' ')[0]}
                    </div>
                  )}
                  {yearlySponsor && (
                    <div className="text-xs p-1 bg-yellow-100 rounded">
                      <Star className="h-3 w-3 inline mr-1" />
                      {yearlySponsor.isAnonymous ? 'Anonyme' : yearlySponsor.sponsorName.split(' ')[0]}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Liste des Sponsors</h3>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Sponsor
        </Button>
      </div>

      <div className="space-y-2">
        {sponsors.map(sponsor => (
          <Card key={sponsor.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  {sponsor.type === 'DAILY' && <Clock className="h-5 w-5 text-blue-500" />}
                  {sponsor.type === 'MONTHLY' && <CalendarDays className="h-5 w-5 text-purple-500" />}
                  {sponsor.type === 'YEARLY' && <Star className="h-5 w-5 text-yellow-500" />}
                </div>
                
                <div>
                  <p className="font-semibold">
                    {sponsor.isAnonymous ? 'Donateur Anonyme' : sponsor.sponsorName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(sponsor.sponsorDate), 'd MMMM yyyy', { locale: fr })} - 
                    {sponsor.type === 'DAILY' ? ' Jour' : sponsor.type === 'MONTHLY' ? ' Mois' : ' Année'}
                  </p>
                  {sponsor.dedicationName && (
                    <p className="text-sm text-gray-500">
                      Dédicace: {sponsor.dedicationName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={sponsor.isPaid ? 'success' : 'destructive'}>
                  {sponsor.isPaid ? 'Payé' : 'Non payé'}
                </Badge>
                
                <Badge variant={
                  sponsor.status === 'APPROVED' ? 'success' :
                  sponsor.status === 'PENDING' ? 'warning' :
                  'secondary'
                }>
                  {sponsor.status}
                </Badge>

                <div className="flex gap-1">
                  {sponsor.status === 'PENDING' && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleUpdateSponsor(sponsor.id, { status: 'APPROVED' })}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleUpdateSponsor(sponsor.id, { status: 'REJECTED' })}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingSponsor(sponsor);
                      setFormData({
                        type: sponsor.type,
                        sponsorDate: new Date(sponsor.sponsorDate),
                        sponsorName: sponsor.sponsorName,
                        isAnonymous: sponsor.isAnonymous,
                        dedicationType: sponsor.dedicationType || 'NONE',
                        dedicationName: sponsor.dedicationName || '',
                        dedicationNameHebrew: sponsor.dedicationNameHebrew || '',
                        sponsorMessage: sponsor.sponsorMessage || '',
                        amount: sponsor.amount,
                        isPaid: sponsor.isPaid,
                        status: sponsor.status
                      });
                      setShowAddModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteSponsor(sponsor.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Paramètres du Module Parnass</h3>

      {/* Activation */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Types de Parrainage Activés</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-enabled">Parnass HaYom (Journalier)</Label>
            <Switch
              id="daily-enabled"
              checked={settings.dailyEnabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, dailyEnabled: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="monthly-enabled">Parnass HaChodesh (Mensuel)</Label>
            <Switch
              id="monthly-enabled"
              checked={settings.monthlyEnabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, monthlyEnabled: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="yearly-enabled">Parnass HaShana (Annuel)</Label>
            <Switch
              id="yearly-enabled"
              checked={settings.yearlyEnabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, yearlyEnabled: checked }))}
            />
          </div>
        </div>
      </Card>

      {/* Tarifs */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Tarifs</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="daily-price">Prix Journalier</Label>
            <div className="flex gap-2">
              <Input
                id="daily-price"
                type="number"
                value={settings.dailyPrice}
                onChange={(e) => setSettings(prev => ({ ...prev, dailyPrice: Number(e.target.value) }))}
              />
              <span className="flex items-center px-3 bg-gray-100 rounded-md">
                {settings.currency}
              </span>
            </div>
          </div>
          <div>
            <Label htmlFor="monthly-price">Prix Mensuel</Label>
            <div className="flex gap-2">
              <Input
                id="monthly-price"
                type="number"
                value={settings.monthlyPrice}
                onChange={(e) => setSettings(prev => ({ ...prev, monthlyPrice: Number(e.target.value) }))}
              />
              <span className="flex items-center px-3 bg-gray-100 rounded-md">
                {settings.currency}
              </span>
            </div>
          </div>
          <div>
            <Label htmlFor="yearly-price">Prix Annuel</Label>
            <div className="flex gap-2">
              <Input
                id="yearly-price"
                type="number"
                value={settings.yearlyPrice}
                onChange={(e) => setSettings(prev => ({ ...prev, yearlyPrice: Number(e.target.value) }))}
              />
              <span className="flex items-center px-3 bg-gray-100 rounded-md">
                {settings.currency}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Options */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Options d'Affichage</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require-approval">Nécessite l'approbation</Label>
              <p className="text-sm text-gray-600">Les sponsors doivent être approuvés avant d'être affichés</p>
            </div>
            <Switch
              id="require-approval"
              checked={settings.requireApproval}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireApproval: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="multiple-sponsors">Sponsors multiples</Label>
              <p className="text-sm text-gray-600">Permettre plusieurs sponsors pour une même date</p>
            </div>
            <Switch
              id="multiple-sponsors"
              checked={settings.allowMultipleSponsors}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowMultipleSponsors: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-donation">Afficher dans la page de dons</Label>
              <p className="text-sm text-gray-600">Proposer l'option Parnass lors d'un don</p>
            </div>
            <Switch
              id="show-donation"
              checked={settings.showInDonationPage}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showInDonationPage: checked }))}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          <Settings className="h-4 w-4 mr-2" />
          {loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gestion Parnass</h2>
          <p className="text-gray-600">Gérez les parrainages quotidiens, mensuels et annuels</p>
        </div>
        
        <div className="flex gap-2">
          <Card className="px-4 py-2">
            <p className="text-sm text-gray-600">Total ce mois</p>
            <p className="text-2xl font-bold">
              {sponsors.reduce((sum, s) => sum + (s.isPaid ? s.amount : 0), 0)} {settings.currency}
            </p>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          {renderCalendarView()}
        </TabsContent>

        <TabsContent value="list">
          {renderListView()}
        </TabsContent>

        <TabsContent value="settings">
          {renderSettings()}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingSponsor ? 'Modifier le Sponsor' : 'Ajouter un Sponsor'}
            </h3>

            <div className="space-y-4">
              <div>
                <Label>Type de parrainage</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Parnass HaYom (Jour)</SelectItem>
                    <SelectItem value="MONTHLY">Parnass HaChodesh (Mois)</SelectItem>
                    <SelectItem value="YEARLY">Parnass HaShana (Année)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={format(formData.sponsorDate, 'yyyy-MM-dd')}
                  onChange={(e) => setFormData(prev => ({ ...prev, sponsorDate: new Date(e.target.value) }))}
                />
              </div>

              <div>
                <Label>Nom du sponsor</Label>
                <Input
                  value={formData.sponsorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, sponsorName: e.target.value }))}
                  placeholder="Nom complet"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAnonymous: checked }))}
                />
                <Label>Sponsor anonyme</Label>
              </div>

              <div>
                <Label>Montant</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  />
                  <span className="flex items-center px-3 bg-gray-100 rounded-md">
                    {settings.currency}
                  </span>
                </div>
              </div>

              <div>
                <Label>Message (optionnel)</Label>
                <Textarea
                  value={formData.sponsorMessage}
                  onChange={(e) => setFormData(prev => ({ ...prev, sponsorMessage: e.target.value }))}
                  placeholder="Message du sponsor..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isPaid}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPaid: checked }))}
                  />
                  <Label>Payé</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Statut:</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="APPROVED">Approuvé</SelectItem>
                      <SelectItem value="REJECTED">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingSponsor(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleAddSponsor} disabled={loading}>
                {loading ? 'Enregistrement...' : editingSponsor ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
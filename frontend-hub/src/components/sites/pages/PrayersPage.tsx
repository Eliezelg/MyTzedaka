'use client';

import { PrayerSchedule } from '@/components/sites/jewish/PrayerSchedule';
import { useTenant } from '@/providers/tenant-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Bell, Users, Download, Plus } from 'lucide-react';
import { useState } from 'react';

interface PrayersPageProps {
  tenantId: string;
}

export function PrayersPage({ tenantId }: PrayersPageProps) {
  const { tenant } = useTenant();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [showMinyanAlert, setShowMinyanAlert] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Horaires de Prières</h1>
          <p className="text-lg text-gray-600">
            Offices et minyans à {tenant.name}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">Offices aujourd'hui</p>
              </div>
              <Calendar className="h-8 w-8 text-primary/20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">8/10</p>
                <p className="text-sm text-gray-600">Minyan Shaharit</p>
              </div>
              <Users className="h-8 w-8 text-orange-500/20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">19:30</p>
                <p className="text-sm text-gray-600">Prochain office</p>
              </div>
              <Bell className="h-8 w-8 text-green-500/20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">21</p>
                <p className="text-sm text-gray-600">Offices/semaine</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500/20" />
            </div>
          </Card>
        </div>

        {/* View Mode Selector */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              onClick={() => setViewMode('day')}
            >
              Jour
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              onClick={() => setViewMode('week')}
            >
              Semaine
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              onClick={() => setViewMode('month')}
            >
              Mois
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
          </div>
        </div>

        {/* Main Prayer Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PrayerSchedule 
              tenantId={tenantId}
              date={new Date()}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Minyan Alert */}
            {showMinyanAlert && (
              <Card className="p-6 border-orange-200 bg-orange-50">
                <h3 className="font-semibold mb-3 text-orange-800">
                  ⚠️ Minyan Alert
                </h3>
                <p className="text-sm text-orange-700 mb-3">
                  Nous avons besoin de 2 personnes supplémentaires pour le minyan de Shaharit demain à 7h00.
                </p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Je serai présent
                </Button>
              </Card>
            )}
            
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Rejoindre le minyan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Rappels personnalisés
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Sync avec calendrier
                </Button>
              </div>
            </Card>
            
            {/* Special Times */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Horaires Spéciaux</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Selichot</span>
                  <span className="font-medium">05:30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tehilim</span>
                  <span className="font-medium">20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cours du soir</span>
                  <span className="font-medium">20:30</span>
                </div>
              </div>
            </Card>
            
            {/* Room Availability */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Salles Disponibles</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span>Salle principale</span>
                  <span className="text-green-600">Libre</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span>Beit Midrash</span>
                  <span className="text-red-600">Occupée</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span>Salle 2</span>
                  <span className="text-green-600">Libre</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Weekly Overview */}
        {viewMode === 'week' && (
          <Card className="p-6 mt-6">
            <h3 className="font-semibold mb-4">Vue Hebdomadaire</h3>
            {/* TODO: Add weekly calendar view */}
            <div className="text-center py-8 text-gray-500">
              Vue hebdomadaire à implémenter
            </div>
          </Card>
        )}

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Règles du Minyan</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Minimum 10 hommes adultes (Bar Mitzvah)</li>
              <li>• Inscription recommandée pour garantir le minyan</li>
              <li>• Arrivée 5 minutes avant l'horaire</li>
              <li>• Téléphones en mode silencieux</li>
            </ul>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Contact</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Gabbaï:</strong> M. Cohen David<br />
                <span className="text-gray-600">📞 06 12 34 56 78</span>
              </p>
              <p>
                <strong>Questions halakhiques:</strong><br />
                <span className="text-gray-600">rav@{tenant.slug}.fr</span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
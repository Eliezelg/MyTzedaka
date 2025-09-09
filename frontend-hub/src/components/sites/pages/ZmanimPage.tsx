'use client';

import { ZmanimWidget } from '@/components/sites/jewish/ZmanimWidget';
import { useTenant } from '@/providers/tenant-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Printer, Settings } from 'lucide-react';
import { useState } from 'react';

interface ZmanimPageProps {
  tenantId: string;
}

export function ZmanimPage({ tenantId }: ZmanimPageProps) {
  const { tenant } = useTenant();
  const [showSettings, setShowSettings] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log('Download PDF');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Zmanim - Horaires Halakhiques</h1>
          <p className="text-lg text-gray-600">
            Horaires de prières et temps halakhiques pour {tenant.name}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Paramètres d'affichage</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Afficher tous les zmanim</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Afficher la date hébraïque</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>Format 24 heures</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>Afficher les secondes</span>
              </label>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Méthode de calcul
              </label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option>Magen Avraham (MGA)</option>
                <option>Vilna Gaon (GRA)</option>
                <option>Personnalisé</option>
              </select>
            </div>
          </Card>
        )}

        {/* Main Zmanim Widget */}
        <ZmanimWidget 
          tenantId={tenantId} 
          showAllTimes={true}
        />

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendrier Mensuel
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Consultez les horaires pour tout le mois
            </p>
            <Button variant="outline" className="w-full">
              Voir le calendrier
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Notifications</h3>
            <p className="text-sm text-gray-600 mb-4">
              Recevez des rappels pour les horaires importants
            </p>
            <Button variant="outline" className="w-full">
              Configurer les alertes
            </Button>
          </Card>
        </div>

        {/* Explanations */}
        <Card className="p-6 mt-6">
          <h3 className="font-semibold mb-4">Explications des Zmanim</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Alot HaShachar:</strong> L'aube, début du jour halakhique
            </div>
            <div>
              <strong>Misheyakir:</strong> Moment où l'on peut distinguer entre le bleu et le blanc
            </div>
            <div>
              <strong>Hanetz HaChama:</strong> Lever du soleil visible
            </div>
            <div>
              <strong>Sof Zman Shema:</strong> Fin du temps pour réciter le Shema
            </div>
            <div>
              <strong>Sof Zman Tefila:</strong> Fin du temps pour la prière du matin
            </div>
            <div>
              <strong>Chatzot:</strong> Midi halakhique
            </div>
            <div>
              <strong>Minha Guedola:</strong> Début du temps de l'après-midi pour Minha
            </div>
            <div>
              <strong>Minha Ketana:</strong> Temps préférable pour Minha
            </div>
            <div>
              <strong>Shkiat HaChama:</strong> Coucher du soleil
            </div>
            <div>
              <strong>Tzet HaKochavim:</strong> Sortie des étoiles, fin du jour
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
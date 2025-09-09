'use client';

import { SynagogueDynamicTemplate } from '@/components/sites/templates/SynagogueDynamicTemplate';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';
import { Edit, Eye, Save } from 'lucide-react';

// Données modifiables pour le template
const templateData = {
  hero: {
    title: 'Synagogue Beth Shalom',
    subtitle: 'Un lieu de prière, d\'étude et de rassemblement communautaire',
    backgroundImage: 'https://images.unsplash.com/photo-1560306843-33986aebaf12?q=80&w=2874',
    buttons: [
      {
        text: 'Faire un don',
        href: '/donate',
        variant: 'primary' as const
      },
      {
        text: 'Horaires des offices',
        href: '#prayers',
        variant: 'outline' as const
      }
    ]
  },
  prayers: {
    enabled: true,
    title: 'Horaires des Offices',
    subtitle: 'Rejoignez-nous pour les prières quotidiennes',
    location: '123 Rue de la Paix, 75001 Paris',
    times: [
      {
        name: 'Shaharit',
        hebrewName: 'שחרית',
        icon: '☀️',
        color: 'blue',
        times: [
          { day: 'Dimanche - Vendredi', time: '7h00' },
          { day: 'Shabbat', time: '9h00', isSpecial: true },
          { day: 'Jours de fête', time: '9h30', isSpecial: true }
        ]
      },
      {
        name: 'Minha',
        hebrewName: 'מנחה',
        icon: '🌅',
        color: 'orange',
        times: [
          { day: 'Dimanche - Jeudi', time: '18h30' },
          { day: 'Vendredi', time: 'Variable' },
          { day: 'Shabbat', time: '17h00', isSpecial: true }
        ]
      },
      {
        name: 'Arvit',
        hebrewName: 'ערבית',
        icon: '🌙',
        color: 'purple',
        times: [
          { day: 'Dimanche - Jeudi', time: '19h30' },
          { day: 'Motzei Shabbat', time: '20h30', isSpecial: true },
          { day: 'Jours de fête', time: 'Variable' }
        ]
      }
    ]
  },
  events: {
    enabled: true,
    title: 'Événements à Venir',
    subtitle: 'Participez à la vie de notre communauté',
    layout: 'grid' as const,
    items: [
      {
        id: '1',
        title: 'Cours de Torah Hebdomadaire',
        description: 'Rejoignez le Rabbin pour une étude approfondie de la paracha de la semaine',
        image: 'https://images.unsplash.com/photo-1490650404312-a2175773bbf5?q=80&w=2870',
        date: 'Tous les mercredis',
        time: '20h00',
        location: 'Salle d\'étude',
        category: 'Étude',
        categoryColor: 'blue',
        link: '/events/torah-study'
      },
      {
        id: '2',
        title: 'Kiddouch Communautaire',
        description: 'Partageons ensemble un moment convivial après l\'office du Shabbat matin',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2870',
        date: 'Ce Shabbat',
        time: 'Après l\'office',
        location: 'Salle de réception',
        category: 'Communauté',
        categoryColor: 'green',
        link: '/events/kiddouch'
      },
      {
        id: '3',
        title: 'Programme Jeunesse',
        description: 'Activités éducatives et ludiques pour les enfants de la communauté',
        image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=2869',
        date: 'Dimanche',
        time: '14h00 - 17h00',
        location: 'Salle des jeunes',
        category: 'Jeunesse',
        categoryColor: 'purple',
        price: '10€',
        link: '/events/youth-program'
      }
    ]
  },
  about: {
    enabled: true,
    title: 'À Propos de Notre Synagogue',
    content: 'Depuis plus de 50 ans, notre synagogue est un pilier de la communauté juive locale. Nous offrons un espace chaleureux et accueillant pour la prière, l\'étude et les célébrations.',
    image: 'https://images.unsplash.com/photo-1595133403068-57dc3a661c8d?q=80&w=2940',
    stats: [
      { label: 'Familles membres', value: '250+' },
      { label: 'Années d\'existence', value: '52' },
      { label: 'Cours hebdomadaires', value: '15' },
      { label: 'Événements annuels', value: '100+' }
    ]
  },
  donation: {
    enabled: true,
    title: 'Soutenez Notre Synagogue',
    subtitle: 'Votre générosité nous permet de maintenir nos services et programmes communautaires',
    backgroundImage: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2940',
    quickAmounts: [18, 36, 72, 180, 360]
  },
  contact: {
    enabled: true,
    address: '123 Rue de la Paix, 75001 Paris',
    phone: '01 23 45 67 89',
    email: 'contact@synagogue-beth-shalom.fr',
    hours: [
      { day: 'Dimanche - Jeudi', hours: '9h00 - 18h00' },
      { day: 'Vendredi', hours: '9h00 - 14h00' },
      { day: 'Shabbat', hours: 'Fermé' }
    ]
  }
};

export default function SynagogueTemplateDemoPage() {
  const [editMode, setEditMode] = useState(false);
  const [currentData, setCurrentData] = useState(templateData);
  const [editedData, setEditedData] = useState(JSON.stringify(templateData, null, 2));

  const handleSave = () => {
    try {
      const parsed = JSON.parse(editedData);
      setCurrentData(parsed);
      setEditMode(false);
      alert('Template mis à jour avec succès !');
    } catch (error) {
      alert('Erreur dans le JSON. Vérifiez la syntaxe.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Barre d'outils */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/fr/dashboard">
                <Button variant="outline" size="sm">
                  ← Retour
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Démo Template Synagogue</h1>
            </div>
            <div className="flex items-center space-x-2">
              {!editMode ? (
                <>
                  <Button
                    onClick={() => setEditMode(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier les données
                  </Button>
                  <Button size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Prévisualiser
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setEditMode(false)}
                    variant="outline"
                    size="sm"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      {editMode ? (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Éditeur JSON */}
            <div>
              <h2 className="text-lg font-bold mb-4">Modifier les données du template</h2>
              <div className="bg-gray-900 rounded-lg p-4 h-[calc(100vh-200px)] overflow-auto">
                <textarea
                  value={editedData}
                  onChange={(e) => setEditedData(e.target.value)}
                  className="w-full h-full bg-transparent text-green-400 font-mono text-sm outline-none resize-none"
                  spellCheck={false}
                />
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>💡 <strong>Astuce :</strong> Modifiez les textes, images et paramètres directement dans le JSON</p>
                <p>📝 Les sections peuvent être activées/désactivées avec <code>enabled: true/false</code></p>
                <p>🎨 Les couleurs disponibles : blue, orange, purple, green, red, yellow</p>
                <p>🖼️ Utilisez des URLs d'images Unsplash ou vos propres images</p>
              </div>
            </div>

            {/* Aperçu en temps réel */}
            <div>
              <h2 className="text-lg font-bold mb-4">Aperçu en temps réel</h2>
              <div className="border rounded-lg overflow-hidden h-[calc(100vh-200px)] overflow-y-auto">
                <div className="transform scale-50 origin-top-left w-[200%]">
                  <SynagogueDynamicTemplate
                    tenantId="demo"
                    data={currentData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <SynagogueDynamicTemplate
          tenantId="demo"
          data={currentData}
        />
      )}
    </div>
  );
}
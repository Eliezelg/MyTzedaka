'use client';

import { CourseCalendar } from '@/components/sites/jewish/CourseCalendar';
import { useTenant } from '@/providers/tenant-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Calendar, Users, Trophy, Download, Plus } from 'lucide-react';

interface CoursesPageProps {
  tenantId: string;
}

export function CoursesPage({ tenantId }: CoursesPageProps) {
  const { tenant } = useTenant();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Cours Torah</h1>
          <p className="text-lg text-gray-600">
            Programme d'étude et d'enseignement à {tenant.name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-600">Cours/semaine</p>
              </div>
              <Book className="h-8 w-8 text-primary/20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-gray-600">Enseignants</p>
              </div>
              <Users className="h-8 w-8 text-green-500/20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-gray-600">Participants</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500/20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">Nouveaux cours</p>
              </div>
              <Plus className="h-8 w-8 text-blue-500/20" />
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mb-6">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Télécharger planning
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            S'inscrire aux cours
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CourseCalendar 
              tenantId={tenantId}
              view="list"
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Course */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
              <h3 className="font-semibold mb-3">🌟 Cours en Vedette</h3>
              <div className="space-y-2">
                <h4 className="font-medium">Introduction au Talmud</h4>
                <p className="text-sm text-gray-600">
                  Nouveau cycle débutant le mois prochain. Inscription ouverte!
                </p>
                <div className="text-sm">
                  <p><strong>Enseignant:</strong> Rav Cohen</p>
                  <p><strong>Niveau:</strong> Débutant</p>
                  <p><strong>Horaire:</strong> Mardi 20h</p>
                </div>
                <Button className="w-full mt-3">
                  S'inscrire maintenant
                </Button>
              </div>
            </Card>
            
            {/* Study Materials */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Ressources d'Étude</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm">
                  📚 Bibliothèque numérique
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  🎧 Cours audio
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  📹 Vidéos des cours
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  📝 Feuilles d'étude
                </Button>
              </div>
            </Card>
            
            {/* Study Partners */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Havrouta (Étude en Binôme)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Trouvez un partenaire d'étude adapté à votre niveau et vos disponibilités.
              </p>
              <Button variant="outline" className="w-full">
                Trouver un Havrouta
              </Button>
            </Card>
            
            {/* Upcoming Events */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Événements à Venir</h3>
              <div className="space-y-3 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">Siyoum Massehet Berakhot</p>
                  <p className="text-gray-600">Dim 15 Dec - 20h</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">Conférence: Les Fêtes</p>
                  <p className="text-gray-600">Mar 17 Dec - 19h30</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">Shabbaton d'étude</p>
                  <p className="text-gray-600">20-21 Dec</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Study Tracks */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Parcours d'Étude</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="text-4xl mb-3">📖</div>
              <h3 className="font-semibold mb-2">Parcours Débutant</h3>
              <p className="text-sm text-gray-600 mb-3">
                Découvrez les bases du judaïsme et de l'étude des textes.
              </p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Introduction à la Torah</li>
                <li>• Hébreu biblique</li>
                <li>• Fêtes et traditions</li>
                <li>• Prière et spiritualité</li>
              </ul>
              <Button variant="outline" className="w-full mt-4">
                Voir le parcours
              </Button>
            </Card>
            
            <Card className="p-6">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold mb-2">Parcours Intermédiaire</h3>
              <p className="text-sm text-gray-600 mb-3">
                Approfondissez votre connaissance des textes.
              </p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Mishna et Guemara</li>
                <li>• Halakha pratique</li>
                <li>• Pensée juive</li>
                <li>• Commentaires classiques</li>
              </ul>
              <Button variant="outline" className="w-full mt-4">
                Voir le parcours
              </Button>
            </Card>
            
            <Card className="p-6">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold mb-2">Parcours Avancé</h3>
              <p className="text-sm text-gray-600 mb-3">
                Étude approfondie et analyse textuelle.
              </p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Talmud approfondi</li>
                <li>• Responsa et décisionnaires</li>
                <li>• Kabbale et mystique</li>
                <li>• Philosophie juive</li>
              </ul>
              <Button variant="outline" className="w-full mt-4">
                Voir le parcours
              </Button>
            </Card>
          </div>
        </div>

        {/* Contact */}
        <Card className="p-6 mt-8 text-center">
          <h3 className="font-semibold mb-3">Questions sur les cours?</h3>
          <p className="text-gray-600 mb-4">
            Notre équipe pédagogique est là pour vous orienter
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline">
              📧 education@{tenant.slug}.fr
            </Button>
            <Button>
              Prendre rendez-vous
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
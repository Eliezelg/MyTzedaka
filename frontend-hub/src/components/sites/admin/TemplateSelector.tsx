'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, CheckCircle, AlertCircle, Palette, Users, Building, School, Heart, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTenant } from '@/providers/tenant-provider';
import { getAccessToken } from '@/lib/security/cookie-auth';

interface Template {
  id: string;
  name: string;
  description: string;
  modules: string[];
}

const templateIcons = {
  synagogue: Building,
  association: Heart,
  community: Users,
  gmah: Heart,
  school: School,
};

export function TemplateSelector() {
  const { tenant } = useTenant();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [applying, setApplying] = useState(false);
  const [hasExistingPages, setHasExistingPages] = useState(false);

  useEffect(() => {
    fetchTemplates();
    checkExistingPages();
  }, [tenant]);

  const fetchTemplates = async () => {
    // Templates définis localement pour l'instant
    setTemplates([
      {
        id: 'synagogue',
        name: 'Synagogue',
        description: 'Pour les lieux de culte avec offices, cours de Torah et vie communautaire',
        modules: ['donations', 'campaigns', 'events', 'zmanim', 'prayers', 'courses', 'hebrewCalendar', 'members']
      },
      {
        id: 'association',
        name: 'Association Caritative',
        description: "Pour les associations d'entraide et de solidarité",
        modules: ['donations', 'campaigns', 'events', 'blog', 'members', 'directory', 'chesed', 'newsletter']
      },
      {
        id: 'community',
        name: 'Centre Communautaire',
        description: 'Centre complet avec synagogue, école, restaurant et services',
        modules: ['donations', 'campaigns', 'events', 'zmanim', 'prayers', 'courses', 'kashrut', 'marketplace']
      },
      {
        id: 'gmah',
        name: 'Gmah (Caisse de Prêt)',
        description: 'Caisse de prêt sans intérêt selon la loi juive',
        modules: ['donations', 'campaigns', 'blog', 'members', 'chesed', 'newsletter']
      },
      {
        id: 'school',
        name: 'École Juive',
        description: 'Établissement scolaire avec programme général et juif',
        modules: ['donations', 'campaigns', 'events', 'courses', 'hebrewCalendar', 'library', 'kashrut', 'newsletter']
      }
    ]);
  };

  const checkExistingPages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/pages`);
      if (response.ok) {
        const pages = await response.json();
        setHasExistingPages(Array.isArray(pages) && pages.length > 0);
      }
    } catch (error) {
      console.error('Error checking pages:', error);
    }
  };

  const applyTemplate = async () => {
    if (!selectedTemplate) {
      toast.error('Veuillez sélectionner un template');
      return;
    }

    if (hasExistingPages) {
      const confirmed = window.confirm(
        `Votre site a déjà des pages. Appliquer un template va créer de nouvelles pages et configurer les modules. Les pages existantes ne seront pas supprimées. Continuer ?`
      );
      if (!confirmed) return;
    }

    setApplying(true);
    try {
      const token = getAccessToken();
      
      if (!token) {
        toast.error('Vous devez être connecté pour appliquer un template');
        return;
      }
      
      // 1. Appliquer les modules
      const modulesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/modules`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(getModulesForTemplate(selectedTemplate))
        }
      );

      if (!modulesResponse.ok) {
        throw new Error('Erreur lors de l\'application des modules');
      }

      // 2. Créer les pages par défaut
      const pages = getPagesForTemplate(selectedTemplate);
      let pagesCreated = 0;
      let pagesSkipped = 0;

      for (const page of pages) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/pages`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(page)
            }
          );
          
          if (response.ok) {
            pagesCreated++;
          } else {
            pagesSkipped++;
            console.log('Page already exists or error creating:', page.slug);
          }
        } catch (error) {
          pagesSkipped++;
          console.log('Error creating page:', page.slug, error);
        }
      }

      const templateName = templates.find(t => t.id === selectedTemplate)?.name;
      toast.success(
        `Template "${templateName}" appliqué avec succès ! ${pagesCreated} pages créées, ${pagesSkipped} ignorées.`
      );
      
      // Rafraîchir la vérification des pages
      checkExistingPages();
      
      // Réinitialiser la sélection
      setSelectedTemplate('');
      
      // Recharger la page après 2 secondes pour voir les changements
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Erreur lors de l\'application du template');
    } finally {
      setApplying(false);
    }
  };

  const getModulesForTemplate = (templateId: string) => {
    const moduleConfigs: Record<string, any> = {
      synagogue: {
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        gallery: true,
        zmanim: true,
        prayers: true,
        courses: true,
        hebrewCalendar: true,
        members: true,
        library: true,
        yahrzeits: true,
        seatingChart: true,
        mikvah: true,
        eruv: true,
        directory: true,
        chesed: true,
        newsletter: true,
      },
      association: {
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        gallery: true,
        members: true,
        directory: true,
        chesed: true,
        newsletter: true,
      },
      community: {
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        gallery: true,
        zmanim: true,
        prayers: true,
        courses: true,
        hebrewCalendar: true,
        members: true,
        library: true,
        yahrzeits: true,
        mikvah: true,
        kashrut: true,
        eruv: true,
        marketplace: true,
        directory: true,
        chesed: true,
        newsletter: true,
      },
      gmah: {
        donations: true,
        campaigns: true,
        blog: true,
        members: true,
        chesed: true,
        newsletter: true,
      },
      school: {
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        gallery: true,
        courses: true,
        hebrewCalendar: true,
        members: true,
        library: true,
        kashrut: true,
        directory: true,
        newsletter: true,
      },
    };

    return moduleConfigs[templateId] || {};
  };

  const getPagesForTemplate = (templateId: string) => {
    const basePages = [
      {
        title: 'Accueil',
        slug: 'home',
        type: 'STATIC',
        content: getHomePageContent(templateId),
        isActive: true,
        status: 'PUBLISHED',
        seo: {
          title: 'Accueil',
          description: 'Page d\'accueil',
        },
        settings: {
          showInNavbar: false,
        },
      }
    ];

    // Ajouter des pages spécifiques selon le template
    if (templateId === 'synagogue') {
      basePages.push(
        {
          title: 'Offices',
          slug: 'prayers',
          type: 'STATIC',
          content: `<h1>Horaires des Offices</h1>
<h2>Semaine</h2>
<ul>
  <li>Shaharit : 7h00</li>
  <li>Minha : Voir calendrier</li>
  <li>Arvit : 20h00</li>
</ul>
<h2>Shabbat</h2>
<ul>
  <li>Vendredi soir : 18h30</li>
  <li>Samedi matin : 9h00</li>
</ul>`,
          isActive: true,
          status: 'PUBLISHED',
          seo: {
            title: 'Offices',
            description: 'Horaires des offices',
          },
          settings: {
            showInNavbar: true,
            navOrder: 2,
          },
        },
        {
          title: 'Cours de Torah',
          slug: 'courses',
          type: 'STATIC',
          content: `<h1>Programme d'Études</h1>
<h2>Talmud Torah</h2>
<p>Pour les enfants de 5 à 13 ans - Dimanche 10h-12h</p>
<h2>Cours pour Adultes</h2>
<ul>
  <li>Guemara - Lundi 20h</li>
  <li>Halakha - Mardi 20h</li>
  <li>Pensée Juive - Mercredi 20h</li>
</ul>`,
          isActive: true,
          status: 'PUBLISHED',
          seo: {
            title: 'Cours de Torah',
            description: 'Programme d\'études juives',
          },
          settings: {
            showInNavbar: true,
            navOrder: 3,
          },
        }
      );
    }

    if (templateId === 'association' || templateId === 'gmah') {
      basePages.push({
        title: 'Nos Actions',
        slug: 'actions',
        type: 'STATIC',
        content: `<h1>Nos Actions</h1>
<h2>Aide Alimentaire</h2>
<p>Distribution de colis alimentaires chaque semaine.</p>
<h2>Soutien aux Familles</h2>
<p>Accompagnement personnalisé pour les familles en difficulté.</p>
<h2>Aide d'Urgence</h2>
<p>Intervention rapide en cas de besoin urgent.</p>`,
        isActive: true,
        status: 'PUBLISHED',
        seo: {
          title: 'Nos Actions',
          description: 'Découvrez nos actions',
        },
        settings: {
          showInNavbar: true,
          navOrder: 2,
        },
      });
    }

    if (templateId === 'school') {
      basePages.push({
        title: 'Programme Scolaire',
        slug: 'program',
        type: 'STATIC',
        content: `<h1>Notre Programme</h1>
<h2>Enseignement Général</h2>
<p>Programme conforme à l'Éducation Nationale avec excellence académique.</p>
<h2>Études Juives</h2>
<p>Torah, Mishna, Guemara adaptées à chaque niveau.</p>
<h2>Activités Extra-scolaires</h2>
<p>Sport, musique, arts et sorties culturelles.</p>`,
        isActive: true,
        status: 'PUBLISHED',
        seo: {
          title: 'Programme Scolaire',
          description: 'Notre programme éducatif',
        },
        settings: {
          showInNavbar: true,
          navOrder: 2,
        },
      });
    }

    // Page À propos pour tous les templates
    basePages.push({
      title: 'À propos',
      slug: 'about',
      type: 'STATIC',
      content: `<h1>À propos de ${tenant?.name || 'notre organisation'}</h1>
<p>Notre histoire, notre mission et nos valeurs.</p>
<h2>Notre Mission</h2>
<p>Servir notre communauté avec dévouement et intégrité.</p>
<h2>Nos Valeurs</h2>
<ul>
  <li>Torah et Mitsvot</li>
  <li>Chesed et Tsedaka</li>
  <li>Unité communautaire</li>
</ul>`,
      isActive: true,
      status: 'PUBLISHED',
      seo: {
        title: 'À propos',
        description: 'Découvrez notre organisation',
      },
      settings: {
        showInNavbar: true,
        navOrder: 10,
      },
    });

    return basePages;
  };

  const getHomePageContent = (templateId: string) => {
    const contents: Record<string, string> = {
      synagogue: `<h1>Bienvenue à ${tenant?.name || 'notre Synagogue'}</h1>
<p>Nous sommes heureux de vous accueillir dans notre communauté.</p>
<h2>Horaires des Offices</h2>
<p>Shaharit : 7h00 | Minha : Variable | Arvit : 20h00</p>
<h2>Prochains Événements</h2>
<p>Consultez notre calendrier pour ne rien manquer de la vie communautaire.</p>`,
      
      association: `<h1>Bienvenue chez ${tenant?.name || 'notre Association'}</h1>
<p>Ensemble, construisons un monde meilleur par la solidarité.</p>
<h2>Notre Mission</h2>
<p>Aider les familles dans le besoin et promouvoir la solidarité communautaire.</p>
<h2>Comment Nous Aider</h2>
<p>Faites un don, devenez bénévole ou parrainez une famille.</p>`,
      
      community: `<h1>Bienvenue au ${tenant?.name || 'Centre Communautaire'}</h1>
<p>Un lieu de vie, de prière et de partage pour toute la communauté.</p>
<h2>Nos Services</h2>
<ul>
  <li>Synagogue et offices quotidiens</li>
  <li>École et Talmud Torah</li>
  <li>Restaurant communautaire cachère</li>
  <li>Centre culturel et bibliothèque</li>
</ul>`,
      
      gmah: `<h1>${tenant?.name || 'Gmah'} - Caisse de Prêt Sans Intérêt</h1>
<p>Entraide financière selon les principes de la Torah.</p>
<h2>Nos Services</h2>
<ul>
  <li>Prêts sans intérêt pour les familles</li>
  <li>Aide d'urgence</li>
  <li>Accompagnement et conseils financiers</li>
</ul>
<h2>Comment Faire une Demande</h2>
<p>Contactez-nous en toute confidentialité pour étudier votre situation.</p>`,
      
      school: `<h1>${tenant?.name || 'École Juive'}</h1>
<p>Excellence académique et valeurs juives depuis plus de 20 ans.</p>
<h2>Notre Pédagogie</h2>
<p>Un enseignement général de qualité enrichi par l'étude de la Torah.</p>
<h2>Inscriptions</h2>
<p>Les inscriptions pour l'année prochaine sont ouvertes. Contactez-nous pour plus d'informations.</p>`,
    };

    return contents[templateId] || contents.association;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Appliquer un Template de Site
          </CardTitle>
          <CardDescription>
            Initialisez rapidement votre site avec un template préconfiguré adapté à votre type d'organisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Information sur le site actuel */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Site : {tenant.name}</AlertTitle>
            <AlertDescription>
              {hasExistingPages 
                ? 'Ce site a déjà des pages. Le template ajoutera de nouvelles pages et configurera les modules.'
                : 'Ce site n\'a pas encore de pages. Le template créera les pages de base et configurera les modules.'}
            </AlertDescription>
          </Alert>

          {/* Sélection du template */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Choisissez un template</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const Icon = templateIcons[template.id as keyof typeof templateIcons] || Palette;
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.modules.slice(0, 4).map((module) => (
                          <Badge key={module} variant="outline" className="text-xs">
                            {module}
                          </Badge>
                        ))}
                        {template.modules.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.modules.length - 4}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Bouton d'application */}
          <Button
            onClick={applyTemplate}
            disabled={!selectedTemplate || applying}
            className="w-full"
            size="lg"
          >
            {applying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Application en cours...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Appliquer le Template
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            1. <strong>Choisissez un template</strong> : Sélectionnez le type qui correspond le mieux à votre organisation
          </p>
          <p>
            2. <strong>Appliquez</strong> : Le template va automatiquement :
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Configurer les modules adaptés (donations, événements, etc.)</li>
            <li>Créer les pages de base (accueil, à propos, etc.)</li>
            <li>Appliquer un thème visuel approprié</li>
          </ul>
          <p>
            3. <strong>Personnalisez</strong> : Après application, vous pourrez :
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Modifier le contenu des pages dans l\'onglet "Pages"</li>
            <li>Ajuster les modules activés dans l\'onglet "Modules"</li>
            <li>Personnaliser les couleurs dans l\'onglet "Thème"</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
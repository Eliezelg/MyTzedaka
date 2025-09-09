'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Wand2, CheckCircle, AlertCircle, Palette, Users, 
  Building, School, Heart, Info, Eye, ChevronRight, 
  Calendar, BookOpen, Home, Star, Edit3, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTenant } from '@/providers/tenant-provider';
import { getAccessToken } from '@/lib/security/cookie-auth';

interface TemplateDesign {
  id: string;
  name: string;
  description: string;
  preview: string; // URL de prévisualisation ou image
  primaryColor: string;
  secondaryColor: string;
  style: 'modern' | 'classic' | 'elegant';
  features: string[];
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  modules: string[];
  designs: TemplateDesign[];
}

const templateCategories: TemplateCategory[] = [
  {
    id: 'synagogue',
    name: 'Synagogue',
    description: 'Pour les lieux de culte avec offices et vie communautaire',
    icon: Building,
    modules: ['donations', 'campaigns', 'events', 'zmanim', 'prayers', 'courses', 'hebrewCalendar', 'members'],
    designs: [
      {
        id: 'synagogue-modern',
        name: 'Moderne ✨',
        description: 'Design épuré avec sections dynamiques et animations',
        preview: 'https://images.unsplash.com/photo-1560306843-33986aebaf12?q=80&w=2874',
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        style: 'modern',
        features: ['Horaires dynamiques', 'Événements avec images', 'Hero animé', 'Sections éditables']
      },
      {
        id: 'synagogue-classic',
        name: 'Classique',
        description: 'Style traditionnel et chaleureux',
        preview: '/templates/synagogue-classic.jpg',
        primaryColor: '#7c2d12',
        secondaryColor: '#c2410c',
        style: 'classic',
        features: ['Design sobre', 'Focus sur le contenu', 'Navigation simple']
      },
      {
        id: 'synagogue-elegant',
        name: 'Élégant',
        description: 'Design raffiné avec détails dorés',
        preview: '/templates/synagogue-elegant.jpg',
        primaryColor: '#713f12',
        secondaryColor: '#fbbf24',
        style: 'elegant',
        features: ['Typographie hébraïque', 'Ornements décoratifs', 'Galerie photos']
      }
    ]
  },
  {
    id: 'association',
    name: 'Association Caritative',
    description: "Pour les associations d'entraide et de solidarité",
    icon: Heart,
    modules: ['donations', 'campaigns', 'events', 'blog', 'members', 'directory', 'chesed', 'newsletter'],
    designs: [
      {
        id: 'association-warm',
        name: 'Chaleureux',
        description: 'Couleurs chaudes et accueillantes',
        preview: '/templates/association-warm.jpg',
        primaryColor: '#dc2626',
        secondaryColor: '#f87171',
        style: 'modern',
        features: ['Témoignages', 'Compteur de dons', 'Blog intégré']
      },
      {
        id: 'association-trust',
        name: 'Confiance',
        description: 'Design professionnel et transparent',
        preview: '/templates/association-trust.jpg',
        primaryColor: '#059669',
        secondaryColor: '#10b981',
        style: 'classic',
        features: ['Rapports financiers', 'Projets détaillés', 'Impact visuel']
      },
      {
        id: 'association-dynamic',
        name: 'Dynamique',
        description: 'Style moderne et engageant',
        preview: '/templates/association-dynamic.jpg',
        primaryColor: '#7c3aed',
        secondaryColor: '#a78bfa',
        style: 'modern',
        features: ['Animations', 'Infographies', 'Réseaux sociaux']
      }
    ]
  },
  {
    id: 'community',
    name: 'Centre Communautaire',
    description: 'Centre complet avec multiples services',
    icon: Users,
    modules: ['donations', 'campaigns', 'events', 'zmanim', 'prayers', 'courses', 'kashrut', 'marketplace'],
    designs: [
      {
        id: 'community-hub',
        name: 'Hub Central',
        description: 'Portail avec tous les services',
        preview: '/templates/community-hub.jpg',
        primaryColor: '#0891b2',
        secondaryColor: '#06b6d4',
        style: 'modern',
        features: ['Dashboard membre', 'Réservations', 'Annuaire']
      },
      {
        id: 'community-family',
        name: 'Familial',
        description: 'Orienté familles et enfants',
        preview: '/templates/community-family.jpg',
        primaryColor: '#ea580c',
        secondaryColor: '#fb923c',
        style: 'modern',
        features: ['Activités jeunesse', 'Événements familiaux', 'Galerie photos']
      },
      {
        id: 'community-professional',
        name: 'Professionnel',
        description: 'Design institutionnel',
        preview: '/templates/community-professional.jpg',
        primaryColor: '#0f172a',
        secondaryColor: '#475569',
        style: 'elegant',
        features: ['Structure claire', 'Documentation', 'Formulaires']
      }
    ]
  },
  {
    id: 'gmah',
    name: 'Gmah (Caisse de Prêt)',
    description: 'Caisse de prêt sans intérêt',
    icon: Heart,
    modules: ['donations', 'campaigns', 'blog', 'members', 'chesed', 'newsletter'],
    designs: [
      {
        id: 'gmah-trust',
        name: 'Confidentiel',
        description: 'Accent sur la discrétion',
        preview: '/templates/gmah-trust.jpg',
        primaryColor: '#166534',
        secondaryColor: '#22c55e',
        style: 'classic',
        features: ['Formulaire sécurisé', 'FAQ détaillée', 'Témoignages anonymes']
      },
      {
        id: 'gmah-simple',
        name: 'Simple',
        description: 'Interface épurée et claire',
        preview: '/templates/gmah-simple.jpg',
        primaryColor: '#1e3a8a',
        secondaryColor: '#3b82f6',
        style: 'modern',
        features: ['Process simplifié', 'Calcul de prêt', 'Suivi en ligne']
      },
      {
        id: 'gmah-community',
        name: 'Communautaire',
        description: 'Aspect solidaire renforcé',
        preview: '/templates/gmah-community.jpg',
        primaryColor: '#7c2d12',
        secondaryColor: '#ea580c',
        style: 'modern',
        features: ['Histoires de réussite', 'Compteur d\'aide', 'Blog']
      }
    ]
  },
  {
    id: 'school',
    name: 'École Juive',
    description: 'Établissement scolaire',
    icon: School,
    modules: ['donations', 'campaigns', 'events', 'courses', 'hebrewCalendar', 'library', 'kashrut', 'newsletter'],
    designs: [
      {
        id: 'school-playful',
        name: 'Ludique',
        description: 'Design coloré pour enfants',
        preview: '/templates/school-playful.jpg',
        primaryColor: '#dc2626',
        secondaryColor: '#fbbf24',
        style: 'modern',
        features: ['Espace parents', 'Galerie travaux', 'Calendrier scolaire']
      },
      {
        id: 'school-academic',
        name: 'Académique',
        description: 'Style sérieux et studieux',
        preview: '/templates/school-academic.jpg',
        primaryColor: '#1e3a8a',
        secondaryColor: '#1e40af',
        style: 'classic',
        features: ['Programme détaillé', 'Résultats', 'Ressources pédagogiques']
      },
      {
        id: 'school-innovative',
        name: 'Innovant',
        description: 'Approche moderne de l\'éducation',
        preview: '/templates/school-innovative.jpg',
        primaryColor: '#059669',
        secondaryColor: '#10b981',
        style: 'modern',
        features: ['Portail étudiant', 'Classes virtuelles', 'Projets interactifs']
      }
    ]
  }
];

export function EnhancedTemplateSelector() {
  const { tenant } = useTenant();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [applying, setApplying] = useState(false);
  const [hasExistingPages, setHasExistingPages] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    checkExistingPages();
  }, [tenant]);

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
    if (!selectedCategory || !selectedDesign) {
      toast.error('Veuillez sélectionner une catégorie et un design');
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
        setApplying(false);
        return;
      }

      const category = templateCategories.find(c => c.id === selectedCategory);
      const design = category?.designs.find(d => d.id === selectedDesign);
      
      if (!category || !design) {
        toast.error('Template invalide');
        setApplying(false);
        return;
      }

      // 1. Appliquer les modules de la catégorie
      const modulesConfig = getModulesForCategory(selectedCategory);
      const modulesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/modules`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(modulesConfig)
        }
      );

      if (!modulesResponse.ok) {
        throw new Error('Erreur lors de l\'application des modules');
      }

      // 2. Créer les pages avec le design sélectionné
      const pages = getPagesForDesign(selectedCategory, selectedDesign);
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
          }
        } catch (error) {
          pagesSkipped++;
        }
      }

      // 3. Si c'est le template synagogue moderne, sauvegarder les données du template
      if (selectedDesign === 'synagogue-modern') {
        const templateData = {
          templateId: 'synagogue-modern',
          templateData: {
            hero: {
              title: tenant?.name || 'Synagogue',
              subtitle: 'Un lieu de prière, d\'étude et de rassemblement communautaire',
              backgroundImage: 'https://images.unsplash.com/photo-1560306843-33986aebaf12?q=80&w=2874',
            },
            prayers: {
              enabled: true,
              title: 'Horaires des Offices',
              location: tenant?.address || '',
              times: [
                {
                  name: 'Shaharit',
                  hebrewName: 'שחרית',
                  icon: '☀️',
                  color: 'blue',
                  times: [
                    { day: 'Dimanche - Vendredi', time: '7h00' },
                    { day: 'Shabbat', time: '9h00', isSpecial: true }
                  ]
                },
                {
                  name: 'Minha',
                  hebrewName: 'מנחה',
                  icon: '🌅',
                  color: 'orange',
                  times: [
                    { day: 'Dimanche - Jeudi', time: '18h30' },
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
                    { day: 'Motzei Shabbat', time: '20h30', isSpecial: true }
                  ]
                }
              ]
            },
            events: { enabled: true },
            contact: { 
              enabled: true,
              address: tenant?.address || '',
              phone: tenant?.phone || '',
              email: tenant?.email || ''
            }
          }
        };
        
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/template`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(templateData)
          }
        ).catch(() => null);
      }

      // 4. Appliquer le thème visuel
      const themeResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenant.id}/theme`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            primaryColor: design.primaryColor,
            secondaryColor: design.secondaryColor,
            style: design.style
          })
        }
      ).catch(() => null); // Ignorer si l'endpoint n'existe pas encore

      toast.success(
        `Template "${category.name} - ${design.name}" appliqué avec succès ! ${pagesCreated} pages créées.`
      );
      
      // Recharger la page après 2 secondes
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

  const getModulesForCategory = (categoryId: string) => {
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

    return moduleConfigs[categoryId] || {};
  };

  const getPagesForDesign = (categoryId: string, designId: string) => {
    const category = templateCategories.find(c => c.id === categoryId);
    const design = category?.designs.find(d => d.id === designId);
    
    const basePages = [
      {
        title: 'Accueil',
        slug: 'home',
        type: 'STATIC',
        content: getHomePageContent(categoryId, designId),
        isActive: true,
        status: 'PUBLISHED',
        seo: {
          title: `${tenant?.name} - Accueil`,
          description: `Bienvenue sur le site de ${tenant?.name}`,
        },
        settings: {
          showInNavbar: false,
        },
      }
    ];

    // Pages spécifiques par catégorie
    if (categoryId === 'synagogue') {
      basePages.push(
        {
          title: 'Offices',
          slug: 'prayers',
          type: 'STATIC',
          content: getOfficesContent(designId),
          isActive: true,
          status: 'PUBLISHED',
          seo: { title: 'Horaires des Offices', description: 'Horaires de prières' },
          settings: { showInNavbar: true, navOrder: 2 },
        },
        {
          title: 'Cours',
          slug: 'courses',
          type: 'STATIC',
          content: getCoursesContent(designId),
          isActive: true,
          status: 'PUBLISHED',
          seo: { title: 'Cours de Torah', description: 'Programme d\'études' },
          settings: { showInNavbar: true, navOrder: 3 },
        }
      );
    }

    if (categoryId === 'association' || categoryId === 'gmah') {
      basePages.push({
        title: 'Nos Actions',
        slug: 'actions',
        type: 'STATIC',
        content: getActionsContent(categoryId, designId),
        isActive: true,
        status: 'PUBLISHED',
        seo: { title: 'Nos Actions', description: 'Découvrez nos actions' },
        settings: { showInNavbar: true, navOrder: 2 },
      });
    }

    if (categoryId === 'school') {
      basePages.push({
        title: 'Programme',
        slug: 'program',
        type: 'STATIC',
        content: getProgramContent(designId),
        isActive: true,
        status: 'PUBLISHED',
        seo: { title: 'Programme Scolaire', description: 'Notre programme' },
        settings: { showInNavbar: true, navOrder: 2 },
      });
    }

    // Page À propos pour tous
    basePages.push({
      title: 'À propos',
      slug: 'about',
      type: 'STATIC',
      content: getAboutContent(categoryId, designId),
      isActive: true,
      status: 'PUBLISHED',
      seo: { title: 'À propos', description: `À propos de ${tenant?.name}` },
      settings: { showInNavbar: true, navOrder: 10 },
    });

    return basePages;
  };

  const getHomePageContent = (categoryId: string, designId: string) => {
    // Contenu personnalisé selon le design
    const design = templateCategories
      .find(c => c.id === categoryId)?.designs
      .find(d => d.id === designId);
    
    const style = design?.style || 'modern';
    
    if (style === 'modern') {
      return `<div class="hero-section">
        <h1 class="text-4xl font-bold">Bienvenue à ${tenant?.name}</h1>
        <p class="text-xl mt-4">Votre communauté, votre maison</p>
      </div>`;
    } else if (style === 'classic') {
      return `<div class="traditional-header">
        <h1>ברוכים הבאים</h1>
        <h2>${tenant?.name}</h2>
        <p>Une tradition vivante au cœur de notre communauté</p>
      </div>`;
    } else {
      return `<div class="elegant-welcome">
        <h1 class="ornate-title">${tenant?.name}</h1>
        <p class="subtitle">Excellence et tradition depuis toujours</p>
      </div>`;
    }
  };

  const getOfficesContent = (designId: string) => {
    return `<h1>Horaires des Offices</h1>
<div class="prayer-times">
  <h2>Semaine</h2>
  <ul>
    <li>Shaharit : 7h00</li>
    <li>Minha : Variable selon saison</li>
    <li>Arvit : 20h00</li>
  </ul>
  <h2>Shabbat</h2>
  <ul>
    <li>Vendredi soir : 30 min avant le coucher du soleil</li>
    <li>Samedi matin : 9h00</li>
    <li>Samedi après-midi : 1h avant la sortie</li>
  </ul>
</div>`;
  };

  const getCoursesContent = (designId: string) => {
    return `<h1>Programme d'Études</h1>
<div class="courses-list">
  <section>
    <h2>Pour les Enfants</h2>
    <p>Talmud Torah tous les dimanches de 10h à 12h</p>
  </section>
  <section>
    <h2>Pour les Adultes</h2>
    <ul>
      <li>Guemara - Lundi 20h</li>
      <li>Halakha - Mardi 20h</li>
      <li>Pensée Juive - Mercredi 20h</li>
    </ul>
  </section>
</div>`;
  };

  const getActionsContent = (categoryId: string, designId: string) => {
    if (categoryId === 'gmah') {
      return `<h1>Nos Services d'Entraide</h1>
<div class="services">
  <section>
    <h2>Prêts Sans Intérêt</h2>
    <p>Aide financière selon les principes de la Torah</p>
  </section>
  <section>
    <h2>Aide d'Urgence</h2>
    <p>Intervention rapide en cas de besoin</p>
  </section>
  <section>
    <h2>Accompagnement</h2>
    <p>Conseils et soutien personnalisé</p>
  </section>
</div>`;
    }
    
    return `<h1>Nos Actions Concrètes</h1>
<div class="actions-grid">
  <section>
    <h2>Aide Alimentaire</h2>
    <p>Distribution hebdomadaire de colis alimentaires</p>
  </section>
  <section>
    <h2>Soutien Scolaire</h2>
    <p>Accompagnement des enfants en difficulté</p>
  </section>
  <section>
    <h2>Aide aux Familles</h2>
    <p>Support moral et matériel</p>
  </section>
</div>`;
  };

  const getProgramContent = (designId: string) => {
    return `<h1>Notre Programme Éducatif</h1>
<div class="program">
  <section>
    <h2>Enseignement Général</h2>
    <p>Programme conforme à l'Éducation Nationale</p>
  </section>
  <section>
    <h2>Études Juives</h2>
    <p>Torah, Mishna et Guemara adaptées à chaque niveau</p>
  </section>
  <section>
    <h2>Activités Extra-scolaires</h2>
    <p>Sport, musique, arts et sorties culturelles</p>
  </section>
</div>`;
  };

  const getAboutContent = (categoryId: string, designId: string) => {
    return `<h1>À propos de ${tenant?.name}</h1>
<div class="about-content">
  <section>
    <h2>Notre Histoire</h2>
    <p>Fondée avec passion et dévouement pour servir notre communauté.</p>
  </section>
  <section>
    <h2>Notre Mission</h2>
    <p>Créer un espace d'épanouissement spirituel et communautaire.</p>
  </section>
  <section>
    <h2>Nos Valeurs</h2>
    <ul>
      <li>Torah et Mitsvot</li>
      <li>Chesed et Tsedaka</li>
      <li>Unité et Fraternité</li>
    </ul>
  </section>
</div>`;
  };

  const selectedCategoryData = templateCategories.find(c => c.id === selectedCategory);
  const selectedDesignData = selectedCategoryData?.designs.find(d => d.id === selectedDesign);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Templates de Sites Professionnels
          </CardTitle>
          <CardDescription>
            Choisissez un template adapté à votre organisation avec des designs professionnels
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Étape 1: Sélection de la catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">1</span>
            Choisissez votre type d'organisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templateCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all ${
                    selectedCategory === category.id
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedDesign(''); // Reset design selection
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {category.modules.slice(0, 3).map((module) => (
                        <Badge key={module} variant="outline" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                      {category.modules.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.modules.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Étape 2: Sélection du design */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">2</span>
              Choisissez un design
            </CardTitle>
            <CardDescription>
              {selectedCategoryData?.designs.length} designs disponibles pour {selectedCategoryData?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedCategoryData?.designs.map((design) => (
                <Card
                  key={design.id}
                  className={`cursor-pointer transition-all overflow-hidden ${
                    selectedDesign === design.id
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedDesign(design.id)}
                >
                  {/* Preview Image Placeholder */}
                  <div 
                    className="h-40 bg-gradient-to-br flex items-center justify-center relative"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor})`
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative text-white text-center">
                      <Palette className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm font-medium">Aperçu</p>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      {design.name}
                      <Badge variant="outline" className="text-xs">
                        {design.style}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {design.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: design.primaryColor }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: design.secondaryColor }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {design.features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPreview(true);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Aperçu
                      </Button>
                      {design.id === 'synagogue-modern' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open('/fr/demo-template/synagogue', '_blank');
                          }}
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Personnaliser
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résumé et action */}
      {selectedCategory && selectedDesign && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">3</span>
              Confirmer et appliquer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Résumé de la sélection */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Votre sélection :</p>
              <div className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedCategoryData?.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedDesignData?.name}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: selectedDesignData?.primaryColor }}
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: selectedDesignData?.secondaryColor }}
                />
              </div>
            </div>

            {/* Avertissement si pages existantes */}
            {hasExistingPages && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pages existantes détectées</AlertTitle>
                <AlertDescription>
                  Ce site a déjà des pages. Le template ajoutera de nouvelles pages sans supprimer les existantes.
                </AlertDescription>
              </Alert>
            )}

            {/* Ce qui sera créé */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Ce qui sera configuré</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{selectedCategoryData?.modules.length} modules activés</li>
                  <li>4-5 pages de contenu pré-remplies</li>
                  <li>Thème visuel {selectedDesignData?.style}</li>
                  <li>Configuration SEO de base</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Bouton d'application */}
            <Button
              onClick={applyTemplate}
              disabled={applying}
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
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Guide d'utilisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
              <p><strong>Type d'organisation</strong> : Définit les modules et fonctionnalités disponibles</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
              <p><strong>Design</strong> : Détermine l'apparence visuelle et l'expérience utilisateur</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
              <p><strong>Personnalisation</strong> : Après application, modifiez le contenu dans l'onglet "Pages"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
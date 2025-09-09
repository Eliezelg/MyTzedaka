import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantModulesService } from './tenant-modules.service';
import { PageManagementService } from '../admin/page-management.service';
import { CreatePageDto, PageType, PageStatus } from '../admin/dto/page-management.dto';

export type TemplateType = 'synagogue' | 'association' | 'community' | 'gmah' | 'school';

interface SiteTemplate {
  modules: {
    donations: boolean;
    campaigns: boolean;
    events: boolean;
    blog: boolean;
    gallery: boolean;
    zmanim: boolean;
    prayers: boolean;
    courses: boolean;
    hebrewCalendar: boolean;
    members: boolean;
    library: boolean;
    yahrzeits: boolean;
    seatingChart: boolean;
    mikvah: boolean;
    kashrut: boolean;
    eruv: boolean;
    marketplace: boolean;
    directory: boolean;
    chesed: boolean;
    newsletter: boolean;
  };
  pages: CreatePageDto[];
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}

@Injectable()
export class SiteTemplatesService {
  constructor(
    private prisma: PrismaService,
    private modulesService: TenantModulesService,
    private pageService: PageManagementService,
  ) {}

  private templates: Record<TemplateType, SiteTemplate> = {
    synagogue: {
      modules: {
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        gallery: true,
        zmanim: true, // Horaires de prières
        prayers: true, // Services religieux
        courses: true, // Cours de Torah
        hebrewCalendar: true, // Calendrier hébraïque
        members: true, // Gestion des membres
        library: true, // Bibliothèque
        yahrzeits: true, // Commémorations
        seatingChart: true, // Plan de la synagogue
        mikvah: true, // Mikvé
        kashrut: false,
        eruv: true, // Limites du Shabbat
        marketplace: false,
        directory: true,
        chesed: true,
        newsletter: true,
      },
      pages: [
        {
          title: 'Accueil',
          slug: 'home',
          type: PageType.STATIC,
          content: `
            <h1>Bienvenue dans notre Synagogue</h1>
            <p>Nous sommes heureux de vous accueillir dans notre communauté.</p>
            <h2>Horaires des Offices</h2>
            <p>Shaharit : 7h00 | Minha : Variable | Arvit : 20h00</p>
            <h2>Cours de Torah</h2>
            <p>Découvrez nos cours hebdomadaires pour tous les niveaux.</p>
          `,
          isActive: true,
          status: PageStatus.PUBLISHED,
          seo: {
            title: 'Synagogue - Accueil',
            description: 'Bienvenue dans notre synagogue',
          },
          settings: {
            showInNavbar: false,
          },
        },
        {
          title: 'Offices',
          slug: 'prayers',
          type: PageType.STATIC,
          content: `
            <h1>Horaires des Offices</h1>
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
              <li>Samedi après-midi : Variable</li>
            </ul>
          `,
          isActive: true,
          status: PageStatus.PUBLISHED,
          settings: {
            showInNavbar: true,
            navOrder: 2,
          },
        },
        {
          title: 'Cours',
          slug: 'courses',
          type: PageType.STATIC,
          content: `
            <h1>Programme d'Études</h1>
            <h2>Talmud Torah</h2>
            <p>Pour les enfants de 5 à 13 ans</p>
            <h2>Cours pour Adultes</h2>
            <ul>
              <li>Guemara - Lundi 20h</li>
              <li>Halakha - Mardi 20h</li>
              <li>Pensée Juive - Mercredi 20h</li>
            </ul>
          `,
          isActive: true,
          status: PageStatus.PUBLISHED,
          settings: {
            showInNavbar: true,
            navOrder: 3,
          },
        },
      ],
      theme: {
        primaryColor: '#1a365d',
        secondaryColor: '#2c5282',
      },
    },

    association: {
      modules: {
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        gallery: true,
        zmanim: false,
        prayers: false,
        courses: false,
        hebrewCalendar: false,
        members: true,
        library: false,
        yahrzeits: false,
        seatingChart: false,
        mikvah: false,
        kashrut: false,
        eruv: false,
        marketplace: false,
        directory: true,
        chesed: true, // Œuvres de bienfaisance
        newsletter: true,
      },
      pages: [
        {
          title: 'Accueil',
          slug: 'home',
          type: PageType.STATIC,
          content: `
            <h1>Bienvenue dans notre Association</h1>
            <p>Ensemble, construisons un monde meilleur par la solidarité.</p>
            <h2>Notre Mission</h2>
            <p>Aider les familles dans le besoin et promouvoir la solidarité communautaire.</p>
            <h2>Nos Actions</h2>
            <ul>
              <li>Distribution alimentaire</li>
              <li>Aide aux devoirs</li>
              <li>Soutien aux personnes isolées</li>
            </ul>
          `,
          isActive: true,
          status: PageStatus.PUBLISHED,
          settings: {
            showInNavbar: false,
          },
        },
        {
          title: 'Nos Actions',
          slug: 'actions',
          type: PageType.STATIC,
          content: `
            <h1>Nos Actions Concrètes</h1>
            <h2>Aide Alimentaire</h2>
            <p>Distribution de colis alimentaires chaque semaine.</p>
            <h2>Soutien Scolaire</h2>
            <p>Accompagnement personnalisé pour les enfants.</p>
            <h2>Accompagnement Social</h2>
            <p>Aide administrative et orientation.</p>
          `,
          isActive: true,
          status: PageStatus.PUBLISHED,
          settings: {
            showInNavbar: true,
            navOrder: 2,
          },
        },
      ],
      theme: {
        primaryColor: '#059669',
        secondaryColor: '#10b981',
      },
    },

    community: {
      modules: {
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
        seatingChart: false,
        mikvah: true,
        kashrut: true, // Cacherout
        eruv: true,
        marketplace: true, // Petites annonces
        directory: true,
        chesed: true,
        newsletter: true,
      },
      pages: [
        {
          title: 'Accueil',
          slug: 'home',
          type: PageType.STATIC,
          content: `
            <h1>Bienvenue dans notre Communauté</h1>
            <p>Un lieu de vie, de prière et de partage.</p>
            <h2>Services Communautaires</h2>
            <ul>
              <li>Synagogue et offices quotidiens</li>
              <li>École et Talmud Torah</li>
              <li>Restaurant communautaire</li>
              <li>Centre culturel</li>
            </ul>
          `,
          isActive: true,
          status: PageStatus.PUBLISHED,
          settings: {
            showInNavbar: false,
          },
        },
      ],
      theme: {
        primaryColor: '#7c3aed',
        secondaryColor: '#8b5cf6',
      },
    },

    gmah: {
      modules: {
        donations: true,
        campaigns: true,
        events: false,
        blog: true,
        gallery: false,
        zmanim: false,
        prayers: false,
        courses: false,
        hebrewCalendar: false,
        members: true,
        library: false,
        yahrzeits: false,
        seatingChart: false,
        mikvah: false,
        kashrut: false,
        eruv: false,
        marketplace: false,
        directory: false,
        chesed: true, // Core business
        newsletter: true,
      },
      pages: [
        {
          title: 'Accueil',
          slug: 'home',
          type: PageType.STATIC,
          content: `
            <h1>Gmah - Caisse de Prêt Sans Intérêt</h1>
            <p>Entraide financière selon les principes de la Torah.</p>
            <h2>Nos Services</h2>
            <ul>
              <li>Prêts sans intérêt</li>
              <li>Aide d'urgence</li>
              <li>Accompagnement financier</li>
            </ul>
            <h2>Conditions</h2>
            <p>Prêts accordés selon les besoins et remboursables selon vos moyens.</p>
          `,
          isActive: true,
          status: PageStatus.PUBLISHED,
          settings: {
            showInNavbar: false,
          },
        },
        {
          title: 'Demander un Prêt',
          slug: 'request',
          type: PageType.STATIC,
          content: `
            <h1>Demande de Prêt</h1>
            <p>Toutes les demandes sont traitées de manière confidentielle.</p>
            <h2>Processus</h2>
            <ol>
              <li>Remplir le formulaire de demande</li>
              <li>Entretien confidentiel</li>
              <li>Décision du comité</li>
              <li>Versement du prêt</li>
            </ol>
          `,
          isActive: true,
          status: PageStatus.PUBLISHED,
          settings: {
            showInNavbar: true,
            navOrder: 1,
          },
        },
      ],
      theme: {
        primaryColor: '#dc2626',
        secondaryColor: '#ef4444',
      },
    },

    school: {
      modules: {
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        gallery: true,
        zmanim: false,
        prayers: false,
        courses: true, // Programme scolaire
        hebrewCalendar: true,
        members: true, // Parents et élèves
        library: true,
        yahrzeits: false,
        seatingChart: false,
        mikvah: false,
        kashrut: true, // Cantine cachère
        eruv: false,
        marketplace: false,
        directory: true, // Annuaire
        chesed: false,
        newsletter: true,
      },
      pages: [
        {
          title: 'Accueil',
          slug: 'home',
          type: PageType.STATIC,
          content: `
            <h1>École Juive</h1>
            <p>Excellence académique et valeurs juives.</p>
            <h2>Notre Pédagogie</h2>
            <p>Un enseignement général de qualité enrichi par l'étude de la Torah.</p>
            <h2>Inscriptions</h2>
            <p>Les inscriptions pour l'année prochaine sont ouvertes.</p>
          `,
          isActive: true,
          status: PageStatus.PUBLISHED,
          settings: {
            showInNavbar: false,
          },
        },
      ],
      theme: {
        primaryColor: '#0891b2',
        secondaryColor: '#06b6d4',
      },
    },
  };

  /**
   * Appliquer un template à un tenant
   */
  async applyTemplate(tenantId: string, templateType: TemplateType): Promise<void> {
    const template = this.templates[templateType];
    
    if (!template) {
      throw new Error(`Template ${templateType} not found`);
    }

    // 1. Configurer les modules
    await this.modulesService.updateModules(tenantId, template.modules);

    // 2. Créer les pages par défaut
    for (const page of template.pages) {
      try {
        await this.pageService.createPage(tenantId, page);
      } catch (error) {
        // Si la page existe déjà (slug duplicate), on continue
        console.log(`Page ${page.slug} already exists for tenant ${tenantId}`);
      }
    }

    // 3. Mettre à jour le thème si spécifié
    if (template.theme) {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          theme: template.theme,
        },
      });
    }
  }

  /**
   * Obtenir la liste des templates disponibles
   */
  getAvailableTemplates() {
    return [
      {
        id: 'synagogue',
        name: 'Synagogue',
        description: 'Pour les lieux de culte avec offices, cours de Torah et vie communautaire',
        modules: Object.keys(this.templates.synagogue.modules).filter(
          key => this.templates.synagogue.modules[key]
        ),
      },
      {
        id: 'association',
        name: 'Association Caritative',
        description: 'Pour les associations d\'entraide et de solidarité',
        modules: Object.keys(this.templates.association.modules).filter(
          key => this.templates.association.modules[key]
        ),
      },
      {
        id: 'community',
        name: 'Centre Communautaire',
        description: 'Centre complet avec synagogue, école, restaurant et services',
        modules: Object.keys(this.templates.community.modules).filter(
          key => this.templates.community.modules[key]
        ),
      },
      {
        id: 'gmah',
        name: 'Gmah (Caisse de Prêt)',
        description: 'Caisse de prêt sans intérêt selon la loi juive',
        modules: Object.keys(this.templates.gmah.modules).filter(
          key => this.templates.gmah.modules[key]
        ),
      },
      {
        id: 'school',
        name: 'École Juive',
        description: 'Établissement scolaire avec programme général et juif',
        modules: Object.keys(this.templates.school.modules).filter(
          key => this.templates.school.modules[key]
        ),
      },
    ];
  }

  /**
   * Initialiser un nouveau tenant avec un template
   */
  async initializeTenant(tenantId: string, templateType: TemplateType): Promise<void> {
    await this.applyTemplate(tenantId, templateType);
    
    // Marquer le tenant comme initialisé
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          initialized: true,
          template: templateType,
        },
      },
    });
  }
}
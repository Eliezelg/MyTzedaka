const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMoreAssociations() {
  try {
    // Créer plusieurs associations avec leurs tenants respectifs
    const associationsData = [
      {
        tenant: {
          name: 'Kehilat Paris',
          slug: 'kehilat-paris',
          domain: 'kehilat-paris.fr',
          theme: {},
          settings: {}
        },
        association: {
          name: 'Kehilat Paris',
          description: 'Communauté juive dynamique au cœur de Paris, proposant des services religieux, éducatifs et culturels.',
          category: 'Religion',
          location: 'Paris 11ème, France',
          city: 'Paris',
          country: 'France',
          isPublic: true,
          isVerified: true,
          totalRaised: 25000,
          donationsCount: 45,
          activeCampaignsCount: 3
        }
      },
      {
        tenant: {
          name: 'Shalom Marseille',
          slug: 'shalom-marseille',
          domain: 'shalom-marseille.fr',
          theme: {},
          settings: {}
        },
        association: {
          name: 'Shalom Marseille',
          description: 'Association d\'entraide et de solidarité pour la communauté marseillaise.',
          category: 'Social',
          location: 'Marseille, France',
          city: 'Marseille',
          country: 'France',
          isPublic: true,
          isVerified: true,
          totalRaised: 15000,
          donationsCount: 28,
          activeCampaignsCount: 2
        }
      },
      {
        tenant: {
          name: 'École Talmud Torah',
          slug: 'ecole-talmud-torah',
          domain: 'talmud-torah-lyon.fr',
          theme: {},
          settings: {}
        },
        association: {
          name: 'École Talmud Torah',
          description: 'Établissement d\'enseignement juif traditionnel offrant une éducation de qualité.',
          category: 'Education',
          location: 'Lyon, France',
          city: 'Lyon',
          country: 'France',
          isPublic: true,
          isVerified: true,
          totalRaised: 50000,
          donationsCount: 67,
          activeCampaignsCount: 1
        }
      },
      {
        tenant: {
          name: 'Secours Populaire Juif',
          slug: 'secours-populaire-juif',
          domain: 'spj-nice.fr',
          theme: {},
          settings: {}
        },
        association: {
          name: 'Secours Populaire Juif',
          description: 'Organisation d\'aide humanitaire et de secours d\'urgence.',
          category: 'Humanitaire',
          location: 'Nice, France',
          city: 'Nice',
          country: 'France',
          isPublic: true,
          isVerified: false,
          totalRaised: 8500,
          donationsCount: 19,
          activeCampaignsCount: 4
        }
      }
    ];

    for (const { tenant: tenantData, association: assocData } of associationsData) {
      // Créer ou récupérer le tenant
      const tenant = await prisma.tenant.upsert({
        where: { slug: tenantData.slug },
        update: {},
        create: tenantData
      });

      // Créer l'association pour ce tenant
      const association = await prisma.associationListing.create({
        data: {
          ...assocData,
          tenantId: tenant.id
        }
      });
      
      console.log(`✅ Association créée: ${association.name} (Tenant: ${tenant.slug})`);
    }

    console.log('\n🎉 Toutes les associations ont été créées avec succès !');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMoreAssociations();

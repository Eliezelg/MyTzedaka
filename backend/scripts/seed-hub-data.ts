import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHubData() {
  console.log('🌱 Seed des données pour le Hub Central...');

  try {
    // 1. Créer des tenants
    const tenant1 = await prisma.tenant.upsert({
      where: { slug: 'kehilat-paris' },
      update: {},
      create: {
        name: 'Kehilat Paris',
        slug: 'kehilat-paris',
        domain: 'kehilat-paris.fr',
        settings: {
          theme: 'blue',
          language: 'fr'
        }
      }
    });

    const tenant2 = await prisma.tenant.upsert({
      where: { slug: 'shalom-marseille' },
      update: {},
      create: {
        name: 'Shalom Marseille',
        slug: 'shalom-marseille',
        domain: 'shalom-marseille.fr',
        settings: {
          theme: 'green',
          language: 'fr'
        }
      }
    });

    // 2. Créer des utilisateurs
    const user1 = await prisma.user.upsert({
      where: { 
        tenantId_email: {
          tenantId: tenant1.id,
          email: 'admin@kehilat-paris.fr'
        }
      },
      update: {},
      create: {
        tenantId: tenant1.id,
        email: 'admin@kehilat-paris.fr',
        cognitoId: 'cognito-admin-paris',
        firstName: 'David',
        lastName: 'Cohen',
        role: 'ADMIN'
      }
    });

    const user2 = await prisma.user.upsert({
      where: { 
        tenantId_email: {
          tenantId: tenant2.id,
          email: 'admin@shalom-marseille.fr'
        }
      },
      update: {},
      create: {
        tenantId: tenant2.id,
        email: 'admin@shalom-marseille.fr',
        cognitoId: 'cognito-admin-marseille',
        firstName: 'Sarah',
        lastName: 'Levy',
        role: 'ADMIN'
      }
    });

    // 3. Créer des profils donateurs globaux
    const donorProfile1 = await prisma.donorProfile.upsert({
      where: { email: 'donor1@example.com' },
      update: {},
      create: {
        email: 'donor1@example.com',
        cognitoId: 'cognito-donor-1',
        firstName: 'Michel',
        lastName: 'Dupont',
        phone: '+33123456789',
        totalDonations: 5,
        totalAmount: 500.00,
        preferredCurrency: 'EUR'
      }
    });

    const donorProfile2 = await prisma.donorProfile.upsert({
      where: { email: 'donor2@example.com' },
      update: {},
      create: {
        email: 'donor2@example.com',
        cognitoId: 'cognito-donor-2',
        firstName: 'Marie',
        lastName: 'Martin',
        phone: '+33987654321',
        totalDonations: 3,
        totalAmount: 300.00,
        preferredCurrency: 'EUR'
      }
    });

    // 4. Créer des associations publiques
    const association1 = await prisma.associationListing.upsert({
      where: { tenantId: tenant1.id },
      update: {},
      create: {
        tenantId: tenant1.id,
        name: 'Kehilat Paris',
        description: 'Association juive pour l\'aide aux familles en difficulté à Paris',
        category: 'Religieuse',
        location: 'Paris, France',
        siteUrl: 'https://kehilat-paris.fr',
        isPublic: true,
        isVerified: true,
        hasSite: true,
        totalCampaigns: 1,
        activeCampaigns: 1
      }
    });

    const association2 = await prisma.associationListing.upsert({
      where: { tenantId: tenant2.id },
      update: {},
      create: {
        tenantId: tenant2.id,
        name: 'Shalom Marseille',
        description: 'Communauté juive de Marseille - Entraide et solidarité',
        category: 'Religieuse',
        location: 'Marseille, France',
        siteUrl: 'https://shalom-marseille.fr',
        isPublic: true,
        isVerified: true,
        hasSite: true,
        totalCampaigns: 1,
        activeCampaigns: 1
      }
    });

    // 5. Créer des campagnes
    const campaign1 = await prisma.campaign.upsert({
      where: { id: 'campaign-paris-1' },
      update: {},
      create: {
        id: 'campaign-paris-1',
        tenantId: tenant1.id,
        userId: user1.id,
        title: 'Aide aux familles pour Pessah',
        description: 'Collecte pour aider les familles démunies pendant les fêtes de Pessah',
        goal: 5000.00,
        currency: 'EUR',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-04-15'),
        status: 'ACTIVE',
        isActive: true
      }
    });

    const campaign2 = await prisma.campaign.upsert({
      where: { id: 'campaign-marseille-1' },
      update: {},
      create: {
        id: 'campaign-marseille-1',
        tenantId: tenant2.id,
        userId: user2.id,
        title: 'Rénovation de la synagogue',
        description: 'Collecte pour la rénovation de notre lieu de culte',
        goal: 10000.00,
        currency: 'EUR',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-06-30'),
        status: 'ACTIVE',
        isActive: true
      }
    });

    // 6. Créer des dons
    const donation1 = await prisma.donation.create({
      data: {
        id: 'donation-1',
        tenantId: tenant1.id,
        userId: user1.id,
        campaignId: campaign1.id,
        amount: 100.00,
        currency: 'EUR',
        type: 'PUNCTUAL',
        status: 'COMPLETED',
        isAnonymous: false,
        fiscalReceiptRequested: true
      }
    });

    const donation2 = await prisma.donation.create({
      data: {
        id: 'donation-2',
        tenantId: tenant2.id,
        userId: user2.id,
        campaignId: campaign2.id,
        amount: 200.00,
        currency: 'EUR',
        type: 'PUNCTUAL',
        status: 'COMPLETED',
        isAnonymous: false,
        fiscalReceiptRequested: true
      }
    });

    // 7. Créer les accès cross-tenant pour les donateurs
    await prisma.tenantDonorAccess.upsert({
      where: {
        donorProfileId_tenantId: {
          donorProfileId: donorProfile1.id,
          tenantId: tenant1.id
        }
      },
      update: {},
      create: {
        donorProfileId: donorProfile1.id,
        tenantId: tenant1.id,
        totalDonations: 1,
        totalAmount: 100.00,
        lastDonationAt: new Date(),
        isFavorite: true
      }
    });

    await prisma.tenantDonorAccess.upsert({
      where: {
        donorProfileId_tenantId: {
          donorProfileId: donorProfile2.id,
          tenantId: tenant2.id
        }
      },
      update: {},
      create: {
        donorProfileId: donorProfile2.id,
        tenantId: tenant2.id,
        totalDonations: 1,
        totalAmount: 200.00,
        lastDonationAt: new Date(),
        isFavorite: false
      }
    });

    console.log('✅ Seed terminé avec succès !');
    console.log(`📊 Créé :`);
    console.log(`  - 2 tenants`);
    console.log(`  - 2 utilisateurs`);
    console.log(`  - 2 profils donateurs`);
    console.log(`  - 2 associations publiques`);
    console.log(`  - 2 campagnes actives`);
    console.log(`  - 2 dons`);
    console.log(`  - 2 accès cross-tenant`);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedHubData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer les tenants de test
  const tenant1 = await prisma.tenant.upsert({
    where: { slug: 'kehilat-paris' },
    update: {},
    create: {
      slug: 'kehilat-paris',
      name: 'Kehilat Paris',
      domain: 'kehilat-paris.localhost',
      theme: {
        primaryColor: '#1f2937',
        secondaryColor: '#3b82f6',
        logo: '/assets/logos/kehilat-paris.png'
      },
      settings: {
        language: 'fr',
        timezone: 'Europe/Paris',
        currency: 'EUR',
        features: {
          donations: true,
          campaigns: true,
          gmah: true,
          events: true
        }
      },
      status: 'ACTIVE'
    }
  });

  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'shalom-marseille' },
    update: {},
    create: {
      slug: 'shalom-marseille',
      name: 'Communauté Shalom Marseille',
      domain: 'shalom-marseille.localhost',
      theme: {
        primaryColor: '#059669',
        secondaryColor: '#10b981',
        logo: '/assets/logos/shalom-marseille.png'
      },
      settings: {
        language: 'fr',
        timezone: 'Europe/Paris',
        currency: 'EUR',
        features: {
          donations: true,
          campaigns: true,
          gmah: false,
          events: true
        }
      },
      status: 'ACTIVE'
    }
  });

  console.log('✅ Tenants créés:', tenant1.slug, tenant2.slug);

  // Créer des utilisateurs de test
  const user1 = await prisma.user.upsert({
    where: { 
      tenantId_email: {
        tenantId: tenant1.id,
        email: 'admin@kehilat-paris.fr'
      }
    },
    update: {},
    create: {
      email: 'admin@kehilat-paris.fr',
      cognitoId: 'test-cognito-id-1',
      firstName: 'David',
      lastName: 'Cohen',
      phone: '+33123456789',
      role: 'ADMIN',
      tenantId: tenant1.id,
      permissions: {
        notifications: true,
        language: 'fr'
      }
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
      email: 'admin@shalom-marseille.fr',
      cognitoId: 'test-cognito-id-2',
      firstName: 'Sarah',
      lastName: 'Levy',
      phone: '+33123456790',
      role: 'ADMIN',
      tenantId: tenant2.id,
      permissions: {
        notifications: true,
        language: 'fr'
      }
    }
  });

  console.log('✅ Utilisateurs créés:', user1.email, user2.email);

  // Créer des campagnes de test
  const campaign1 = await prisma.campaign.upsert({
    where: { id: 'campaign-test-1' },
    update: {},
    create: {
      id: 'campaign-test-1',
      title: 'Rénovation de la synagogue',
      description: 'Campagne pour rénover notre lieu de prière et moderniser nos installations. Cette rénovation comprend la restauration des éléments historiques, l\'amélioration de l\'acoustique et l\'installation d\'équipements modernes pour nos services religieux.',
      shortDescription: 'Rénovation complète de notre synagogue',
      goal: 50000,
      raised: 12500.75,
      currency: 'EUR',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      tenantId: tenant1.id,
      userId: user1.id,
      status: 'ACTIVE',
      coverImage: '/assets/campaigns/synagogue-renovation.jpg',
      category: 'Infrastructure',
      tags: ['rénovation', 'synagogue', 'modernisation'],
      donationsCount: 45,
      donorsCount: 38,
      avgDonation: 277.79,
      isFeatured: true,
      isPublic: true,
      isVerified: true
    }
  });

  const campaign2 = await prisma.campaign.upsert({
    where: { id: 'campaign-test-2' },
    update: {},
    create: {
      id: 'campaign-test-2',
      title: 'Aide aux familles',
      description: 'Soutien aux familles dans le besoin de notre communauté. Ce programme vise à fournir une aide alimentaire, des vêtements et un soutien éducatif aux familles en difficulté.',
      shortDescription: 'Soutien aux familles en difficulté',
      goal: 25000,
      raised: 8900.25,
      currency: 'EUR',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-12-31'),
      tenantId: tenant2.id,
      userId: user2.id,
      status: 'ACTIVE',
      coverImage: '/assets/campaigns/aide-familles.jpg',
      category: 'Social',
      tags: ['aide', 'familles', 'solidarité'],
      donationsCount: 32,
      donorsCount: 29,
      avgDonation: 278.13,
      isUrgent: true,
      isPublic: true,
      isVerified: true
    }
  });

  console.log('✅ Campagnes créées:', campaign1.title, campaign2.title);

  // Créer des dons de test
  const donation1 = await prisma.donation.create({
    data: {
      amount: 100,
      currency: 'EUR',
      type: 'PUNCTUAL',
      status: 'COMPLETED',
      paymentMethod: 'CREDIT_CARD',
      userId: user1.id,
      campaignId: campaign1.id,
      tenantId: tenant1.id
    }
  });

  const donation2 = await prisma.donation.create({
    data: {
      amount: 50,
      currency: 'EUR',
      type: 'PUNCTUAL',
      status: 'COMPLETED',
      paymentMethod: 'BANK_TRANSFER',
      userId: user2.id,
      campaignId: campaign2.id,
      tenantId: tenant2.id
    }
  });

  console.log('✅ Dons créés:', donation1.amount, 'EUR et', donation2.amount, 'EUR');

  console.log('🎉 Seeding terminé avec succès !');
  console.log('');
  console.log('📋 Données de test créées :');
  console.log('- Tenants: kehilat-paris, shalom-marseille');
  console.log('- Users: admin@kehilat-paris.fr, admin@shalom-marseille.fr');
  console.log('- Campaigns: 2 campagnes actives');
  console.log('- Donations: 2 dons de test');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

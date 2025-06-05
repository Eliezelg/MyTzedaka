const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestAssociation() {
  try {
    // Créer un tenant d'abord
    const tenant = await prisma.tenant.upsert({
      where: { slug: 'test-tenant' },
      update: {},
      create: {
        name: 'Test Tenant',
        slug: 'test-tenant',
        domain: 'test.example.com',
        theme: {},
        settings: {}
      }
    });

    // Créer une association selon le schéma Prisma
    const association = await prisma.associationListing.create({
      data: {
        name: 'Association Test',
        description: 'Une association de test pour vérifier l\'API',
        category: 'Education',
        location: 'Paris, France',
        city: 'Paris',
        country: 'France',
        isPublic: true,
        isVerified: true,
        tenantId: tenant.id
      }
    });

    console.log('Association créée:', association);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAssociation();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAssociationListing() {
  try {
    // Trouver le tenant test-asso
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'test-asso' }
    });

    if (!tenant) {
      console.error('❌ Tenant test-asso non trouvé');
      return;
    }

    // Créer ou mettre à jour l'AssociationListing
    const listing = await prisma.associationListing.upsert({
      where: { tenantId: tenant.id },
      update: {
        name: 'Association Test',
        description: 'Association de test pour le développement',
        logo: 'https://via.placeholder.com/200',
        logoUrl: 'https://via.placeholder.com/200',
        coverImage: 'https://via.placeholder.com/800x400',
        category: 'EDUCATION',
        location: 'Paris, France',
        city: 'Paris',
        country: 'France',
        email: 'contact@test-asso.com',
        phone: '+33 1 23 45 67 89',
        siteUrl: 'https://test-asso.example.com',
        isPublic: true,
        isVerified: true,
        activeCampaigns: 0,
        totalCampaigns: 0,
        totalRaised: 0,
        donationsCount: 0
      },
      create: {
        tenantId: tenant.id,
        name: 'Association Test',
        description: 'Association de test pour le développement',
        logo: 'https://via.placeholder.com/200',
        logoUrl: 'https://via.placeholder.com/200',
        coverImage: 'https://via.placeholder.com/800x400',
        category: 'EDUCATION',
        location: 'Paris, France',
        city: 'Paris',
        country: 'France',
        email: 'contact@test-asso.com',
        phone: '+33 1 23 45 67 89',
        siteUrl: 'https://test-asso.example.com',
        isPublic: true,
        isVerified: true,
        activeCampaigns: 0,
        totalCampaigns: 0,
        totalRaised: 0,
        donationsCount: 0
      }
    });

    console.log('✅ AssociationListing créée/mise à jour pour test-asso');
    console.log('ID:', listing.id);
    console.log('Name:', listing.name);
    console.log('Tenant ID:', listing.tenantId);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAssociationListing();
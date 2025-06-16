const { PrismaClient } = require('@prisma/client');

async function findTenant() {
  const prisma = new PrismaClient();
  
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'siah-is' },
      select: { id: true, slug: true, name: true, stripeMode: true },
    });
    
    if (tenant) {
      console.log('Tenant trouvé:', JSON.stringify(tenant, null, 2));
    } else {
      console.log('Aucun tenant trouvé avec le slug "siah-is"');
      
      // Lister tous les tenants
      const allTenants = await prisma.tenant.findMany({
        select: { id: true, slug: true, name: true },
      });
      console.log('Tous les tenants:', JSON.stringify(allTenants, null, 2));
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findTenant();
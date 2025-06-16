const { PrismaClient } = require('@prisma/client');

async function testTenantLookup() {
  const prisma = new PrismaClient();
  
  const tenantId = '531acb63-bffe-4821-86b8-a1ad27c61904';
  
  try {
    console.log('Test 1: Recherche par ID uniquement');
    const tenant1 = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });
    console.log('Résultat findUnique:', tenant1 ? 'TROUVÉ' : 'NON TROUVÉ');
    
    console.log('\nTest 2: Recherche avec OR incluant ID');
    const tenant2 = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantId },
          { slug: tenantId },
          { domain: tenantId }
        ]
      }
    });
    console.log('Résultat findFirst avec OR:', tenant2 ? 'TROUVÉ' : 'NON TROUVÉ');
    
    if (tenant2) {
      console.log('Tenant trouvé:', {
        id: tenant2.id,
        slug: tenant2.slug,
        name: tenant2.name
      });
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTenantLookup();
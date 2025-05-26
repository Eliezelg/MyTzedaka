// Seed des données de test pour les tests e2e
import { PrismaClient, UserRole, TenantStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Création des données de test...');
  
  try {
    // Nettoyer les données existantes
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    
    // Créer les tenants de test
    const tenant1 = await prisma.tenant.create({
      data: {
        slug: 'kehilat-paris',
        name: 'Kehilat Paris',
        status: TenantStatus.ACTIVE,
        settings: {},
        theme: {},
      },
    });

    const tenant2 = await prisma.tenant.create({
      data: {
        slug: 'shalom-marseille',
        name: 'Shalom Marseille',
        status: TenantStatus.ACTIVE,
        settings: {},
        theme: {},
      },
    });

    // Créer des utilisateurs de test pour chaque tenant
    await prisma.user.create({
      data: {
        email: 'david.cohen@kehilat-paris.fr',
        cognitoId: 'test-cognito-david-cohen',
        firstName: 'David',
        lastName: 'Cohen',
        phone: '+33123456789',
        role: UserRole.ADMIN,
        tenantId: tenant1.id,
        isActive: true,
        permissions: [],
      },
    });

    await prisma.user.create({
      data: {
        email: 'sarah.levy@shalom-marseille.fr',
        cognitoId: 'test-cognito-sarah-levy',
        firstName: 'Sarah',
        lastName: 'Levy',
        phone: '+33987654321',
        role: UserRole.ADMIN,
        tenantId: tenant2.id,
        isActive: true,
        permissions: [],
      },
    });

    // Créer des utilisateurs supplémentaires pour tester l'isolation
    await prisma.user.create({
      data: {
        email: 'rachel.martin@kehilat-paris.fr',
        cognitoId: 'test-cognito-rachel-martin',
        firstName: 'Rachel',
        lastName: 'Martin',
        phone: '+33111222333',
        role: UserRole.MEMBER,
        tenantId: tenant1.id,
        isActive: true,
        permissions: [],
      },
    });

    await prisma.user.create({
      data: {
        email: 'moise.dubois@shalom-marseille.fr',
        cognitoId: 'test-cognito-moise-dubois',
        firstName: 'Moïse',
        lastName: 'Dubois',
        phone: '+33444555666',
        role: UserRole.MEMBER,
        tenantId: tenant2.id,
        isActive: true,
        permissions: [],
      },
    });

    console.log('✅ Données de test créées avec succès !');
    console.log(`- Tenant 1: ${tenant1.slug} (${tenant1.name})`);
    console.log(`- Tenant 2: ${tenant2.slug} (${tenant2.name})`);
    console.log('- 4 utilisateurs créés (2 admins + 2 membres)');
    
  } catch (error) {
    console.error('❌ Erreur lors du seed des données de test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seed si appelé directement
if (require.main === module) {
  seedTestData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedTestData };

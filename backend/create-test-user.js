const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Trouver ou créer le tenant test-asso
    let tenant = await prisma.tenant.findUnique({
      where: { slug: 'test-asso' }
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          slug: 'test-asso',
          name: 'Association Test',
          status: 'ACTIVE',
          settings: {},
          theme: {}
        }
      });
      console.log('✅ Tenant test-asso créé');
    }

    // Créer l'utilisateur admin@test.com
    const hashedPassword = await bcrypt.hash('Test123456@', 10);
    
    const user = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: 'admin@test.com'
        }
      },
      update: {
        password: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        email: 'admin@test.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Test',
        role: 'ADMIN',
        tenantId: tenant.id,
        isActive: true
      }
    });

    console.log('✅ Utilisateur admin@test.com créé/mis à jour');
    console.log('Email: admin@test.com');
    console.log('Password: Test123456@');
    console.log('Tenant:', tenant.slug);
    console.log('Role: ADMIN');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSiahUser() {
  try {
    // Trouver le tenant Siah
    const siahTenant = await prisma.tenant.findUnique({
      where: { slug: 'siah' }
    });

    if (!siahTenant) {
      console.error('❌ Tenant Siah non trouvé');
      process.exit(1);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Siah123456@', 10);

    // Créer ou mettre à jour l'utilisateur
    const user = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: siahTenant.id,
          email: 'admin@siah.com'
        }
      },
      update: {
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Siah',
        role: 'ADMIN'
      },
      create: {
        email: 'admin@siah.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Siah',
        role: 'ADMIN',
        tenantId: siahTenant.id
      }
    });

    console.log('✅ Utilisateur admin@siah.com créé/mis à jour');
    console.log('Email: admin@siah.com');
    console.log('Password: Siah123456@');
    console.log('Tenant: siah');
    console.log('Role: ADMIN');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSiahUser();
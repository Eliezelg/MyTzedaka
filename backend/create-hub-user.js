const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Créer un utilisateur global pour le hub (sans tenant)
    const hashedPassword = await bcrypt.hash('Test123456@', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@mytzedaka.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Hub',
        role: 'PLATFORM_ADMIN',
        tenantId: null, // Utilisateur global
        isActive: true
      }
    });

    console.log('✅ Utilisateur hub créé');
    console.log('Email: admin@mytzedaka.com');
    console.log('Password: Test123456@');
    console.log('Tenant: GLOBAL (null)');
    console.log('Role: PLATFORM_ADMIN');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
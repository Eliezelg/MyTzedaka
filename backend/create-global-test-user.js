const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Créer l'utilisateur global admin@test.com (sans tenantId)
    const hashedPassword = await bcrypt.hash('Test123456@', 10);
    
    // D'abord, supprimer l'utilisateur s'il existe avec un tenantId
    await prisma.user.deleteMany({
      where: {
        email: 'admin@test.com',
        tenantId: { not: null }
      }
    });
    
    // Créer ou mettre à jour l'utilisateur global
    const user = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: null,
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
        tenantId: null, // Utilisateur global
        isActive: true
      }
    });

    console.log('✅ Utilisateur global admin@test.com créé/mis à jour');
    console.log('Email: admin@test.com');
    console.log('Password: Test123456@');
    console.log('TenantId: null (global user)');
    console.log('Role: ADMIN');
    
    // Créer aussi une association avec l'utilisateur test-asso
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'test-asso' }
    });
    
    if (tenant) {
      // Lier l'utilisateur global au tenant test-asso via une table de liaison si nécessaire
      console.log('Tenant test-asso existe avec ID:', tenant.id);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Mettre à jour le rôle de l'utilisateur admin@test.com
    const user = await prisma.user.update({
      where: {
        id: '77aa4514-07a0-4074-94e0-f91ae73f191c'
      },
      data: {
        role: 'ADMIN'
      }
    });

    console.log('✅ Rôle mis à jour pour', user.email);
    console.log('Nouveau rôle:', user.role);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
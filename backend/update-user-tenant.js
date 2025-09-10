const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserTenant() {
  try {
    // Trouver le tenant test-asso
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'test-asso' }
    });

    if (!tenant) {
      console.error('Tenant test-asso not found');
      return;
    }

    // Trouver l'utilisateur d'abord
    const user = await prisma.user.findFirst({
      where: { email: 'admin@test.com' }
    });

    if (!user) {
      console.error('User admin@test.com not found');
      return;
    }

    // Mettre à jour l'utilisateur avec son ID
    const updatedUser = await prisma.user.update({
      where: { 
        id: user.id
      },
      data: {
        tenantId: tenant.id,
        role: 'ADMIN'
      },
      include: {
        tenant: true
      }
    });

    console.log('User updated successfully:');
    console.log({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      tenantId: updatedUser.tenantId,
      tenantSlug: updatedUser.tenant?.slug,
      tenantName: updatedUser.tenant?.name
    });

  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserTenant();
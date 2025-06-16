import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function createTestUser() {
  console.log('👤 Création d\'un utilisateur de test');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  
  try {
    // Créer un utilisateur de test global (sans tenantId)
    const testUser = await prisma.user.create({
      data: {
        email: 'test.stripeconnect@example.com',
        cognitoId: 'test-cognito-' + Date.now(),
        firstName: 'Test',
        lastName: 'StripeConnect',
        role: 'MEMBER',
        isActive: true,
        tenantId: null // Utilisateur global du hub
      }
    });
    
    console.log('✅ Utilisateur de test créé:', testUser);
    console.log('📌 ID de l\'utilisateur:', testUser.id);
    
    return testUser;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Exécuter la création
createTestUser()
  .then((user) => {
    console.log('\n✅ Utilisateur créé avec succès');
    console.log(`🔑 Utilisez cet ID pour le test: ${user.id}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { HubService } from '../src/hub/hub.service';

async function testStripeConnectCreation() {
  console.log('🧪 Test de création automatique de compte Stripe Connect');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const hubService = app.get(HubService);
  
  try {
    // Données de test pour créer une association
    const testAssociationData = {
      name: 'Association Test Stripe Connect',
      description: 'Association créée pour tester la création automatique de compte Stripe Connect',
      category: 'EDUCATION',
      email: 'test-stripe-connect@example.com',
      phone: '+33123456789',
      address: '123 Rue de Test',
      city: 'Paris',
      country: 'FR',
      stripeMode: 'PLATFORM', // Mode qui devrait déclencher la création automatique
      userId: 'test-user-id', // Remplacer par un ID utilisateur valide si nécessaire
      associationPurpose: 'Test de création automatique de compte Stripe Connect'
    };
    
    console.log('📋 Données de test:', testAssociationData);
    console.log('\n🚀 Création de l\'association...');
    
    const result = await hubService.createAssociation(testAssociationData);
    
    console.log('\n✅ Association créée avec succès!');
    console.log('📊 Résultat:', JSON.stringify(result, null, 2));
    
    // Vérifier si le compte Stripe Connect a été créé
    if (result.tenant && result.tenant.stripeMode === 'PLATFORM') {
      console.log('\n🎉 Mode PLATFORM confirmé pour le tenant:', result.tenant.id);
      console.log('💡 Un compte Stripe Connect devrait avoir été créé automatiquement.');
      console.log('📌 Vérifiez les logs ci-dessus pour voir le message de création Stripe Connect.');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error);
  } finally {
    await app.close();
  }
}

// Exécuter le test
testStripeConnectCreation()
  .then(() => {
    console.log('\n✅ Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
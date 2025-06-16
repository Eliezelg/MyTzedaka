import { PrismaClient } from '@prisma/client';
import { EncryptionService } from '../src/stripe/encryption.service';
import { ConfigService } from '@nestjs/config';

async function encryptExistingStripeKeys() {
  const prisma = new PrismaClient();
  const configService = new ConfigService();
  const encryptionService = new EncryptionService(configService);

  // Définir manuellement ENCRYPTION_SECRET
  process.env.ENCRYPTION_SECRET = "your-super-secret-encryption-key-for-stripe-data-encryption-minimum-32-chars";

  try {
    console.log('🔐 Début de la migration des clés Stripe...');

    // Récupérer tous les comptes Stripe avec des clés non cryptées
    const stripeAccounts = await prisma.stripeAccount.findMany({
      where: {
        stripePublishableKey: {
          not: null,
        },
      },
    });

    console.log(`Found ${stripeAccounts.length} Stripe accounts to process`);

    for (const account of stripeAccounts) {
      try {
        // Vérifier si les clés sont déjà cryptées (tentative de décryptage)
        let isAlreadyEncrypted = false;
        try {
          if (account.stripePublishableKey) {
            await encryptionService.decrypt(account.stripePublishableKey);
            isAlreadyEncrypted = true;
          }
        } catch (error) {
          // Si le décryptage échoue, la clé n'est pas cryptée
          isAlreadyEncrypted = false;
        }

        if (isAlreadyEncrypted) {
          console.log(`✅ Account ${account.id} already has encrypted keys`);
          continue;
        }

        console.log(`🔄 Encrypting keys for account ${account.id}...`);

        // Crypter les clés
        const updateData: any = {};
        
        if (account.stripePublishableKey) {
          updateData.stripePublishableKey = await encryptionService.encrypt(account.stripePublishableKey);
        }
        
        if (account.stripeSecretKey) {
          updateData.stripeSecretKey = await encryptionService.encrypt(account.stripeSecretKey);
        }

        // Mettre à jour en base
        await prisma.stripeAccount.update({
          where: { id: account.id },
          data: updateData,
        });

        console.log(`✅ Keys encrypted for account ${account.id}`);

      } catch (error) {
        console.error(`❌ Error processing account ${account.id}:`, error);
      }
    }

    console.log('🎉 Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
encryptExistingStripeKeys().catch(console.error);
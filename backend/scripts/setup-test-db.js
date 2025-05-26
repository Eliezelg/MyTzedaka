// Script pour initialiser la base de données de test
const { execSync } = require('child_process');
const { config } = require('dotenv');
const { join } = require('path');

// Charger les variables d'environnement de test
config({ path: join(__dirname, '..', '.env.test') });

async function setupTestDatabase() {
  try {
    console.log('🔧 Configuration de la base de données de test...');
    
    // Variables d'environnement
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL non définie dans .env.test');
    }
    
    console.log('📦 Génération du client Prisma...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL }
    });
    
    console.log('🗃️  Application des migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL }
    });
    
    console.log('🌱 Seed des données de test...');
    execSync('npx ts-node test/seed-test.ts', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL }
    });
    
    console.log('✅ Base de données de test prête !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration de la base de données de test:', error.message);
    
    // Essayer de créer la base de données si elle n'existe pas
    console.log('🔄 Tentative de création de la base de données...');
    try {
      execSync('npx prisma migrate dev --name init', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
      });
      
      // Retry seed after creating DB
      console.log('🌱 Seed des données de test...');
      execSync('npx ts-node test/seed-test.ts', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
      });
      
      console.log('✅ Base de données de test créée et migrée !');
    } catch (createError) {
      console.error('❌ Impossible de créer la base de données:', createError.message);
      console.log('');
      console.log('🚨 Vérifiez que PostgreSQL est en cours d\'exécution et que les credentials sont corrects dans .env.test');
      process.exit(1);
    }
  }
}

if (require.main === module) {
  setupTestDatabase();
}

module.exports = { setupTestDatabase };

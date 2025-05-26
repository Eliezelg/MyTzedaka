// Configuration Jest globale pour les tests e2e
import 'reflect-metadata';
import { config } from 'dotenv';
import { join } from 'path';

// Charger les variables d'environnement de test
config({ path: join(__dirname, '..', '.env.test') });

// Configuration des timeouts pour les tests
jest.setTimeout(30000);

// Mock des variables d'environnement pour les tests avec fallbacks
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/platform_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only-very-long-and-secure';
process.env.AWS_REGION = process.env.AWS_REGION || 'eu-west-1';
process.env.AWS_COGNITO_USER_POOL_ID = process.env.AWS_COGNITO_USER_POOL_ID || 'eu-west-1_TEST123456';
process.env.AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID || 'test123456789abcdef123456789';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379/1';

// Désactiver les logs en mode test sauf erreurs
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  // Garder console.error pour le debugging
}

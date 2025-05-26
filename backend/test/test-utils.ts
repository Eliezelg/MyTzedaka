import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as request from 'supertest';

export class TestSetup {
  public app: INestApplication;
  public prisma: PrismaService;
  public httpServer: any;

  // Données de test
  public testTenants = {
    tenant1: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      slug: 'synagogue-paris',
      name: 'Synagogue de Paris',
      domain: 'synagogue-paris.local',
      status: 'ACTIVE'
    },
    tenant2: {
      id: '550e8400-e29b-41d4-a716-446655440002', 
      slug: 'synagogue-lyon',
      name: 'Synagogue de Lyon',
      domain: 'synagogue-lyon.local',
      status: 'ACTIVE'
    }
  };

  public testUsers = {
    user1Tenant1: {
      id: '550e8400-e29b-41d4-a716-446655440101',
      tenantId: '550e8400-e29b-41d4-a716-446655440001',
      email: 'user1@synagogue-paris.local',
      cognitoId: 'cognito-user-1',
      firstName: 'David',
      lastName: 'Cohen',
      role: 'MEMBER'
    },
    user2Tenant1: {
      id: '550e8400-e29b-41d4-a716-446655440102',
      tenantId: '550e8400-e29b-41d4-a716-446655440001',
      email: 'user2@synagogue-paris.local',
      cognitoId: 'cognito-user-2',
      firstName: 'Sarah',
      lastName: 'Levy',
      role: 'ADMIN'
    },
    user1Tenant2: {
      id: '550e8400-e29b-41d4-a716-446655440201',
      tenantId: '550e8400-e29b-41d4-a716-446655440002',
      email: 'user1@synagogue-lyon.local',
      cognitoId: 'cognito-user-3',
      firstName: 'Michel',
      lastName: 'Rosenberg',
      role: 'MEMBER'
    }
  };

  async setupDatabase() {
    // Nettoyer la base de données
    await this.cleanDatabase();
    
    // Créer les tenants de test
    await this.prisma.tenant.createMany({
      data: Object.values(this.testTenants)
    });

    // Créer les utilisateurs de test
    await this.prisma.user.createMany({
      data: Object.values(this.testUsers)
    });

    // Créer des données de test supplémentaires
    await this.createTestDonations();
  }

  async cleanDatabase() {
    // Nettoyer dans l'ordre inverse des dépendances
    await this.prisma.donation.deleteMany();
    await this.prisma.campaign.deleteMany();
    await this.prisma.gmah.deleteMany();
    await this.prisma.event.deleteMany();
    await this.prisma.user.deleteMany();
    await this.prisma.tenant.deleteMany();
  }

  async createTestDonations() {
    // Donations pour tenant 1
    await this.prisma.donation.createMany({
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440301',
          tenantId: this.testTenants.tenant1.id,
          userId: this.testUsers.user1Tenant1.id,
          amount: 100.00,
          currency: 'EUR',
          type: 'PUNCTUAL',
          status: 'COMPLETED'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440302',
          tenantId: this.testTenants.tenant1.id,
          userId: this.testUsers.user2Tenant1.id,
          amount: 50.00,
          currency: 'EUR',
          type: 'RECURRING',
          status: 'COMPLETED',
          isRecurring: true,
          frequency: 'MONTHLY'
        }
      ]
    });

    // Donations pour tenant 2
    await this.prisma.donation.createMany({
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440401',
          tenantId: this.testTenants.tenant2.id,
          userId: this.testUsers.user1Tenant2.id,
          amount: 75.00,
          currency: 'EUR',
          type: 'PUNCTUAL',
          status: 'COMPLETED'
        }
      ]
    });
  }

  // Utilitaires pour les tests
  async makeRequest(method: 'get' | 'post' | 'put' | 'delete', path: string, tenantId?: string) {
    const req = request(this.httpServer)[method](path);
    
    if (tenantId) {
      req.set('X-Tenant-ID', tenantId);
    }
    
    return req;
  }

  async authenticateUser(userId: string) {
    // Mock authentication pour les tests
    const user = Object.values(this.testUsers).find(u => u.id === userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Générer un token JWT de test
    const token = 'test-jwt-token-' + userId;
    return { token, user };
  }

  async waitForAsync(ms: number = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Configuration globale pour les tests
beforeAll(async () => {
  // Configuration de l'environnement de test
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
});

afterAll(async () => {
  // Cleanup global
  await new Promise(resolve => setTimeout(resolve, 500));
});

export { TestSetup };

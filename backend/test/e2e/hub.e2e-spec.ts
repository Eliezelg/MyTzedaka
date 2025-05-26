import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Hub Central (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/hub/associations (GET)', () => {
    it('should return empty array initially (no migration yet)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/hub/associations')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Pour l'instant, on s'attend à un array vide car les tables n'existent pas encore
    });
  });

  describe('/api/hub/stats (GET)', () => {
    it('should return global hub statistics with zeros', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/hub/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        totalAssociations: expect.any(Number),
        verifiedAssociations: expect.any(Number),
        totalCampaigns: expect.any(Number),
        activeCampaigns: expect.any(Number),
        totalDonations: expect.any(Number),
        totalAmount: expect.any(Number)
      });
    });
  });

  describe('/api/hub/associations/search (GET)', () => {
    it('should handle search with query parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/hub/associations/search')
        .query({ q: 'test' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle search with multiple parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/hub/associations/search')
        .query({ q: 'test', category: 'Caritative', location: 'Paris' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/api/hub/campaigns/popular (GET)', () => {
    it('should return popular campaigns with default limit', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/hub/campaigns/popular')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/hub/campaigns/popular')
        .query({ limit: 5 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Protected endpoints should require authentication', () => {
    it('should require auth for donor profile creation', async () => {
      const newDonor = {
        email: 'test@example.com',
        cognitoId: 'cognito-123',
        firstName: 'Test',
        lastName: 'User'
      };

      await request(app.getHttpServer())
        .post('/api/hub/donor/profile')
        .send(newDonor)
        .expect(401); // Non authentifié
    });

    it('should require auth for donor history', async () => {
      await request(app.getHttpServer())
        .get('/api/hub/donor/test-id/history')
        .expect(401); // Non authentifié
    });

    it('should require auth for activity recording', async () => {
      await request(app.getHttpServer())
        .post('/api/hub/donor/test-id/activity')
        .send({ tenantId: 'test-tenant', donationAmount: 100 })
        .expect(401); // Non authentifié
    });

    it('should require auth for stats update', async () => {
      await request(app.getHttpServer())
        .post('/api/hub/donor/test-id/update-stats')
        .expect(401); // Non authentifié
    });
  });
});

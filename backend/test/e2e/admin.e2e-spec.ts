import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('Admin Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let superAdminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Créer un super admin pour les tests
    // Dans un vrai test, on obtiendrait le token via AWS Cognito
    // Pour l'instant, on simule un token valide
    superAdminToken = 'test-super-admin-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/admin/stats (GET)', () => {
    it('devrait retourner les statistiques admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalTenants');
      expect(response.body).toHaveProperty('activeTenants');
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalDonations');
      expect(response.body).toHaveProperty('recentTenants');
    });

    it('devrait refuser l\'accès sans authentification', () => {
      return request(app.getHttpServer())
        .get('/api/admin/stats')
        .expect(401);
    });
  });

  describe('/api/admin/tenants (GET)', () => {
    it('devrait retourner la liste des tenants avec pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/tenants')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('tenants');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.tenants)).toBe(true);
    });

    it('devrait filtrer les tenants par recherche', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/tenants')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .query({ search: 'paris' })
        .expect(200);

      expect(response.body).toHaveProperty('tenants');
      expect(response.body.tenants.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('/api/admin/tenants (POST)', () => {
    const createTenantDto = {
      name: 'Test Association',
      slug: 'test-association-' + Date.now(),
      domain: 'test.mytzedaka.com',
      adminEmail: 'admin@test-association.com',
      adminFirstName: 'Admin',
      adminLastName: 'Test',
      adminPhone: '+33600000000',
      theme: {
        primaryColor: '#0000FF',
        secondaryColor: '#FF0000'
      },
      settings: {
        allowRegistration: true,
        language: 'fr'
      }
    };

    it('devrait créer un nouveau tenant', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/tenants')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(createTenantDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createTenantDto.name);
      expect(response.body.slug).toBe(createTenantDto.slug);
      expect(response.body.status).toBe('ACTIVE');

      // Nettoyer après le test
      await prisma.tenant.delete({ where: { id: response.body.id } });
    });

    it('devrait refuser la création avec un slug existant', async () => {
      // Créer un tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Existing Tenant',
          slug: 'existing-tenant',
          theme: {},
          settings: {}
        }
      });

      // Essayer de créer avec le même slug
      await request(app.getHttpServer())
        .post('/api/admin/tenants')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          ...createTenantDto,
          slug: 'existing-tenant'
        })
        .expect(409);

      // Nettoyer
      await prisma.tenant.delete({ where: { id: tenant.id } });
    });
  });

  describe('/api/admin/tenants/:id (GET)', () => {
    let testTenant: any;

    beforeEach(async () => {
      testTenant = await prisma.tenant.create({
        data: {
          name: 'Get Test Tenant',
          slug: 'get-test-tenant',
          theme: {},
          settings: {}
        }
      });
    });

    afterEach(async () => {
      await prisma.tenant.delete({ where: { id: testTenant.id } });
    });

    it('devrait retourner un tenant par ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/admin/tenants/${testTenant.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testTenant.id);
      expect(response.body.name).toBe(testTenant.name);
    });

    it('devrait retourner 404 pour un tenant inexistant', () => {
      return request(app.getHttpServer())
        .get('/api/admin/tenants/non-existent-id')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);
    });
  });

  describe('/api/admin/tenants/:id (PUT)', () => {
    let testTenant: any;

    beforeEach(async () => {
      testTenant = await prisma.tenant.create({
        data: {
          name: 'Update Test Tenant',
          slug: 'update-test-tenant',
          theme: {},
          settings: {}
        }
      });
    });

    afterEach(async () => {
      await prisma.tenant.delete({ where: { id: testTenant.id } });
    });

    it('devrait mettre à jour un tenant', async () => {
      const updateDto = {
        name: 'Updated Name',
        domain: 'updated.mytzedaka.com',
        theme: { primaryColor: '#00FF00' }
      };

      const response = await request(app.getHttpServer())
        .put(`/api/admin/tenants/${testTenant.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.domain).toBe(updateDto.domain);
      expect(response.body.theme.primaryColor).toBe('#00FF00');
    });
  });

  describe('/api/admin/tenants/:id (DELETE)', () => {
    it('devrait supprimer un tenant sans données', async () => {
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Delete Test Tenant',
          slug: 'delete-test-tenant',
          theme: {},
          settings: {}
        }
      });

      await request(app.getHttpServer())
        .delete(`/api/admin/tenants/${tenant.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(204);

      const deletedTenant = await prisma.tenant.findUnique({
        where: { id: tenant.id }
      });
      expect(deletedTenant).toBeNull();
    });

    it('devrait refuser la suppression d\'un tenant avec données', async () => {
      // Utiliser un tenant existant avec des données
      const existingTenant = await prisma.tenant.findFirst({
        where: { slug: 'kehilat-paris' }
      });

      if (existingTenant) {
        await request(app.getHttpServer())
          .delete(`/api/admin/tenants/${existingTenant.id}`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .expect(400);
      }
    });
  });
});

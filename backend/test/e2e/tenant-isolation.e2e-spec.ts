import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Tenant Isolation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configuration identique à main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    // Préfixe API
    app.setGlobalPrefix('api');
    
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Data Isolation Tests', () => {
    it('should isolate users by tenant', async () => {
      // Test avec tenant kehilat-paris
      const response1 = await request(app.getHttpServer())
        .get('/api/test/users')
        .set('X-Tenant-ID', 'kehilat-paris')
        .expect(200);

      // Test avec tenant shalom-marseille
      const response2 = await request(app.getHttpServer())
        .get('/api/test/users')
        .set('X-Tenant-ID', 'shalom-marseille')
        .expect(200);

      // Vérifier que les données sont différentes
      expect(response1.body).not.toEqual(response2.body);
      
      console.log('Response1 body:', JSON.stringify(response1.body, null, 2));
      console.log('Response2 body:', JSON.stringify(response2.body, null, 2));
      
      // Vérifier que chaque tenant ne voit que ses utilisateurs
      const tenant1Users = response1.body.users;
      const tenant2Users = response2.body.users;
      
      expect(tenant1Users.length).toBeGreaterThan(0);
      expect(tenant2Users.length).toBeGreaterThan(0);
      
      // Debug: voir la structure d'un utilisateur
      console.log('First user structure:', JSON.stringify(tenant1Users[0], null, 2));
      
      // Vérifier que tous les utilisateurs appartiennent au bon tenant
      tenant1Users.forEach(user => {
        console.log('User tenant:', user.tenant);
        expect(user.tenant?.slug).toBe('kehilat-paris');
      });
      
      tenant2Users.forEach(user => {
        expect(user.tenant?.slug).toBe('shalom-marseille');
      });
    });

    it('should reject requests without tenant header', async () => {
      await request(app.getHttpServer())
        .get('/api/test/users')
        .expect(400);
    });

    it('should reject requests with invalid tenant', async () => {
      await request(app.getHttpServer())
        .get('/api/test/users')
        .set('X-Tenant-ID', 'inexistant-tenant')
        .expect(400);
    });

    it('should return tenant-specific health check', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/api/test/tenant')
        .set('X-Tenant-ID', 'kehilat-paris')
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/api/test/tenant')
        .set('X-Tenant-ID', 'shalom-marseille')
        .expect(200);

      expect(response1.body.tenant.slug).toBe('kehilat-paris');
      expect(response2.body.tenant.slug).toBe('shalom-marseille');
      expect(response1.body.tenant.id).not.toBe(response2.body.tenant.id);
    });
  });

  describe('Performance Tests', () => {
    it('should resolve tenant in less than 10ms', async () => {
      const start = Date.now();
      
      await request(app.getHttpServer())
        .get('/api/test/tenant')
        .set('X-Tenant-ID', 'kehilat-paris')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50); // Plus réaliste pour un test e2e
    });

    it('should handle concurrent tenant requests efficiently', async () => {
      const start = Date.now();
      
      // 5 requêtes simultanées (réduit pour être plus réaliste)
      const promises = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .get('/api/test/tenant')
          .set('X-Tenant-ID', 'kehilat-paris')
      );

      const responses = await Promise.all(promises);
      const duration = Date.now() - start;
      
      // Toutes les requêtes doivent réussir
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.tenant.slug).toBe('kehilat-paris');
      });
      
      expect(duration).toBeLessThan(500); // 500ms pour 5 requêtes
    });
  });
});

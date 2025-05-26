import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Registration', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@kehilat-paris.fr',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '+33123456789',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .set('X-Tenant-ID', 'kehilat-paris')
        .send(registerDto)
        .expect(201);

      expect(response.body.message).toContain('succès');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(registerDto.email);
    });

    it('should reject registration without tenant', async () => {
      const registerDto = {
        email: 'test2@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should reject duplicate email in same tenant', async () => {
      const registerDto = {
        email: 'test@kehilat-paris.fr', // Email déjà utilisé
        password: 'TestPassword123!',
        firstName: 'Another',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .set('X-Tenant-ID', 'kehilat-paris')
        .send(registerDto)
        .expect(400);
    });

    it('should allow same email in different tenant', async () => {
      const registerDto = {
        email: 'test@kehilat-paris.fr', // Même email mais tenant différent
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .set('X-Tenant-ID', 'shalom-marseille')
        .send(registerDto)
        .expect(201);

      expect(response.body.user.email).toBe(registerDto.email);
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      // Utiliser les données de seed existantes
      const loginDto = {
        email: 'david.cohen@kehilat-paris.fr',
        password: 'MotDePasseTest123!',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('X-Tenant-ID', 'kehilat-paris')
        .send(loginDto)
        .expect(200);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.tenant).toBeDefined();
      expect(response.body.user.email).toBe(loginDto.email);
      expect(response.body.tenant.slug).toBe('kehilat-paris');

      // Sauvegarder le token pour les tests suivants
      accessToken = response.body.access_token;
    });

    it('should reject login with wrong password', async () => {
      const loginDto = {
        email: 'david.cohen@kehilat-paris.fr',
        password: 'WrongPassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .set('X-Tenant-ID', 'kehilat-paris')
        .send(loginDto)
        .expect(401);
    });

    it('should reject login without tenant', async () => {
      const loginDto = {
        email: 'david.cohen@kehilat-paris.fr',
        password: 'MotDePasseTest123!',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('should reject cross-tenant login', async () => {
      const loginDto = {
        email: 'david.cohen@kehilat-paris.fr', // Utilisateur du tenant kehilat-paris
        password: 'MotDePasseTest123!',
      };

      // Essayer de se connecter depuis le tenant shalom-marseille
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('X-Tenant-ID', 'shalom-marseille')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    it('should access profile with valid token', async () => {
      if (!accessToken) {
        // Login d'abord si pas de token
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .set('X-Tenant-ID', 'kehilat-paris')
          .send({
            email: 'david.cohen@kehilat-paris.fr',
            password: 'MotDePasseTest123!',
          });
        accessToken = loginResponse.body.access_token;
      }

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('X-Tenant-ID', 'kehilat-paris')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe('david.cohen@kehilat-paris.fr');
      expect(response.body.role).toBeDefined();
    });

    it('should reject access without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('X-Tenant-ID', 'kehilat-paris')
        .expect(401);
    });

    it('should reject access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('X-Tenant-ID', 'kehilat-paris')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject access with wrong tenant in token', async () => {
      // Ce test nécessiterait un token avec un tenant différent
      // Pour l'instant, on teste juste l'absence de tenant
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });

  describe('Password Reset Flow', () => {
    it('should initiate password reset', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ email: 'david.cohen@kehilat-paris.fr' })
        .expect(200);

      expect(response.body.message).toContain('Code de réinitialisation');
    });

    it('should reject password reset for non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ email: 'inexistant@example.com' })
        .expect(400);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('X-Tenant-ID', 'kehilat-paris')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toContain('Déconnexion réussie');
    });
  });
});

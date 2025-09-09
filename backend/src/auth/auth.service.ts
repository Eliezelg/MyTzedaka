import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { 
  LoginDto, 
  RegisterDto, 
  RefreshTokenDto, 
  ChangePasswordDto,
  AuthResponseDto,
  TokenPayload
} from './dto/auth.dto';
import { User, RefreshToken } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async findUserTenants(email: string): Promise<any> {
    const users = await this.prisma.user.findMany({
      where: { email },
      include: {
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
            domain: true
          }
        }
      }
    });

    return {
      email,
      tenants: users.map(user => user.tenant).filter(tenant => tenant !== null)
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: registerDto.email,
        tenantId: registerDto.tenantId || null
      }
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        tenantId: registerDto.tenantId,
        role: 'MEMBER', // Rôle par défaut
        isActive: true,
      }
    });

    // Générer les tokens
    return this.generateAuthResponse(user);
  }

  async registerHub(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Pour les utilisateurs du hub, on force tenantId à null
    return this.register({ ...registerDto, tenantId: null });
  }

  // Méthode supprimée - remplacée par la version complète ci-dessous

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Trouver l'utilisateur avec son tenant
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDto.email
      },
      include: {
        tenant: true
      }
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      throw new ForbiddenException('Votre compte a été désactivé');
    }

    // Générer les tokens avec le tenant inclus
    const response = await this.generateAuthResponse(user, loginDto.rememberMe);

    // Mettre à jour lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return response;
  }

  async registerWithAssociation(userDto: RegisterDto, associationData: any): Promise<any> {
    console.log('🚀 registerWithAssociation appelée avec:', { userDto, associationData });
    
    // Vérifier que l'email n'existe pas déjà
    const existingUser = await this.prisma.user.findFirst({
      where: { email: userDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    // Vérifier que le slug de l'association n'existe pas
    const existingTenant = await this.prisma.tenant.findFirst({
      where: { slug: associationData.slug }
    });

    if (existingTenant) {
      throw new ConflictException('Une association existe déjà avec ce slug');
    }

    console.log('✅ Vérifications passées, début de la transaction');
    
    // Transaction pour créer le tenant, l'utilisateur et l'AssociationListing
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. Créer le tenant
      const tenant = await prisma.tenant.create({
        data: {
          slug: associationData.slug,
          name: associationData.name,
          domain: associationData.domain || `${associationData.slug}.mytzedaka.com`,
          status: 'ACTIVE',
          stripeMode: 'PLATFORM',
          theme: associationData.theme || {
            style: 'modern',
            primaryColor: '#1e40af',
            secondaryColor: '#3b82f6'
          },
          settings: {
            ...associationData.settings,
            plan: associationData.settings?.plan || 'PREMIUM',
            currency: associationData.settings?.currency || 'EUR',
            language: associationData.settings?.language || 'fr',
            timezone: associationData.settings?.timezone || 'Europe/Paris',
            features: {
              gmah: true,
              events: true,
              campaigns: true,
              donations: true,
              customSite: true
            }
          }
        }
      });

      console.log('✅ Tenant créé:', tenant.id);
      
      // 2. Créer l'utilisateur admin lié au tenant
      const hashedPassword = await bcrypt.hash(userDto.password, 10);
      const user = await prisma.user.create({
        data: {
          email: userDto.email,
          password: hashedPassword,
          firstName: userDto.firstName,
          lastName: userDto.lastName,
          phone: userDto.phone,
          role: 'ADMIN', // L'utilisateur créateur est admin de son association
          tenantId: tenant.id,
          isActive: true
        }
      });
      
      console.log('✅ User créé avec tenantId:', user.tenantId);

      // 3. Créer l'AssociationListing pour le hub
      const associationListing = await prisma.associationListing.create({
        data: {
          tenantId: tenant.id,
          name: associationData.name,
          description: associationData.description || `Association ${associationData.name}`,
          category: associationData.type || 'CHARITY',
          location: `${associationData.city || 'Paris'}, ${associationData.country || 'France'}`,
          city: associationData.city || 'Paris',
          country: associationData.country || 'France',
          isPublic: true,
          isVerified: false, // Par défaut non vérifié, peut être vérifié par un admin plateforme
          totalCampaigns: 0,
          activeCampaigns: 0
        }
      });
      
      console.log('✅ AssociationListing créé:', associationListing.id);

      // 4. Créer les modules par défaut pour le tenant
      await prisma.tenantModules.create({
        data: {
          tenantId: tenant.id,
          donations: true,
          campaigns: true,
          events: true,
          zmanim: true,
          prayers: true,
          members: true,
          blog: true,
          gallery: false
        }
      });

      // 5. Mettre à jour le tenant avec l'ID du créateur
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          settings: {
            ...tenant.settings as any,
            createdByUserId: user.id
          }
        }
      });

      return { user, tenant };
    });

    // Générer les tokens et retourner la réponse avec le tenant
    const response = await this.generateAuthResponse(result.user);
    
    // Ajouter les informations du tenant à la réponse
    return {
      ...response,
      tenant: {
        id: result.tenant.id,
        slug: result.tenant.slug,
        name: result.tenant.name,
        domain: result.tenant.domain
      }
    };
  }

  async loginHub(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Pour les utilisateurs du hub, on utilise la méthode login standard
    // mais on vérifie que l'utilisateur n'a pas de tenantId (utilisateur global)
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDto.email,
        tenantId: null // S'assurer que c'est un utilisateur global du hub
      }
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      throw new ForbiddenException('Votre compte a été désactivé');
    }

    // Générer les tokens
    const response = await this.generateAuthResponse(user, loginDto.rememberMe);

    // Mettre à jour lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return response;
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      // Vérifier le refresh token dans la base de données
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshTokenDto.refreshToken },
        include: { user: true }
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      // Vérifier si le token a été révoqué
      if (storedToken.revokedAt) {
        throw new UnauthorizedException('Refresh token a été révoqué');
      }

      // Vérifier l'expiration
      if (storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expiré');
      }

      // Vérifier le JWT
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET')
      });

      // Révoquer l'ancien refresh token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { 
          revokedAt: new Date(),
          lastUsedAt: new Date()
        }
      });

      // Générer de nouveaux tokens
      return this.generateAuthResponse(storedToken.user);
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Ancien mot de passe incorrect');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Mettre à jour le mot de passe
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Révoquer tous les refresh tokens de l'utilisateur
    await this.prisma.refreshToken.updateMany({
      where: { 
        userId,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });
  }

  async logout(refreshToken: string): Promise<void> {
    // Révoquer le refresh token
    await this.prisma.refreshToken.updateMany({
      where: { 
        token: refreshToken,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });
  }

  async logoutAll(userId: string): Promise<void> {
    // Révoquer tous les refresh tokens de l'utilisateur
    await this.prisma.refreshToken.updateMany({
      where: { 
        userId,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true
      }
    });
  }

  private async generateAuthResponse(user: User & { tenant?: any }, rememberMe = false): Promise<AuthResponseDto> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    };

    // Durée d'expiration selon rememberMe
    const accessTokenExpiry = '15m';
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';

    // Générer les tokens
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: accessTokenExpiry
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: refreshTokenExpiry
    });

    // Calculer l'expiration du refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

    // Sauvegarder le refresh token dans la base de données
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
        deviceInfo: 'web', // À améliorer avec les vraies infos de l'appareil
        ipAddress: '127.0.0.1' // À améliorer avec la vraie IP
      }
    });

    // Nettoyer les anciens refresh tokens expirés
    await this.cleanupExpiredTokens(user.id);

    const response: AuthResponseDto = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 14400 // 4 heures en secondes
      }
    };

    // Ajouter le tenant si disponible
    if (user.tenant) {
      (response as any).tenant = {
        id: user.tenant.id,
        slug: user.tenant.slug,
        name: user.tenant.name,
        domain: user.tenant.domain
      };
    }

    return response;
  }

  private async cleanupExpiredTokens(userId: string): Promise<void> {
    // Supprimer les tokens expirés ou révoqués depuis plus de 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { lt: thirtyDaysAgo } }
        ]
      }
    });

    // Limiter à 5 refresh tokens actifs par utilisateur
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' },
      skip: 5
    });

    if (activeTokens.length > 0) {
      await this.prisma.refreshToken.updateMany({
        where: {
          id: { in: activeTokens.map(t => t.id) }
        },
        data: { revokedAt: new Date() }
      });
    }
  }
}
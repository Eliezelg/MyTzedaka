import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { 
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
  MessageActionType,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { PrismaService } from '../prisma/prisma.service';
import { getCurrentTenant } from '../tenant/tenant.context';
import { LoginDto, RegisterDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'eu-west-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const tenant = getCurrentTenant();
    
    if (!tenant) {
      throw new UnauthorizedException('Tenant non identifié');
    }

    try {
      // Authentification avec Cognito
      const authCommand = new AdminInitiateAuthCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        ClientId: process.env.AWS_COGNITO_CLIENT_ID,
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const authResult = await this.cognitoClient.send(authCommand);
      
      if (!authResult.AuthenticationResult?.AccessToken) {
        throw new UnauthorizedException('Échec de l\'authentification');
      }

      // Récupérer l'utilisateur de la base de données
      const user = await this.prisma.user.findFirst({
        where: {
          email,
          tenantId: tenant.id,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          cognitoId: true,
          tenantId: true,
          permissions: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé dans ce tenant');
      }

      // Générer JWT avec informations tenant
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
        cognitoId: user.cognitoId,
      };

      const accessToken = this.jwtService.sign(payload);

      // Mettre à jour la dernière connexion
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return {
        access_token: accessToken,
        cognito_token: authResult.AuthenticationResult.AccessToken,
        refresh_token: authResult.AuthenticationResult.RefreshToken,
        expires_in: authResult.AuthenticationResult.ExpiresIn,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions,
        },
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Échec de l\'authentification: ' + error.message);
    }
  }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone } = registerDto;
    const tenant = getCurrentTenant();
    
    if (!tenant) {
      throw new BadRequestException('Tenant non identifié');
    }

    try {
      // Vérifier si l'utilisateur existe déjà dans ce tenant
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email,
          tenantId: tenant.id,
        },
      });

      if (existingUser) {
        throw new BadRequestException('Un utilisateur avec cet email existe déjà');
      }

      // Créer l'utilisateur dans Cognito
      const createUserCommand = new AdminCreateUserCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'given_name', Value: firstName },
          { Name: 'family_name', Value: lastName },
          { Name: 'phone_number', Value: phone || '' },
          { Name: 'custom:tenant_id', Value: tenant.id },
        ],
        TemporaryPassword: password,
        MessageAction: MessageActionType.SUPPRESS, // Pas d'email de bienvenue
      });

      const cognitoUser = await this.cognitoClient.send(createUserCommand);

      // Définir le mot de passe permanent
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: email,
        Password: password,
        Permanent: true,
      });

      await this.cognitoClient.send(setPasswordCommand);

      // Créer l'utilisateur dans la base de données
      const user = await this.prisma.user.create({
        data: {
          email,
          cognitoId: cognitoUser.User!.Username!,
          firstName,
          lastName,
          phone: phone || null,
          role: 'MEMBER',
          tenantId: tenant.id,
          permissions: {},
          isActive: true,
        },
      });

      return {
        message: 'Utilisateur créé avec succès',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la création: ' + error.message);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email } = resetPasswordDto;
    
    try {
      const command = new ForgotPasswordCommand({
        ClientId: process.env.AWS_COGNITO_CLIENT_ID,
        Username: email,
      });

      await this.cognitoClient.send(command);

      return {
        message: 'Code de réinitialisation envoyé par email',
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la réinitialisation: ' + error.message);
    }
  }

  async confirmResetPassword(email: string, code: string, newPassword: string) {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: process.env.AWS_COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      });

      await this.cognitoClient.send(command);

      return {
        message: 'Mot de passe réinitialisé avec succès',
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la confirmation: ' + error.message);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const command = new AdminInitiateAuthCommand({
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        ClientId: process.env.AWS_COGNITO_CLIENT_ID,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      });

      const result = await this.cognitoClient.send(command);

      return {
        access_token: result.AuthenticationResult?.AccessToken,
        expires_in: result.AuthenticationResult?.ExpiresIn,
      };
    } catch (error) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }
  }

  async validateUser(payload: any) {
    const tenant = getCurrentTenant();
    
    if (!tenant) {
      throw new UnauthorizedException('Tenant non identifié');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        tenantId: tenant.id,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }

    return user;
  }

  async getUserProfile(userId: string) {
    const tenant = getCurrentTenant();
    
    if (!tenant) {
      throw new UnauthorizedException('Tenant non identifié');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: tenant.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        permissions: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return user;
  }
}

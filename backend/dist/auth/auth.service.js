"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_context_1 = require("../tenant/tenant.context");
let AuthService = class AuthService {
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: process.env.AWS_REGION || 'eu-central-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const tenant = (0, tenant_context_1.getCurrentTenant)();
        if (!tenant) {
            throw new common_1.UnauthorizedException('Tenant non identifié');
        }
        try {
            const authCommand = new client_cognito_identity_provider_1.AdminInitiateAuthCommand({
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
                throw new common_1.UnauthorizedException('Échec de l\'authentification');
            }
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
                throw new common_1.UnauthorizedException('Utilisateur non trouvé dans ce tenant');
            }
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                tenantId: tenant.id,
                cognitoId: user.cognitoId,
            };
            const accessToken = this.jwtService.sign(payload);
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
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Échec de l\'authentification: ' + error.message);
        }
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, phone } = registerDto;
        const tenant = (0, tenant_context_1.getCurrentTenant)();
        if (!tenant) {
            throw new common_1.BadRequestException('Tenant non identifié');
        }
        try {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    email,
                    tenantId: tenant.id,
                },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Un utilisateur avec cet email existe déjà');
            }
            const createUserCommand = new client_cognito_identity_provider_1.AdminCreateUserCommand({
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
                MessageAction: client_cognito_identity_provider_1.MessageActionType.SUPPRESS,
            });
            const cognitoUser = await this.cognitoClient.send(createUserCommand);
            const setPasswordCommand = new client_cognito_identity_provider_1.AdminSetUserPasswordCommand({
                UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
                Username: email,
                Password: password,
                Permanent: true,
            });
            await this.cognitoClient.send(setPasswordCommand);
            const user = await this.prisma.user.create({
                data: {
                    email,
                    cognitoId: cognitoUser.User.Username,
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
        }
        catch (error) {
            throw new common_1.BadRequestException('Erreur lors de la création: ' + error.message);
        }
    }
    async registerHub(registerDto) {
        const { email, password, firstName, lastName, phone } = registerDto;
        try {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    email,
                    tenantId: null,
                },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Un utilisateur avec cet email existe déjà');
            }
            const user = await this.prisma.user.create({
                data: {
                    email,
                    cognitoId: `temp_${Date.now()}`,
                    firstName,
                    lastName,
                    phone: phone || null,
                    role: 'MEMBER',
                    tenantId: null,
                    permissions: [],
                    isActive: true,
                },
            });
            return {
                message: 'Utilisateur créé avec succès sur la plateforme (version test)',
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Erreur lors de la création: ' + error.message);
        }
    }
    async resetPassword(resetPasswordDto) {
        const { email } = resetPasswordDto;
        try {
            const command = new client_cognito_identity_provider_1.ForgotPasswordCommand({
                ClientId: process.env.AWS_COGNITO_CLIENT_ID,
                Username: email,
            });
            await this.cognitoClient.send(command);
            return {
                message: 'Code de réinitialisation envoyé par email',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Erreur lors de la réinitialisation: ' + error.message);
        }
    }
    async confirmResetPassword(email, code, newPassword) {
        try {
            const command = new client_cognito_identity_provider_1.ConfirmForgotPasswordCommand({
                ClientId: process.env.AWS_COGNITO_CLIENT_ID,
                Username: email,
                ConfirmationCode: code,
                Password: newPassword,
            });
            await this.cognitoClient.send(command);
            return {
                message: 'Mot de passe réinitialisé avec succès',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Erreur lors de la confirmation: ' + error.message);
        }
    }
    async refreshToken(refreshToken) {
        try {
            const command = new client_cognito_identity_provider_1.AdminInitiateAuthCommand({
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
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token de rafraîchissement invalide');
        }
    }
    async validateUser(payload) {
        const tenant = (0, tenant_context_1.getCurrentTenant)();
        if (!tenant) {
            throw new common_1.UnauthorizedException('Tenant non identifié');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                id: payload.sub,
                tenantId: tenant.id,
                isActive: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Utilisateur non trouvé ou inactif');
        }
        return user;
    }
    async validateHubUser(payload) {
        const user = await this.prisma.user.findFirst({
            where: {
                id: payload.sub,
                isActive: true,
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
            throw new common_1.UnauthorizedException('Utilisateur non trouvé ou inactif');
        }
        return user;
    }
    async getUserProfile(userId) {
        const tenant = (0, tenant_context_1.getCurrentTenant)();
        if (!tenant) {
            throw new common_1.UnauthorizedException('Tenant non identifié');
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
            throw new common_1.UnauthorizedException('Utilisateur non trouvé');
        }
        return user;
    }
    async loginHub(loginDto) {
        const { email, password } = loginDto;
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    email,
                    tenantId: null,
                    isActive: true,
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
                throw new common_1.UnauthorizedException('Utilisateur non trouvé ou inactif');
            }
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                tenantId: null,
                cognitoId: user.cognitoId,
            };
            const accessToken = this.jwtService.sign(payload);
            const refreshToken = this.jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException('Erreur lors de la connexion: ' + error.message);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
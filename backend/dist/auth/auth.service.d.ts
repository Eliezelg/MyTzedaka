import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private jwtService;
    private prisma;
    private cognitoClient;
    constructor(jwtService: JwtService, prisma: PrismaService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        cognito_token: string;
        refresh_token: string;
        expires_in: number;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
        tenant: {
            id: string;
            slug: string;
            name: string;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    confirmResetPassword(email: string, code: string, newPassword: string): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
        expires_in: number;
    }>;
    validateUser(payload: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        tenantId: string;
        cognitoId: string;
        role: import(".prisma/client").$Enums.UserRole;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        lastLoginAt: Date | null;
    }>;
    getUserProfile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        lastLoginAt: Date;
    }>;
}

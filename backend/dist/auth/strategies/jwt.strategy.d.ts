import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(payload: any): Promise<{
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
}
export {};

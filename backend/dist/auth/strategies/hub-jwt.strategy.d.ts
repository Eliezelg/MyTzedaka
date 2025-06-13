import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
declare const HubJwtStrategy_base: new (...args: any[]) => Strategy;
export declare class HubJwtStrategy extends HubJwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        tenantId: string;
        cognitoId: string;
        role: import(".prisma/client").$Enums.UserRole;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
export {};

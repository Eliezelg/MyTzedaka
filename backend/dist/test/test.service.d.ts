import { PrismaService } from '../prisma/prisma.service';
export declare class TestService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUsersByTenant(tenantId: string): Promise<{
        users: {
            tenant: {
                name: string;
                id: string;
                slug: string;
                domain: string | null;
                status: import(".prisma/client").$Enums.TenantStatus;
                theme: import("@prisma/client/runtime/library").JsonValue;
                settings: import("@prisma/client/runtime/library").JsonValue;
                stripeMode: import(".prisma/client").$Enums.StripeMode;
                createdAt: Date;
                updatedAt: Date;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            tenantId: string | null;
            cognitoId: string;
            role: import(".prisma/client").$Enums.UserRole;
            permissions: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            lastLoginAt: Date | null;
        }[];
        tenant: {
            name: string;
            id: string;
            slug: string;
            domain: string | null;
            status: import(".prisma/client").$Enums.TenantStatus;
            theme: import("@prisma/client/runtime/library").JsonValue;
            settings: import("@prisma/client/runtime/library").JsonValue;
            stripeMode: import(".prisma/client").$Enums.StripeMode;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getTenantById(tenantId: string): Promise<{
        name: string;
        id: string;
        slug: string;
        status: import(".prisma/client").$Enums.TenantStatus;
        createdAt: Date;
    }>;
    getTenantBySlug(slug: string): Promise<{
        name: string;
        id: string;
        slug: string;
        status: import(".prisma/client").$Enums.TenantStatus;
        createdAt: Date;
    }>;
}

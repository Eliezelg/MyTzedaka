import { TestService } from './test.service';
export declare class TestController {
    private readonly testService;
    constructor(testService: TestService);
    getHealth(): {
        status: string;
        timestamp: string;
    };
    getTenantInfo(tenant: any): {
        success: boolean;
        tenant: {
            id: any;
            slug: any;
            name: any;
        };
        timestamp: string;
    };
    getUsersByTenant(tenant: any): Promise<{
        users: {
            tenant: {
                name: string;
                id: string;
                slug: string;
                domain: string | null;
                status: import(".prisma/client").$Enums.TenantStatus;
                theme: import("@prisma/client/runtime/library").JsonValue;
                settings: import("@prisma/client/runtime/library").JsonValue;
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
            tenantId: string;
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
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}

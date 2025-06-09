import { Request } from 'express';
import { TenantService } from './tenant.service';
export declare class TenantController {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    getCurrentTenantInfo(req: Request): {
        tenant: {
            id: string;
            slug: string;
            name: string;
            domain?: string;
            status: string;
        };
        headers: {
            host: string;
            'x-tenant-id': string | string[];
        };
        timestamp: string;
    };
    getTenant(slug: string): Promise<{
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
    }>;
    createTenant(data: {
        slug: string;
        name: string;
        domain?: string;
        theme?: any;
        settings?: any;
    }): Promise<{
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
    }>;
    updateTenant(id: string, data: any): Promise<{
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
    }>;
    deleteTenant(id: string): Promise<{
        message: string;
    }>;
    healthCheck(req: Request): {
        status: string;
        message: string;
        tenant: {
            id: string;
            slug: string;
            name: string;
        };
        identificationMethods: {
            header: string | string[];
            subdomain: string;
            query: string | import("qs").ParsedQs | (string | import("qs").ParsedQs)[];
            path: string;
        };
        timestamp: string;
    };
}

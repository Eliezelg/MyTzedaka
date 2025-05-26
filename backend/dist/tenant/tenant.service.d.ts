import { PrismaService } from '../prisma/prisma.service';
import { Tenant } from '@prisma/client';
export declare class TenantService {
    private readonly prisma;
    private readonly logger;
    private readonly cache;
    constructor(prisma: PrismaService);
    findByIdentifier(identifier: string): Promise<Tenant | null>;
    findById(id: string): Promise<Tenant | null>;
    createTenant(data: {
        slug: string;
        name: string;
        domain?: string;
        theme?: any;
        settings?: any;
    }): Promise<Tenant>;
    updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant>;
    deleteTenant(id: string): Promise<void>;
    private invalidateCache;
    clearCache(): void;
}

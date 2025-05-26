import { TenantStatus } from '@prisma/client';
export declare class UpdateTenantSettingsDto {
    theme?: Record<string, any>;
    settings?: Record<string, any>;
    name?: string;
    domain?: string;
}
export declare class TenantInfoDto {
    id: string;
    name: string;
    slug: string;
    domain: string;
    status: TenantStatus;
    theme: Record<string, any>;
    settings: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    stats?: {
        usersCount: number;
        donationsCount: number;
        campaignsCount: number;
        totalAmount: number;
    };
}
export declare class TenantStatsDto {
    usersCount: number;
    donationsCount: number;
    campaignsCount: number;
    totalAmount: number;
    recentActivity: Array<{
        type: string;
        description: string;
        createdAt: Date;
    }>;
}

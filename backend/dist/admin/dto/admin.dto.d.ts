import { TenantStatus } from '@prisma/client';
export declare class CreateTenantDto {
    name: string;
    slug: string;
    domain?: string;
    adminEmail: string;
    adminFirstName: string;
    adminLastName: string;
    adminPhone?: string;
    theme?: Record<string, any>;
    settings?: Record<string, any>;
}
export declare class UpdateTenantDto {
    name?: string;
    domain?: string;
    status?: TenantStatus;
    theme?: Record<string, any>;
    settings?: Record<string, any>;
}
export declare class TenantListQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: TenantStatus;
    order?: 'asc' | 'desc';
}
export declare class TenantResponseDto {
    id: string;
    name: string;
    slug: string;
    domain?: string;
    status: TenantStatus;
    theme: Record<string, any>;
    settings: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    stats?: {
        users: number;
        donations: number;
        campaigns: number;
        totalAmount: number;
    };
}
export declare class AdminStatsDto {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
    totalDonations: number;
    totalAmount: number;
    totalCampaigns: number;
    recentTenants: TenantResponseDto[];
    monthlyStats: {
        month: string;
        tenants: number;
        users: number;
        donations: number;
        amount: number;
    }[];
}
export declare class DeploymentDto {
    type?: 'NETLIFY' | 'S3' | 'CUSTOM';
    config?: any;
    force?: boolean;
}

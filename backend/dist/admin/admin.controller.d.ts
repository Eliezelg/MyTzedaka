import { AdminService } from './admin.service';
import { CreateTenantDto, UpdateTenantDto, TenantListQueryDto, TenantResponseDto, AdminStatsDto, DeploymentDto } from './dto/admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAdminStats(): Promise<AdminStatsDto>;
    getTenants(query: TenantListQueryDto): Promise<{
        tenants: TenantResponseDto[];
        total: number;
    }>;
    getTenantById(id: string): Promise<TenantResponseDto>;
    createTenant(createTenantDto: CreateTenantDto): Promise<TenantResponseDto>;
    updateTenant(id: string, updateTenantDto: UpdateTenantDto): Promise<TenantResponseDto>;
    deleteTenant(id: string): Promise<void>;
    deployTenant(id: string, deploymentDto: DeploymentDto): Promise<{
        message: string;
        tenantId: string;
        deploymentId: string;
        status: string;
    }>;
    getTenantUsers(id: string): Promise<{
        users: any[];
        total: number;
    }>;
    getTenantAnalytics(id: string): Promise<{
        tenantId: string;
        metrics: {
            donations: {
                total: number;
                thisMonth: number;
            };
            users: {
                total: number;
                active: number;
            };
            campaigns: {
                total: number;
                active: number;
            };
        };
    }>;
}

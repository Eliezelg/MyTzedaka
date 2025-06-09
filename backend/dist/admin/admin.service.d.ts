import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateTenantDto, UpdateTenantDto, TenantListQueryDto, TenantResponseDto, AdminStatsDto } from './dto/admin.dto';
export declare class AdminService {
    private readonly prisma;
    private readonly configService;
    private cognitoClient;
    constructor(prisma: PrismaService, configService: ConfigService);
    createTenant(createTenantDto: CreateTenantDto): Promise<TenantResponseDto>;
    getTenants(query: TenantListQueryDto): Promise<{
        tenants: TenantResponseDto[];
        total: number;
    }>;
    getTenantById(id: string): Promise<TenantResponseDto>;
    updateTenant(id: string, updateTenantDto: UpdateTenantDto): Promise<TenantResponseDto>;
    deleteTenant(id: string): Promise<void>;
    getAdminStats(): Promise<AdminStatsDto>;
    createCognitoUser(email: string, tempPassword: string, attributes: Record<string, string>): Promise<void>;
    private generateTemporaryPassword;
    private formatTenantResponse;
}

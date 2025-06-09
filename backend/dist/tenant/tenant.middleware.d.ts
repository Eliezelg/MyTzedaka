import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { PrismaService } from '../prisma/prisma.service';
declare global {
    namespace Express {
        interface Request {
            tenant?: {
                id: string;
                slug: string;
                name: string;
                domain?: string;
                status: string;
            };
        }
    }
}
export declare class TenantMiddleware implements NestMiddleware {
    private readonly tenantService;
    private readonly prisma;
    private readonly logger;
    constructor(tenantService: TenantService, prisma: PrismaService);
    use(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    private extractTenantIdentifier;
}

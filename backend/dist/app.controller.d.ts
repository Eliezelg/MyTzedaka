import { Request } from 'express';
import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getHealth(): {
        status: string;
        timestamp: string;
        environment: string;
        version: string;
    };
    getCurrentTenantInfo(req: Request): {
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
        request: {
            url: string;
            path: string;
            host: string;
        };
        timestamp: string;
    };
    getUsersForTenant(): Promise<{
        error: string;
        tenant?: undefined;
        users?: undefined;
        count?: undefined;
        details?: undefined;
    } | {
        tenant: {
            id: string;
            slug: string;
            name: string;
        };
        users: any;
        count: any;
        error?: undefined;
        details?: undefined;
    } | {
        error: string;
        details: any;
        tenant?: undefined;
        users?: undefined;
        count?: undefined;
    }>;
}

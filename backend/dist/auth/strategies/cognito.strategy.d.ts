import { Strategy } from 'passport-custom';
declare const CognitoStrategy_base: new (...args: any[]) => Strategy;
export declare class CognitoStrategy extends CognitoStrategy_base {
    private cognitoClient;
    constructor();
    validate(req: any): Promise<{
        cognitoId: string;
        email: string;
        firstName: string;
        lastName: string;
        tenantId: string;
    }>;
    private extractToken;
}
export {};

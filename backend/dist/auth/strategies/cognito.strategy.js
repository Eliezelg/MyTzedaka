"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_custom_1 = require("passport-custom");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
let CognitoStrategy = class CognitoStrategy extends (0, passport_1.PassportStrategy)(passport_custom_1.Strategy, 'cognito') {
    constructor() {
        super();
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: process.env.AWS_REGION || 'eu-west-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    async validate(req) {
        const token = this.extractToken(req);
        if (!token) {
            throw new common_1.UnauthorizedException('Token Cognito manquant');
        }
        try {
            const command = new client_cognito_identity_provider_1.GetUserCommand({
                AccessToken: token,
            });
            const result = await this.cognitoClient.send(command);
            return {
                cognitoId: result.Username,
                email: result.UserAttributes?.find(attr => attr.Name === 'email')?.Value,
                firstName: result.UserAttributes?.find(attr => attr.Name === 'given_name')?.Value,
                lastName: result.UserAttributes?.find(attr => attr.Name === 'family_name')?.Value,
                tenantId: result.UserAttributes?.find(attr => attr.Name === 'custom:tenant_id')?.Value,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token Cognito invalide');
        }
    }
    extractToken(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return null;
        const [bearer, token] = authHeader.split(' ');
        return bearer === 'Bearer' ? token : null;
    }
};
exports.CognitoStrategy = CognitoStrategy;
exports.CognitoStrategy = CognitoStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CognitoStrategy);
//# sourceMappingURL=cognito.strategy.js.map
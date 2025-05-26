import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { 
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class CognitoStrategy extends PassportStrategy(Strategy, 'cognito') {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor() {
    super();
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'eu-west-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async validate(req: any) {
    const token = this.extractToken(req);
    
    if (!token) {
      throw new UnauthorizedException('Token Cognito manquant');
    }

    try {
      const command = new GetUserCommand({
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
    } catch (error) {
      throw new UnauthorizedException('Token Cognito invalide');
    }
  }

  private extractToken(req: any): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const [bearer, token] = authHeader.split(' ');
    return bearer === 'Bearer' ? token : null;
  }
}

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ResetPasswordDto, ConfirmResetPasswordDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        cognito_token: string;
        refresh_token: string;
        expires_in: number;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            permissions: import("@prisma/client/runtime/library").JsonValue;
        };
        tenant: {
            id: string;
            slug: string;
            name: string;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    confirmResetPassword(confirmResetPasswordDto: ConfirmResetPasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
        expires_in: number;
    }>;
    getProfile(req: any): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        permissions: import("@prisma/client/runtime/library").JsonValue;
        lastLoginAt: Date;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}

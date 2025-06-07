import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private configService;
    private algorithm;
    private keyLength;
    private ivLength;
    private tagLength;
    private saltLength;
    private tagPosition;
    private encryptedPosition;
    constructor(configService: ConfigService);
    private deriveKey;
    encrypt(text: string): Promise<string>;
    decrypt(encryptedText: string): Promise<string>;
    hash(text: string): Promise<string>;
    compare(text: string, hashedText: string): Promise<boolean>;
}

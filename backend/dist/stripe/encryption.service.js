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
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let EncryptionService = class EncryptionService {
    constructor(configService) {
        this.configService = configService;
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
        this.saltLength = 64;
        this.tagPosition = this.saltLength + this.ivLength;
        this.encryptedPosition = this.tagPosition + this.tagLength;
    }
    deriveKey(salt) {
        const secret = this.configService.get('ENCRYPTION_SECRET');
        if (!secret) {
            throw new Error('ENCRYPTION_SECRET non configuré');
        }
        return crypto.pbkdf2Sync(secret, salt, 100000, this.keyLength, 'sha256');
    }
    async encrypt(text) {
        if (!text)
            return null;
        const salt = crypto.randomBytes(this.saltLength);
        const iv = crypto.randomBytes(this.ivLength);
        const key = this.deriveKey(salt);
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        const tag = cipher.getAuthTag();
        const combined = Buffer.concat([salt, iv, tag, encrypted]);
        return combined.toString('base64');
    }
    async decrypt(encryptedText) {
        if (!encryptedText)
            return null;
        const combined = Buffer.from(encryptedText, 'base64');
        const salt = combined.slice(0, this.saltLength);
        const iv = combined.slice(this.saltLength, this.tagPosition);
        const tag = combined.slice(this.tagPosition, this.encryptedPosition);
        const encrypted = combined.slice(this.encryptedPosition);
        const key = this.deriveKey(salt);
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    }
    async hash(text) {
        if (!text)
            return null;
        const salt = crypto.randomBytes(this.saltLength);
        const hash = crypto.pbkdf2Sync(text, salt, 100000, 64, 'sha256');
        const combined = Buffer.concat([salt, hash]);
        return combined.toString('base64');
    }
    async compare(text, hashedText) {
        if (!text || !hashedText)
            return false;
        const combined = Buffer.from(hashedText, 'base64');
        const salt = combined.slice(0, this.saltLength);
        const originalHash = combined.slice(this.saltLength);
        const hash = crypto.pbkdf2Sync(text, salt, 100000, 64, 'sha256');
        return crypto.timingSafeEqual(originalHash, hash);
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map
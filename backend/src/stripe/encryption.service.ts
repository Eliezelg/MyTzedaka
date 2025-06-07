import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private tagLength = 16;
  private saltLength = 64;
  private tagPosition = this.saltLength + this.ivLength;
  private encryptedPosition = this.tagPosition + this.tagLength;
  
  constructor(private configService: ConfigService) {}

  /**
   * Dérive une clé à partir du secret de l'application
   */
  private deriveKey(salt: Buffer): Buffer {
    const secret = this.configService.get<string>('ENCRYPTION_SECRET');
    if (!secret) {
      throw new Error('ENCRYPTION_SECRET non configuré');
    }
    
    return crypto.pbkdf2Sync(secret, salt, 100000, this.keyLength, 'sha256');
  }

  /**
   * Chiffre une chaîne de caractères
   */
  async encrypt(text: string): Promise<string> {
    if (!text) return null;

    // Générer salt et IV aléatoires
    const salt = crypto.randomBytes(this.saltLength);
    const iv = crypto.randomBytes(this.ivLength);
    
    // Dériver la clé
    const key = this.deriveKey(salt);
    
    // Créer le cipher
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Pour AES-GCM, obtenir le tag d'authentification
    const tag = (cipher as any).getAuthTag();
    
    // Combiner salt + iv + tag + encrypted
    const combined = Buffer.concat([salt, iv, tag, encrypted]);
    
    // Retourner en base64
    return combined.toString('base64');
  }

  /**
   * Déchiffre une chaîne de caractères
   */
  async decrypt(encryptedText: string): Promise<string> {
    if (!encryptedText) return null;

    // Convertir depuis base64
    const combined = Buffer.from(encryptedText, 'base64');
    
    // Extraire les composants
    const salt = combined.slice(0, this.saltLength);
    const iv = combined.slice(this.saltLength, this.tagPosition);
    const tag = combined.slice(this.tagPosition, this.encryptedPosition);
    const encrypted = combined.slice(this.encryptedPosition);
    
    // Dériver la clé
    const key = this.deriveKey(salt);
    
    // Créer le decipher
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    
    // Définir le tag d'authentification pour AES-GCM
    (decipher as any).setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  }

  /**
   * Hash une chaîne de manière irréversible (pour comparaison)
   */
  async hash(text: string): Promise<string> {
    if (!text) return null;
    
    const salt = crypto.randomBytes(this.saltLength);
    const hash = crypto.pbkdf2Sync(text, salt, 100000, 64, 'sha256');
    
    // Combiner salt + hash
    const combined = Buffer.concat([salt, hash]);
    
    return combined.toString('base64');
  }

  /**
   * Compare un texte avec un hash
   */
  async compare(text: string, hashedText: string): Promise<boolean> {
    if (!text || !hashedText) return false;
    
    // Convertir depuis base64
    const combined = Buffer.from(hashedText, 'base64');
    
    // Extraire salt et hash
    const salt = combined.slice(0, this.saltLength);
    const originalHash = combined.slice(this.saltLength);
    
    // Calculer le hash du texte avec le même salt
    const hash = crypto.pbkdf2Sync(text, salt, 100000, 64, 'sha256');
    
    // Comparer les hashes
    return crypto.timingSafeEqual(originalHash, hash);
  }
}

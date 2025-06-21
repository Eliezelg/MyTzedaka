import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(private readonly prisma: PrismaService) {}

  async uploadTenantLogo(
    tenantId: string,
    file: Express.Multer.File,
  ): Promise<{ logoPath: string; logoUrl: string }> {
    // Validation du fichier
    this.validateImageFile(file);

    // Créer le répertoire de stockage
    const storageDir = path.join(process.cwd(), 'storage', 'logos', tenantId);
    await this.ensureDirectoryExists(storageDir);

    // Générer un nom de fichier unique
    const fileExtension = path.extname(file.originalname);
    const fileName = `logo-${uuidv4()}${fileExtension}`;
    const filePath = path.join(storageDir, fileName);

    try {
      // Sauvegarder le fichier
      await fs.writeFile(filePath, file.buffer);

      // Mettre à jour le tenant avec le nouveau logo
      const prismaClient = this.prisma.forTenant(tenantId);
      await prismaClient.tenant.update({
        where: { id: tenantId },
        data: { logoPath: filePath },
      });

      // Générer l'URL pour l'accès frontend
      const logoUrl = `/api/tenant/${tenantId}/logo`;

      return {
        logoPath: filePath,
        logoUrl,
      };
    } catch (error) {
      // Nettoyer le fichier en cas d'erreur
      try {
        await fs.unlink(filePath);
      } catch {}
      throw new BadRequestException('Failed to save logo file');
    }
  }

  async getTenantLogo(tenantId: string): Promise<{ filePath: string; mimeType: string }> {
    const prismaClient = this.prisma.forTenant(tenantId);
    const tenant = await prismaClient.tenant.findFirst({
      where: { id: tenantId },
      select: { logoPath: true },
    });

    if (!tenant?.logoPath) {
      throw new BadRequestException('No logo found for this tenant');
    }

    try {
      await fs.access(tenant.logoPath);
      
      // Déterminer le type MIME basé sur l'extension
      const extension = path.extname(tenant.logoPath).toLowerCase();
      const mimeType = this.getMimeTypeFromExtension(extension);

      return {
        filePath: tenant.logoPath,
        mimeType,
      };
    } catch {
      throw new BadRequestException('Logo file not found');
    }
  }

  async deleteTenantLogo(tenantId: string): Promise<void> {
    const prismaClient = this.prisma.forTenant(tenantId);
    const tenant = await prismaClient.tenant.findFirst({
      where: { id: tenantId },
      select: { logoPath: true },
    });

    if (tenant?.logoPath) {
      try {
        await fs.unlink(tenant.logoPath);
      } catch {
        // Ignorer si le fichier n'existe pas
      }

      await prismaClient.tenant.update({
        where: { id: tenantId },
        data: { logoPath: null },
      });
    }
  }

  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedImageTypes.join(', ')}`
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File too large. Maximum size: ${this.maxFileSize / (1024 * 1024)}MB`
      );
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };

    return mimeTypes[extension] || 'image/jpeg';
  }
}
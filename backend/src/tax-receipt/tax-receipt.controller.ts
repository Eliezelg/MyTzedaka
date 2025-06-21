import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HubJwtAuthGuard } from '../auth/guards/hub-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { TaxReceiptService } from './tax-receipt.service';
import { GenerateTaxReceiptDto, TaxReceiptQueryDto } from './dto/tax-receipt.dto';
import { GetTenant } from '../tenant/get-tenant.decorator';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

@ApiTags('Tax Receipts')
@Controller('tax-receipts')
@UseGuards(HubJwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TaxReceiptController {
  constructor(private readonly taxReceiptService: TaxReceiptService) {}

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Générer un reçu fiscal pour une donation' })
  async generateTaxReceipt(
    @GetTenant() tenantId: string,
    @Body() dto: GenerateTaxReceiptDto,
  ) {
    return this.taxReceiptService.generateTaxReceipt(
      tenantId,
      dto.donationId,
      dto.country,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.MANAGER, UserRole.MEMBER)
  @ApiOperation({ summary: 'Lister les reçus fiscaux' })
  async getTaxReceipts(
    @GetTenant() tenantId: string,
    @Query() query: TaxReceiptQueryDto,
  ) {
    return this.taxReceiptService.getTaxReceipts(tenantId, query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.MANAGER, UserRole.MEMBER)
  @ApiOperation({ summary: 'Obtenir les statistiques des reçus fiscaux' })
  async getTaxReceiptsStats(
    @GetTenant() tenantId: string,
    @Query('year') year?: number,
  ) {
    return this.taxReceiptService.getTenantTaxReceiptsStats(tenantId, { year });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Obtenir un reçu fiscal par ID' })
  async getTaxReceipt(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.taxReceiptService.getTaxReceiptById(tenantId, id);
  }

  @Get(':id/download')
  @Roles(UserRole.ADMIN, UserRole.TREASURER, UserRole.MANAGER, UserRole.MEMBER)
  @ApiOperation({ summary: 'Télécharger le PDF d\'un reçu fiscal' })
  async downloadTaxReceipt(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const pdfPath = await this.taxReceiptService.getReceiptPdfPath(tenantId, id);
    
    // Vérifier que le fichier existe
    try {
      await stat(pdfPath);
    } catch {
      throw new NotFoundException('PDF file not found');
    }

    const file = createReadStream(pdfPath);
    const receipt = await this.taxReceiptService.getTaxReceiptById(tenantId, id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recu-fiscal-${receipt.receiptNumber}.pdf"`,
    });

    return new StreamableFile(file);
  }

  @Get('donation/:donationId')
  @ApiOperation({ summary: 'Obtenir le reçu fiscal d\'une donation' })
  async getTaxReceiptByDonation(
    @GetTenant() tenantId: string,
    @Param('donationId') donationId: string,
  ) {
    const receipts = await this.taxReceiptService.getTaxReceipts(tenantId, {
      donationId,
    });

    if (receipts.length === 0) {
      throw new NotFoundException('No tax receipt found for this donation');
    }

    return receipts[0];
  }
}
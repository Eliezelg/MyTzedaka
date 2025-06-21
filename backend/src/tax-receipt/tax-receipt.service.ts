import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Prisma, TaxReceiptStatus, DonationStatus } from '@prisma/client';
import { getLegalClauses, TaxReceiptData } from './templates/tax-receipt-templates';
import { CountryCode } from './dto/tax-receipt.dto';

@Injectable()
export class TaxReceiptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  private async ensureDirectoryExists(dirPath: string) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async generateTaxReceipt(tenantId: string, donationId: string, country: CountryCode) {
    const prismaClient = this.prisma.forTenant(tenantId);

    // Récupérer la donation avec toutes les relations nécessaires
    const donation = await prismaClient.donation.findFirst({
      where: {
        id: donationId,
        tenantId,
        status: DonationStatus.COMPLETED,
      },
      include: {
        user: true,
        tenant: {
          include: {
            associationListing: true,
          },
        },
        taxReceipt: true,
      },
    });

    if (!donation) {
      throw new NotFoundException('Donation not found or not completed');
    }

    if (donation.taxReceipt) {
      return donation.taxReceipt;
    }

    // Générer le numéro de reçu
    const year = new Date().getFullYear();
    const tenantCode = donation.tenant.slug.toUpperCase().substring(0, 3);
    const count = await prismaClient.taxReceipt.count({
      where: {
        tenantId,
        receiptNumber: {
          startsWith: `${year}-${tenantCode}`,
        },
      },
    });
    const sequence = String(count + 1).padStart(6, '0');
    const receiptNumber = `${year}-${tenantCode}-${sequence}`;

    // Préparer les données du reçu
    const { clause, deductionRate } = getLegalClauses(country);
    
    const donorAddress = [
      donation.user.addressLine1,
      donation.user.addressLine2,
      `${donation.user.postalCode || ''} ${donation.user.city || ''}`,
      donation.user.country || '',
    ]
      .filter(Boolean)
      .join(', ');

    const associationAddress = `${donation.tenant.associationListing?.location || ''}, ${
      donation.tenant.associationListing?.country || ''
    }`;

    const receiptData: TaxReceiptData = {
      receiptNumber,
      issueDate: new Date().toLocaleDateString(),
      donorName: `${donation.user.firstName} ${donation.user.lastName}`,
      donorAddress: donorAddress || 'Non renseignée',
      donorEmail: donation.user.email,
      donorPhone: donation.user.phone,
      associationName: donation.tenant.name,
      associationAddress,
      associationEmail: donation.tenant.associationListing?.email,
      associationPhone: donation.tenant.associationListing?.phone,
      donationAmount: donation.amount.toString(),
      donationCurrency: donation.currency,
      donationDate: donation.createdAt.toLocaleDateString(),
      paymentMethod: donation.paymentMethod || 'Carte bancaire',
      legalClause: clause,
      taxDeductionRate: deductionRate?.toString(),
      logoPath: donation.tenant.logoPath,
      country,
    };

    // Créer l'enregistrement en base
    const taxReceipt = await prismaClient.taxReceipt.create({
      data: {
        tenantId,
        donationId: donation.id,
        receiptNumber,
        donorName: receiptData.donorName,
        donorAddress: receiptData.donorAddress,
        donorEmail: receiptData.donorEmail,
        donorPhone: receiptData.donorPhone,
        associationName: receiptData.associationName,
        associationAddress: receiptData.associationAddress,
        associationEmail: receiptData.associationEmail,
        associationPhone: receiptData.associationPhone,
        donationAmount: donation.amount,
        donationCurrency: donation.currency,
        donationDate: donation.createdAt,
        paymentMethod: receiptData.paymentMethod,
        country,
        legalClause: clause,
        taxDeductionRate: deductionRate || null,
        status: TaxReceiptStatus.DRAFT,
      },
    });

    // Générer le PDF
    try {
      const pdfPath = await this.generatePDF(tenantId, taxReceipt.id, receiptData);
      
      // Mettre à jour le reçu avec le chemin du PDF
      return await prismaClient.taxReceipt.update({
        where: { id: taxReceipt.id },
        data: {
          pdfPath,
          pdfGeneratedAt: new Date(),
          status: TaxReceiptStatus.GENERATED,
        },
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new BadRequestException('Failed to generate PDF receipt');
    }
  }

  private async generatePDF(
    tenantId: string,
    receiptId: string,
    data: TaxReceiptData,
  ): Promise<string> {
    // Créer le répertoire de stockage
    const storageDir = path.join(process.cwd(), 'storage', 'tax-receipts', tenantId);
    await this.ensureDirectoryExists(storageDir);

    try {
      // Importer puppeteer de manière dynamique
      const puppeteer = await import('puppeteer');
      
      // Générer le HTML du reçu
      const html = this.generateReceiptHTML(data);

      // Lancer Puppeteer pour la conversion HTML vers PDF
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Générer le PDF
      const fileName = `receipt-${receiptId}.pdf`;
      const filePath = path.join(storageDir, fileName);
      
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });
      
      await browser.close();
      return filePath;
      
    } catch (error) {
      console.error('Erreur lors de la génération PDF avec Puppeteer:', error);
      
      // Fallback : sauvegarder en HTML si Puppeteer échoue
      console.log('Fallback vers HTML...');
      const html = this.generateReceiptHTML(data);
      const fileName = `receipt-${receiptId}.html`;
      const filePath = path.join(storageDir, fileName);
      await fs.writeFile(filePath, html, 'utf-8');
      
      return filePath;
    }
  }

  private generateReceiptHTML(data: TaxReceiptData): string {
    const titleText = {
      FR: 'REÇU AU TITRE DES DONS',
      IL: 'קבלה על תרומה',
      US: 'DONATION RECEIPT',
      UK: 'GIFT AID RECEIPT',
      CA: 'OFFICIAL DONATION RECEIPT',
    };

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reçu Fiscal</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .receipt-number {
            font-size: 14px;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        .donation-info {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
        }
        .legal-clause {
            font-size: 12px;
            color: #555;
            margin-top: 30px;
            padding: 15px;
            background-color: #f5f5f5;
            border-left: 4px solid #007cba;
        }
        .signature {
            text-align: right;
            margin-top: 40px;
            font-style: italic;
        }
        @media print {
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${titleText[data.country] || 'DONATION RECEIPT'}</div>
        <div class="receipt-number">N° ${data.receiptNumber}</div>
        <div class="receipt-number">Date: ${data.issueDate}</div>
    </div>

    <div class="info-grid">
        <div class="section">
            <div class="section-title">DONATEUR / DONOR</div>
            <div><strong>${data.donorName}</strong></div>
            <div>${data.donorAddress}</div>
            <div>${data.donorEmail}</div>
            ${data.donorPhone ? `<div>${data.donorPhone}</div>` : ''}
        </div>

        <div class="section">
            <div class="section-title">BÉNÉFICIAIRE / BENEFICIARY</div>
            <div><strong>${data.associationName}</strong></div>
            <div>${data.associationAddress}</div>
            ${data.associationEmail ? `<div>${data.associationEmail}</div>` : ''}
            ${data.associationPhone ? `<div>${data.associationPhone}</div>` : ''}
        </div>
    </div>

    <div class="section">
        <div class="section-title">DÉTAILS DU DON / DONATION DETAILS</div>
        <div class="donation-info">
            <div><strong>Montant:</strong> ${data.donationAmount} ${data.donationCurrency}</div>
            <div><strong>Date du don:</strong> ${data.donationDate}</div>
            <div><strong>Mode de paiement:</strong> ${data.paymentMethod}</div>
            ${data.taxDeductionRate ? `<div><strong>Taux de déduction:</strong> ${data.taxDeductionRate}%</div>` : ''}
        </div>
    </div>

    <div class="legal-clause">
        ${data.legalClause.replace(/\n/g, '<br>')}
    </div>

    <div class="signature">
        ${data.associationName}<br>
        ${new Date().toLocaleDateString()}
    </div>
</body>
</html>`;
  }

  async getTaxReceipts(tenantId: string, filters?: any) {
    const prismaClient = this.prisma.forTenant(tenantId);

    const where: Prisma.TaxReceiptWhereInput = {
      tenantId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.issueDate = {};
      if (filters.startDate) {
        where.issueDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.issueDate.lte = new Date(filters.endDate);
      }
    }

    return prismaClient.taxReceipt.findMany({
      where,
      include: {
        donation: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        issueDate: 'desc',
      },
    });
  }

  async getTaxReceiptById(tenantId: string, receiptId: string) {
    const prismaClient = this.prisma.forTenant(tenantId);

    const receipt = await prismaClient.taxReceipt.findFirst({
      where: {
        id: receiptId,
        tenantId,
      },
      include: {
        donation: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException('Tax receipt not found');
    }

    return receipt;
  }

  async getReceiptPdfPath(tenantId: string, receiptId: string): Promise<string> {
    const receipt = await this.getTaxReceiptById(tenantId, receiptId);

    if (!receipt.pdfPath) {
      throw new NotFoundException('PDF not yet generated for this receipt');
    }

    return receipt.pdfPath;
  }

  async getDonorTaxReceipts(
    userId: string,
    options?: {
      year?: number;
      tenantId?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: Prisma.TaxReceiptWhereInput = {};

    // Filtrer par donation du donateur
    where.donation = {
      userId,
    };

    // Filtrer par tenant si spécifié
    if (options?.tenantId) {
      where.tenantId = options.tenantId;
    }

    // Filtrer par année si spécifiée
    if (options?.year) {
      const startOfYear = new Date(options.year, 0, 1);
      const endOfYear = new Date(options.year + 1, 0, 1);
      where.issueDate = {
        gte: startOfYear,
        lt: endOfYear,
      };
    }

    const [receipts, total] = await Promise.all([
      this.prisma.taxReceipt.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          donation: {
            select: {
              id: true,
              amount: true,
              currency: true,
              createdAt: true,
              campaign: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: {
          issueDate: 'desc',
        },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      this.prisma.taxReceipt.count({ where }),
    ]);

    return { receipts, total };
  }

  async getDonorTaxReceiptsByYear(userId: string, tenantId?: string) {
    const where: Prisma.TaxReceiptWhereInput = {
      donation: {
        userId,
      },
    };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    const receipts = await this.prisma.taxReceipt.findMany({
      where,
      select: {
        issueDate: true,
        donationAmount: true,
        donationCurrency: true,
        receiptNumber: true,
        tenant: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        issueDate: 'desc',
      },
    });

    // Grouper par année
    const receiptsByYear = receipts.reduce((acc, receipt) => {
      const year = receipt.issueDate.getFullYear();
      if (!acc[year]) {
        acc[year] = {
          year,
          receipts: [],
          totalAmount: 0,
          count: 0,
        };
      }
      acc[year].receipts.push(receipt);
      acc[year].totalAmount += Number(receipt.donationAmount);
      acc[year].count += 1;
      return acc;
    }, {} as Record<number, any>);

    return Object.values(receiptsByYear).sort((a: any, b: any) => b.year - a.year);
  }

  async getTenantTaxReceiptsStats(tenantId: string, options?: { year?: number }) {
    const where: Prisma.TaxReceiptWhereInput = {
      tenantId,
    };

    if (options?.year) {
      const startOfYear = new Date(options.year, 0, 1);
      const endOfYear = new Date(options.year + 1, 0, 1);
      where.issueDate = {
        gte: startOfYear,
        lt: endOfYear,
      };
    }

    const [receipts, stats] = await Promise.all([
      this.prisma.taxReceipt.findMany({
        where,
        include: {
          donation: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          issueDate: 'desc',
        },
      }),
      this.prisma.taxReceipt.aggregate({
        where,
        _sum: {
          donationAmount: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // Grouper par mois pour les statistiques
    const receiptsByMonth = receipts.reduce((acc, receipt) => {
      const monthKey = `${receipt.issueDate.getFullYear()}-${String(receipt.issueDate.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          count: 0,
          totalAmount: 0,
        };
      }
      acc[monthKey].count += 1;
      acc[monthKey].totalAmount += Number(receipt.donationAmount);
      return acc;
    }, {} as Record<string, any>);

    return {
      receipts,
      totalAmount: stats._sum.donationAmount || 0,
      totalCount: stats._count.id || 0,
      monthlyStats: Object.values(receiptsByMonth),
    };
  }
}
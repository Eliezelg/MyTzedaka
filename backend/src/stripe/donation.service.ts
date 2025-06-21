import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { MultiTenantStripeService } from './multi-tenant-stripe.service';
import { DonationStatus, DonationType, DonationSource, UserRole } from '@prisma/client';
import { TaxReceiptService } from '../tax-receipt/tax-receipt.service';
import { CountryCode } from '../tax-receipt/dto/tax-receipt.dto';
import Stripe from 'stripe';

export interface CreateDonationDto {
  amount: number; // en euros
  currency?: string;
  campaignId?: string;
  donorEmail?: string;
  donorName?: string;
  isAnonymous?: boolean;
  purpose?: string;
  source?: DonationSource;
  sourceUrl?: string;
}

export interface DonationWithPaymentIntent {
  donation: any;
  paymentIntent: Stripe.PaymentIntent;
  clientSecret: string;
}

@Injectable()
export class DonationService {
  private readonly logger = new Logger(DonationService.name);

  constructor(
    private prisma: PrismaService,
    private multiTenantStripeService: MultiTenantStripeService,
    @Inject(forwardRef(() => TaxReceiptService))
    private taxReceiptService: TaxReceiptService,
  ) {}

  /**
   * Crée une donation et un PaymentIntent Stripe
   */
  async createDonation(
    tenantId: string,
    userId: string | null,
    createDonationDto: CreateDonationDto
  ): Promise<DonationWithPaymentIntent> {
    const {
      amount,
      currency = 'EUR',
      campaignId,
      donorEmail,
      donorName,
      isAnonymous = false,
      purpose,
      source = DonationSource.PLATFORM,
      sourceUrl,
    } = createDonationDto;

    // Résoudre l'utilisateur
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      if (!donorEmail) {
        throw new BadRequestException('donorEmail est requis pour un don public');
      }

      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: donorEmail,
          tenantId: null, // utilisateur global
        },
      });

      if (existingUser) {
        resolvedUserId = existingUser.id;
      } else {
        const names = (donorName || '').split(' ');
        const firstName = names.shift() || 'Donor';
        const lastName = names.join(' ');

        const newUser = await this.prisma.user.create({
          data: {
            id: uuidv4(),
            email: donorEmail,
            cognitoId: `anon_${uuidv4()}`,
            firstName,
            lastName,
            role: UserRole.MEMBER,
            tenantId: null,
            isActive: true,
          },
        });
        resolvedUserId = newUser.id;
      }
    }

    // Validation du montant
    if (amount < 0.5) {
      throw new BadRequestException('Le montant minimum est de 0.50€');
    }

    if (amount > 100000) {
      throw new BadRequestException('Le montant maximum est de 100,000€');
    }

    // Vérification que la campagne existe si spécifiée
    if (campaignId) {
      const campaign = await this.prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
      });

      if (!campaign) {
        throw new NotFoundException('Campagne non trouvée');
      }

      // Vérifier que la campagne est active
      if (campaign.status !== 'ACTIVE') {
        throw new BadRequestException('Cette campagne n\'est plus active');
      }
    }

    try {
      // Convertir en centimes pour Stripe
      const amountInCents = Math.round(amount * 100);

      // Créer le PaymentIntent Stripe via le service multi-tenant
      const paymentIntent = await this.multiTenantStripeService.createPaymentIntent(
        tenantId,
        amount, // En euros, la conversion se fait dans MultiTenantStripeService
        currency.toLowerCase(),
        {
          userId,
          campaignId: campaignId || '',
          donorEmail: donorEmail || '',
          source,
          description: campaignId ? 
            `Donation pour campagne ${campaignId}` : 
            'Donation MyTzedaka',
        }
      );

      // Créer la donation en base
      const donationData: any = {
        tenantId,
        amount,
        currency,
        type: DonationType.PUNCTUAL,
        status: DonationStatus.PENDING,
        stripePaymentIntentId: paymentIntent.id,
        isAnonymous,
        fiscalReceiptRequested: !isAnonymous,
        source,
        sourceUrl,
      };

      if (resolvedUserId) {
        donationData.userId = resolvedUserId;
      }
      if (campaignId) {
        donationData.campaignId = campaignId;
      }
      if (purpose) {
        donationData.purpose = purpose;
      }

      const donation = await this.prisma.donation.create({
        data: donationData,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              goal: true,
              raised: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      this.logger.log(
        `Donation created: ${donation.id} for ${amount}€ (PaymentIntent: ${paymentIntent.id})`
      );

      return {
        donation,
        paymentIntent,
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error) {
      this.logger.error('Error creating donation:', error);
      throw error;
    }
  }

  /**
   * Confirme une donation après paiement réussi
   */
  async confirmDonation(paymentIntentId: string): Promise<any> {
    try {
      // Récupérer la donation existante pour obtenir le tenantId
      const existingDonation = await this.prisma.donation.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { tenant: true },
      });

      if (!existingDonation) {
        throw new NotFoundException('Donation non trouvée');
      }

      // Si la donation est déjà confirmée, retourner directement
      if (existingDonation.status === DonationStatus.COMPLETED) {
        this.logger.log(`Donation ${existingDonation.id} already confirmed`);
        return existingDonation;
      }

      // Récupérer le PaymentIntent depuis Stripe via le service multi-tenant
      const paymentIntent = await this.multiTenantStripeService.getPaymentIntent(
        existingDonation.tenantId,
        paymentIntentId
      );

      // Vérifier que le paiement a réussi
      if (paymentIntent.status !== 'succeeded') {
        this.logger.warn(`PaymentIntent ${paymentIntentId} status: ${paymentIntent.status}`);
        throw new BadRequestException(`Le paiement n'a pas réussi. Statut: ${paymentIntent.status}`);
      }

      // Mettre à jour la donation
      const donation = await this.prisma.donation.update({
        where: { id: existingDonation.id },
        data: {
          status: DonationStatus.COMPLETED,
          paymentMethod: paymentIntent.payment_method_types[0] || 'card',
        },
        include: {
          campaign: true,
          tenant: true,
          user: true,
        },
      });

      // Mettre à jour le montant collecté de la campagne si applicable
      if (donation.campaignId) {
        await this.prisma.campaign.update({
          where: { id: donation.campaignId },
          data: {
            raised: {
              increment: donation.amount,
            },
          },
        });

        this.logger.log(
          `Campaign ${donation.campaignId} raised amount updated (+${donation.amount}€)`
        );
      }

      // Générer automatiquement le reçu fiscal si demandé
      if (donation.fiscalReceiptRequested && !donation.isAnonymous) {
        try {
          // Déterminer le pays par défaut basé sur l'utilisateur ou l'association
          const defaultCountry = this.getDefaultCountry(donation.user, donation.tenant);
          
          await this.taxReceiptService.generateTaxReceipt(
            donation.tenantId,
            donation.id,
            defaultCountry,
          );
          
          this.logger.log(`Tax receipt generated for donation ${donation.id}`);
        } catch (error) {
          this.logger.error(`Failed to generate tax receipt for donation ${donation.id}:`, error);
          // Ne pas faire échouer la confirmation de donation si la génération du reçu échoue
        }
      }

      this.logger.log(`Donation confirmed: ${donation.id} - ${donation.amount}€`);
      return donation;
    } catch (error) {
      this.logger.error(`Error confirming donation for PaymentIntent ${paymentIntentId}:`, error);
      throw error;
    }
  }

  /**
   * Marque une donation comme échouée
   */
  async failDonation(paymentIntentId: string, reason?: string): Promise<any> {
    try {
      const existingDonation = await this.prisma.donation.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      if (!existingDonation) {
        throw new NotFoundException('Donation non trouvée');
      }

      const donation = await this.prisma.donation.update({
        where: { id: existingDonation.id },
        data: {
          status: DonationStatus.FAILED,
        },
        include: {
          campaign: true,
          tenant: true,
        },
      });

      this.logger.log(
        `Donation failed: ${donation.id} - Reason: ${reason || 'Unknown'}`
      );
      return donation;
    } catch (error) {
      this.logger.error(`Error failing donation for PaymentIntent ${paymentIntentId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des donations d'un utilisateur
   */
  async getDonationHistory(
    userId: string,
    tenantId?: string,
    limit = 20,
    offset = 0
  ): Promise<{ donations: any[]; total: number }> {
    const where: any = { userId };
    
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        where,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.donation.count({ where }),
    ]);

    return { donations, total };
  }

  /**
   * Détermine le pays par défaut pour la génération de reçu fiscal
   */
  private getDefaultCountry(user: any, tenant: any): CountryCode {
    // Priorité : pays de l'utilisateur > pays de l'association > France par défaut
    if (user?.country) {
      const userCountry = user.country.toUpperCase();
      if (Object.values(CountryCode).includes(userCountry as CountryCode)) {
        return userCountry as CountryCode;
      }
    }

    if (tenant?.associationListing?.country) {
      const tenantCountry = tenant.associationListing.country.toUpperCase();
      if (Object.values(CountryCode).includes(tenantCountry as CountryCode)) {
        return tenantCountry as CountryCode;
      }
    }

    // Par défaut : France
    return CountryCode.FR;
  }

  /**
   * Récupère les donations d'une campagne
   */
  async getCampaignDonations(
    campaignId: string,
    tenantId: string,
    limit = 50
  ): Promise<any[]> {
    return this.prisma.donation.findMany({
      where: {
        campaignId,
        tenantId,
        status: DonationStatus.COMPLETED,
      },
      select: {
        id: true,
        amount: true,
        isAnonymous: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Statistiques des donations pour une campagne
   */
  async getCampaignDonationStats(campaignId: string, tenantId: string) {
    const stats = await this.prisma.donation.aggregate({
      where: {
        campaignId,
        tenantId,
        status: DonationStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        amount: true,
      },
    });

    return {
      totalAmount: stats._sum.amount || 0,
      donationCount: stats._count.id || 0,
      averageAmount: stats._avg.amount || 0,
    };
  }
}

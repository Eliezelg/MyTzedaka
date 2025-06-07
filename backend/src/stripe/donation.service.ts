import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MultiTenantStripeService } from './multi-tenant-stripe.service';
import { DonationStatus, DonationType, DonationSource } from '@prisma/client';
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
  ) {}

  /**
   * Crée une donation et un PaymentIntent Stripe
   */
  async createDonation(
    tenantId: string,
    userId: string,
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
      const donation = await this.prisma.donation.create({
        data: {
          tenantId,
          userId,
          amount,
          currency,
          type: DonationType.PUNCTUAL,
          status: DonationStatus.PENDING,
          stripePaymentIntentId: paymentIntent.id,
          campaignId,
          purpose,
          isAnonymous,
          fiscalReceiptRequested: !isAnonymous,
          source,
          sourceUrl,
        },
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

      // Récupérer le PaymentIntent depuis Stripe via le service multi-tenant
      const paymentIntent = await this.multiTenantStripeService.getPaymentIntent(
        existingDonation.tenantId,
        paymentIntentId
      );

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('Le paiement n\'a pas réussi');
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

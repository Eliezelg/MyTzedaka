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
var DonationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const multi_tenant_stripe_service_1 = require("./multi-tenant-stripe.service");
const client_1 = require("@prisma/client");
let DonationService = DonationService_1 = class DonationService {
    constructor(prisma, multiTenantStripeService) {
        this.prisma = prisma;
        this.multiTenantStripeService = multiTenantStripeService;
        this.logger = new common_1.Logger(DonationService_1.name);
    }
    async createDonation(tenantId, userId, createDonationDto) {
        const { amount, currency = 'EUR', campaignId, donorEmail, donorName, isAnonymous = false, purpose, source = client_1.DonationSource.PLATFORM, sourceUrl, } = createDonationDto;
        if (amount < 0.5) {
            throw new common_1.BadRequestException('Le montant minimum est de 0.50€');
        }
        if (amount > 100000) {
            throw new common_1.BadRequestException('Le montant maximum est de 100,000€');
        }
        if (campaignId) {
            const campaign = await this.prisma.campaign.findFirst({
                where: { id: campaignId, tenantId },
            });
            if (!campaign) {
                throw new common_1.NotFoundException('Campagne non trouvée');
            }
            if (campaign.status !== 'ACTIVE') {
                throw new common_1.BadRequestException('Cette campagne n\'est plus active');
            }
        }
        try {
            const amountInCents = Math.round(amount * 100);
            const paymentIntent = await this.multiTenantStripeService.createPaymentIntent(tenantId, amount, currency.toLowerCase(), {
                userId,
                campaignId: campaignId || '',
                donorEmail: donorEmail || '',
                source,
                description: campaignId ?
                    `Donation pour campagne ${campaignId}` :
                    'Donation MyTzedaka',
            });
            const donation = await this.prisma.donation.create({
                data: {
                    tenantId,
                    userId,
                    amount,
                    currency,
                    type: client_1.DonationType.PUNCTUAL,
                    status: client_1.DonationStatus.PENDING,
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
            this.logger.log(`Donation created: ${donation.id} for ${amount}€ (PaymentIntent: ${paymentIntent.id})`);
            return {
                donation,
                paymentIntent,
                clientSecret: paymentIntent.client_secret,
            };
        }
        catch (error) {
            this.logger.error('Error creating donation:', error);
            throw error;
        }
    }
    async confirmDonation(paymentIntentId) {
        try {
            const existingDonation = await this.prisma.donation.findFirst({
                where: { stripePaymentIntentId: paymentIntentId },
                include: { tenant: true },
            });
            if (!existingDonation) {
                throw new common_1.NotFoundException('Donation non trouvée');
            }
            const paymentIntent = await this.multiTenantStripeService.getPaymentIntent(existingDonation.tenantId, paymentIntentId);
            if (paymentIntent.status !== 'succeeded') {
                throw new common_1.BadRequestException('Le paiement n\'a pas réussi');
            }
            const donation = await this.prisma.donation.update({
                where: { id: existingDonation.id },
                data: {
                    status: client_1.DonationStatus.COMPLETED,
                    paymentMethod: paymentIntent.payment_method_types[0] || 'card',
                },
                include: {
                    campaign: true,
                    tenant: true,
                },
            });
            if (donation.campaignId) {
                await this.prisma.campaign.update({
                    where: { id: donation.campaignId },
                    data: {
                        raised: {
                            increment: donation.amount,
                        },
                    },
                });
                this.logger.log(`Campaign ${donation.campaignId} raised amount updated (+${donation.amount}€)`);
            }
            this.logger.log(`Donation confirmed: ${donation.id} - ${donation.amount}€`);
            return donation;
        }
        catch (error) {
            this.logger.error(`Error confirming donation for PaymentIntent ${paymentIntentId}:`, error);
            throw error;
        }
    }
    async failDonation(paymentIntentId, reason) {
        try {
            const existingDonation = await this.prisma.donation.findFirst({
                where: { stripePaymentIntentId: paymentIntentId },
            });
            if (!existingDonation) {
                throw new common_1.NotFoundException('Donation non trouvée');
            }
            const donation = await this.prisma.donation.update({
                where: { id: existingDonation.id },
                data: {
                    status: client_1.DonationStatus.FAILED,
                },
                include: {
                    campaign: true,
                    tenant: true,
                },
            });
            this.logger.log(`Donation failed: ${donation.id} - Reason: ${reason || 'Unknown'}`);
            return donation;
        }
        catch (error) {
            this.logger.error(`Error failing donation for PaymentIntent ${paymentIntentId}:`, error);
            throw error;
        }
    }
    async getDonationHistory(userId, tenantId, limit = 20, offset = 0) {
        const where = { userId };
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
    async getCampaignDonations(campaignId, tenantId, limit = 50) {
        return this.prisma.donation.findMany({
            where: {
                campaignId,
                tenantId,
                status: client_1.DonationStatus.COMPLETED,
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
    async getCampaignDonationStats(campaignId, tenantId) {
        const stats = await this.prisma.donation.aggregate({
            where: {
                campaignId,
                tenantId,
                status: client_1.DonationStatus.COMPLETED,
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
};
exports.DonationService = DonationService;
exports.DonationService = DonationService = DonationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        multi_tenant_stripe_service_1.MultiTenantStripeService])
], DonationService);
//# sourceMappingURL=donation.service.js.map
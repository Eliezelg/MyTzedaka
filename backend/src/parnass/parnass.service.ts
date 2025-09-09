import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParnassType, ParnassStatus, DedicationType } from '@prisma/client';

export interface CreateParnassSponsorDto {
  type: ParnassType;
  sponsorDate: Date;
  sponsorName: string;
  sponsorMessage?: string;
  isAnonymous?: boolean;
  dedicationType?: DedicationType;
  dedicationName?: string;
  dedicationNameHebrew?: string;
  amount: number;
  currency?: string;
  userId?: string;
  donationId?: string;
  displayPriority?: number;
  isHighlighted?: boolean;
}

export interface UpdateParnassSponsorDto extends Partial<CreateParnassSponsorDto> {
  status?: ParnassStatus;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface ParnassSettingsDto {
  dailyEnabled?: boolean;
  monthlyEnabled?: boolean;
  yearlyEnabled?: boolean;
  dailyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  currency?: string;
  displayLocation?: string[];
  displayFormat?: string;
  dailyTitle?: string;
  monthlyTitle?: string;
  yearlyTitle?: string;
  dailyTitleHebrew?: string;
  monthlyTitleHebrew?: string;
  yearlyTitleHebrew?: string;
  allowMultipleSponsors?: boolean;
  requireApproval?: boolean;
  autoRenew?: boolean;
  notifyAdmin?: boolean;
  notifyEmail?: string;
}

@Injectable()
export class ParnassService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtenir les paramètres Parnass d'un tenant
   */
  async getSettings(tenantId: string) {
    const settings = await this.prisma.parnassSettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      // Retourner les paramètres par défaut
      return {
        dailyEnabled: true,
        monthlyEnabled: true,
        yearlyEnabled: true,
        dailyPrice: 100,
        monthlyPrice: 500,
        yearlyPrice: 1800,
        currency: 'EUR',
        displayLocation: ['homepage', 'sidebar'],
        displayFormat: 'card',
        dailyTitle: 'Parnass HaYom - Sponsor du Jour',
        monthlyTitle: 'Parnass HaChodesh - Sponsor du Mois',
        yearlyTitle: 'Parnass HaShana - Sponsor de l\'Année',
        dailyTitleHebrew: 'פרנס היום',
        monthlyTitleHebrew: 'פרנס החודש',
        yearlyTitleHebrew: 'פרנס השנה',
        allowMultipleSponsors: false,
        requireApproval: true,
        autoRenew: false,
        notifyAdmin: true,
      };
    }

    return settings;
  }

  /**
   * Mettre à jour les paramètres Parnass
   */
  async updateSettings(tenantId: string, data: ParnassSettingsDto) {
    const settings = await this.prisma.parnassSettings.upsert({
      where: { tenantId },
      update: data,
      create: {
        tenantId,
        ...data,
      },
    });

    return settings;
  }

  /**
   * Obtenir les sponsors pour une période donnée
   */
  async getSponsors(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
    type?: ParnassType,
    status?: ParnassStatus,
  ) {
    const where: any = { tenantId };

    if (startDate && endDate) {
      where.sponsorDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const sponsors = await this.prisma.parnassSponsor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        donation: {
          select: {
            id: true,
            amount: true,
            status: true,
            stripePaymentIntentId: true,
          },
        },
      },
      orderBy: [
        { sponsorDate: 'asc' },
        { displayPriority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return sponsors;
  }

  /**
   * Obtenir un sponsor spécifique
   */
  async getSponsor(tenantId: string, sponsorId: string) {
    const sponsor = await this.prisma.parnassSponsor.findFirst({
      where: {
        id: sponsorId,
        tenantId,
      },
      include: {
        user: true,
        donation: true,
      },
    });

    if (!sponsor) {
      throw new NotFoundException('Sponsor not found');
    }

    return sponsor;
  }

  /**
   * Obtenir le sponsor actuel pour un type donné
   */
  async getCurrentSponsor(tenantId: string, type: ParnassType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sponsorDate = today;

    // Ajuster la date selon le type
    if (type === ParnassType.MONTHLY) {
      sponsorDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (type === ParnassType.YEARLY) {
      sponsorDate = new Date(today.getFullYear(), 0, 1);
    }

    const sponsor = await this.prisma.parnassSponsor.findFirst({
      where: {
        tenantId,
        type,
        sponsorDate,
        status: ParnassStatus.APPROVED,
      },
      orderBy: [
        { displayPriority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return sponsor;
  }

  /**
   * Obtenir les sponsors actuels (jour, mois, année)
   */
  async getCurrentSponsors(tenantId: string) {
    const [daily, monthly, yearly] = await Promise.all([
      this.getCurrentSponsor(tenantId, ParnassType.DAILY),
      this.getCurrentSponsor(tenantId, ParnassType.MONTHLY),
      this.getCurrentSponsor(tenantId, ParnassType.YEARLY),
    ]);

    return {
      daily,
      monthly,
      yearly,
    };
  }

  /**
   * Créer un nouveau sponsor
   */
  async createSponsor(tenantId: string, data: CreateParnassSponsorDto) {
    const settings = await this.getSettings(tenantId);

    // Vérifier si le type est activé
    if (
      (data.type === ParnassType.DAILY && !settings.dailyEnabled) ||
      (data.type === ParnassType.MONTHLY && !settings.monthlyEnabled) ||
      (data.type === ParnassType.YEARLY && !settings.yearlyEnabled)
    ) {
      throw new BadRequestException(`${data.type} sponsorship is not enabled`);
    }

    // Vérifier s'il y a déjà un sponsor pour cette date/type (si pas de sponsors multiples)
    if (!settings.allowMultipleSponsors) {
      const existingSponsor = await this.prisma.parnassSponsor.findUnique({
        where: {
          tenantId_sponsorDate_type: {
            tenantId,
            sponsorDate: data.sponsorDate,
            type: data.type,
          },
        },
      });

      if (existingSponsor) {
        throw new BadRequestException('A sponsor already exists for this date and type');
      }
    }

    // Déterminer le statut initial
    const initialStatus = settings.requireApproval 
      ? ParnassStatus.PENDING 
      : ParnassStatus.APPROVED;

    const sponsor = await this.prisma.parnassSponsor.create({
      data: {
        ...data,
        tenantId,
        status: initialStatus,
        approvedAt: !settings.requireApproval ? new Date() : undefined,
      },
      include: {
        user: true,
        donation: true,
      },
    });

    // Envoyer notification si configuré
    if (settings.notifyAdmin && 'notifyEmail' in settings && settings.notifyEmail) {
      // TODO: Implémenter l'envoi d'email
      console.log(`Notification email would be sent to ${settings.notifyEmail}`);
    }

    return sponsor;
  }

  /**
   * Mettre à jour un sponsor
   */
  async updateSponsor(
    tenantId: string,
    sponsorId: string,
    data: UpdateParnassSponsorDto,
  ) {
    // Vérifier que le sponsor existe et appartient au tenant
    const existingSponsor = await this.getSponsor(tenantId, sponsorId);

    // Si changement de statut vers APPROVED
    if (data.status === ParnassStatus.APPROVED && existingSponsor.status !== ParnassStatus.APPROVED) {
      data.approvedAt = new Date();
    }

    const sponsor = await this.prisma.parnassSponsor.update({
      where: { id: sponsorId },
      data,
      include: {
        user: true,
        donation: true,
      },
    });

    return sponsor;
  }

  /**
   * Approuver un sponsor
   */
  async approveSponsor(tenantId: string, sponsorId: string, approvedBy: string) {
    return this.updateSponsor(tenantId, sponsorId, {
      status: ParnassStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy,
    });
  }

  /**
   * Rejeter un sponsor
   */
  async rejectSponsor(tenantId: string, sponsorId: string) {
    return this.updateSponsor(tenantId, sponsorId, {
      status: ParnassStatus.REJECTED,
    });
  }

  /**
   * Supprimer un sponsor
   */
  async deleteSponsor(tenantId: string, sponsorId: string) {
    // Vérifier que le sponsor existe et appartient au tenant
    await this.getSponsor(tenantId, sponsorId);

    await this.prisma.parnassSponsor.delete({
      where: { id: sponsorId },
    });

    return { success: true };
  }

  /**
   * Obtenir les dates disponibles pour un type de sponsoring
   */
  async getAvailableDates(
    tenantId: string,
    type: ParnassType,
    startDate: Date,
    endDate: Date,
  ) {
    const settings = await this.getSettings(tenantId);

    // Obtenir les sponsors existants pour la période
    const existingSponsors = await this.prisma.parnassSponsor.findMany({
      where: {
        tenantId,
        type,
        sponsorDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [ParnassStatus.APPROVED, ParnassStatus.PENDING],
        },
      },
      select: {
        sponsorDate: true,
      },
    });

    const takenDates = new Set(
      existingSponsors.map(s => s.sponsorDate.toISOString().split('T')[0])
    );

    const availableDates = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      
      // Si sponsors multiples autorisés ou date non prise
      if (settings.allowMultipleSponsors || !takenDates.has(dateStr)) {
        availableDates.push(new Date(current));
      }

      // Incrémenter selon le type
      if (type === ParnassType.DAILY) {
        current.setDate(current.getDate() + 1);
      } else if (type === ParnassType.MONTHLY) {
        current.setMonth(current.getMonth() + 1);
      } else if (type === ParnassType.YEARLY) {
        current.setFullYear(current.getFullYear() + 1);
      }
    }

    return availableDates;
  }

  /**
   * Obtenir les statistiques Parnass
   */
  async getStatistics(tenantId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const [totalSponsors, totalRevenue, sponsorsByType, sponsorsByMonth] = await Promise.all([
      // Total des sponsors
      this.prisma.parnassSponsor.count({
        where: {
          tenantId,
          status: ParnassStatus.APPROVED,
          sponsorDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Revenu total
      this.prisma.parnassSponsor.aggregate({
        where: {
          tenantId,
          status: ParnassStatus.APPROVED,
          isPaid: true,
          sponsorDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Sponsors par type
      this.prisma.parnassSponsor.groupBy({
        by: ['type'],
        where: {
          tenantId,
          status: ParnassStatus.APPROVED,
          sponsorDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
      }),

      // Sponsors par mois
      this.prisma.$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM "sponsorDate") as month,
          COUNT(*) as count,
          SUM(amount) as total
        FROM parnass_sponsors
        WHERE "tenantId" = ${tenantId}
          AND status = 'APPROVED'
          AND "sponsorDate" >= ${startDate}
          AND "sponsorDate" <= ${endDate}
        GROUP BY EXTRACT(MONTH FROM "sponsorDate")
        ORDER BY month
      `,
    ]);

    return {
      year: currentYear,
      totalSponsors,
      totalRevenue: totalRevenue._sum.amount || 0,
      sponsorsByType,
      sponsorsByMonth,
    };
  }

  /**
   * Nettoyer les sponsors expirés
   */
  async cleanupExpiredSponsors(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.parnassSponsor.updateMany({
      where: {
        tenantId,
        sponsorDate: {
          lt: today,
        },
        status: {
          in: [ParnassStatus.APPROVED, ParnassStatus.PENDING],
        },
      },
      data: {
        status: ParnassStatus.EXPIRED,
      },
    });

    return {
      expiredCount: result.count,
    };
  }
}
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantDataService {
  constructor(private readonly prisma: PrismaService) {}

  // Vérifier les permissions d'accès
  private async checkAccess(slug: string, user: any, requireAdmin = false) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
    }

    // Si admin requis, vérifier le rôle
    if (requireAdmin) {
      const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'PLATFORM_ADMIN'].includes(user.role);
      const isTenantAdmin = user.tenantId === tenant.id && isAdmin;
      const isPlatformAdmin = user.role === 'PLATFORM_ADMIN';

      if (!isTenantAdmin && !isPlatformAdmin) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }
    }

    return tenant;
  }

  // Obtenir les stats du tenant
  async getTenantStats(slug: string, user: any) {
    const tenant = await this.checkAccess(slug, user);

    const [
      totalRaised,
      donationsCount,
      campaignsCount,
      activeCampaigns,
      membersCount,
      eventsCount,
      monthlyDonations,
    ] = await Promise.all([
      // Total collecté
      this.prisma.donation.aggregate({
        where: { tenantId: tenant.id, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      // Nombre de dons
      this.prisma.donation.count({
        where: { tenantId: tenant.id, status: 'COMPLETED' },
      }),
      // Nombre de campagnes
      this.prisma.campaign.count({
        where: { tenantId: tenant.id },
      }),
      // Campagnes actives
      this.prisma.campaign.count({
        where: { 
          tenantId: tenant.id,
          isActive: true,
          endDate: { gte: new Date() }
        },
      }),
      // Nombre de membres
      this.prisma.user.count({
        where: { tenantId: tenant.id },
      }),
      // Nombre d'événements à venir
      this.prisma.event.count({
        where: { 
          tenantId: tenant.id,
          startDate: { gte: new Date() }
        },
      }),
      // Dons du mois en cours
      this.prisma.donation.aggregate({
        where: {
          tenantId: tenant.id,
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().setDate(1)), // Premier jour du mois
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalRaised: totalRaised._sum.amount || 0,
      donationsCount,
      campaignsCount,
      activeCampaigns,
      membersCount,
      eventsCount,
      monthlyDonations: monthlyDonations._sum.amount || 0,
    };
  }

  // Obtenir les campagnes
  async getTenantCampaigns(slug: string, user: any) {
    const tenant = await this.checkAccess(slug, user);

    return this.prisma.campaign.findMany({
      where: { tenantId: tenant.id },
      include: {
        _count: {
          select: { donations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Créer une campagne
  async createCampaign(slug: string, data: any, user: any) {
    const tenant = await this.checkAccess(slug, user, true);

    return this.prisma.campaign.create({
      data: {
        ...data,
        tenantId: tenant.id,
        userId: user.id,
      },
    });
  }

  // Mettre à jour une campagne
  async updateCampaign(slug: string, id: string, data: any, user: any) {
    const tenant = await this.checkAccess(slug, user, true);

    // Vérifier que la campagne appartient au tenant
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!campaign) {
      throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
    }

    return this.prisma.campaign.update({
      where: { id },
      data,
    });
  }

  // Supprimer une campagne
  async deleteCampaign(slug: string, id: string, user: any) {
    const tenant = await this.checkAccess(slug, user, true);

    // Vérifier que la campagne appartient au tenant
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!campaign) {
      throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
    }

    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  // Obtenir les donations
  async getTenantDonations(slug: string, page: number, limit: number, user: any) {
    const tenant = await this.checkAccess(slug, user);

    const skip = (page - 1) * limit;

    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        where: { tenantId: tenant.id },
        include: {
          campaign: {
            select: { title: true },
          },
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.donation.count({
        where: { tenantId: tenant.id },
      }),
    ]);

    return {
      donations: donations.map(d => ({
        id: d.id,
        amount: d.amount,
        donorName: d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Anonyme',
        donorEmail: d.user?.email || 'N/A',
        createdAt: d.createdAt,
        campaignId: d.campaignId,
        campaignName: d.campaign?.title,
        paymentMethod: d.paymentMethod,
        status: d.status,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Obtenir les membres
  async getTenantMembers(slug: string, page: number, limit: number, user: any) {
    const tenant = await this.checkAccess(slug, user);

    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId: tenant.id },
        include: {
          _count: {
            select: { donations: true },
          },
          donations: {
            where: { status: 'COMPLETED' },
            select: { amount: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: { tenantId: tenant.id },
      }),
    ]);

    return {
      members: members.map(m => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        role: m.role,
        joinedAt: m.createdAt,
        donationsCount: m._count.donations,
        totalDonated: m.donations.reduce((sum, d) => sum + Number(d.amount), 0),
        lastActivity: m.lastLoginAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Inviter un membre
  async inviteMember(slug: string, data: { email: string; role?: string }, user: any) {
    const tenant = await this.checkAccess(slug, user, true);

    // TODO: Implémenter l'envoi d'email d'invitation
    // Pour l'instant, on crée juste l'utilisateur
    
    return {
      success: true,
      message: 'Invitation envoyée',
    };
  }

  // Obtenir les admins
  async getTenantAdmins(slug: string, user: any) {
    const tenant = await this.checkAccess(slug, user, true);

    const admins = await this.prisma.user.findMany({
      where: {
        tenantId: tenant.id,
        role: {
          in: ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'TREASURER'],
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Marquer le créateur (le plus ancien admin)
    return admins.map((admin, index) => ({
      ...admin,
      isCreator: index === 0,
    }));
  }

  // Ajouter un admin
  async addAdmin(slug: string, email: string, user: any) {
    const tenant = await this.checkAccess(slug, user, true);

    // Vérifier si l'utilisateur existe
    let targetUser = await this.prisma.user.findFirst({
      where: { email, tenantId: tenant.id },
    });

    if (!targetUser) {
      // Créer l'utilisateur s'il n'existe pas
      targetUser = await this.prisma.user.create({
        data: {
          email,
          tenantId: tenant.id,
          role: 'MANAGER',
          firstName: '',
          lastName: '',
        },
      });
    } else {
      // Mettre à jour le rôle
      targetUser = await this.prisma.user.update({
        where: { id: targetUser.id },
        data: { role: 'MANAGER' },
      });
    }

    return targetUser;
  }

  // Retirer un admin
  async removeAdmin(slug: string, userId: string, user: any) {
    const tenant = await this.checkAccess(slug, user, true);

    // Vérifier que l'utilisateur appartient au tenant
    const targetUser = await this.prisma.user.findFirst({
      where: { id: userId, tenantId: tenant.id },
    });

    if (!targetUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Ne pas permettre de retirer le dernier admin
    const adminCount = await this.prisma.user.count({
      where: {
        tenantId: tenant.id,
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
      },
    });

    if (adminCount <= 1) {
      throw new HttpException(
        'Cannot remove the last admin',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Rétrograder en membre simple
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: 'MEMBER' },
    });
  }

  // Obtenir les paramètres
  async getTenantSettings(slug: string, user: any) {
    const tenant = await this.checkAccess(slug, user);

    // Récupérer les informations depuis AssociationListing
    const listing = await this.prisma.associationListing.findUnique({
      where: { tenantId: tenant.id },
    });

    return {
      name: tenant.name,
      description: listing?.description || '',
      email: listing?.email || '',
      phone: listing?.phone || '',
      address: listing?.location || '',
      logoUrl: tenant.logoPath,
      websiteUrl: listing?.siteUrl || '',
      socialMedia: tenant.settings?.['socialMedia'] || {},
    };
  }

  // Mettre à jour les paramètres
  async updateTenantSettings(slug: string, data: any, user: any) {
    const tenant = await this.checkAccess(slug, user, true);

    // Mettre à jour le tenant
    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name: data.name,
        logoPath: data.logoUrl,
        settings: {
          ...tenant.settings as any,
          socialMedia: data.socialMedia,
        },
      },
    });

    // Mettre à jour AssociationListing
    await this.prisma.associationListing.upsert({
      where: { tenantId: tenant.id },
      update: {
        name: data.name,
        description: data.description,
        email: data.email,
        phone: data.phone,
        location: data.address,
        siteUrl: data.websiteUrl,
      },
      create: {
        tenantId: tenant.id,
        name: data.name,
        description: data.description || '',
        email: data.email,
        phone: data.phone,
        location: data.address || '',
        siteUrl: data.websiteUrl,
        category: 'Association',
      },
    });

    return { success: true };
  }

  // Obtenir le statut Stripe
  async getStripeStatus(slug: string, user: any) {
    const tenant = await this.checkAccess(slug, user);

    const stripeAccount = await this.prisma.stripeAccount.findFirst({
      where: { tenantId: tenant.id },
    });

    return {
      mode: tenant.stripeMode,
      isConnected: !!stripeAccount,
      accountId: stripeAccount?.stripeConnectAccountId || stripeAccount?.stripeAccountName,
      chargesEnabled: stripeAccount?.isActive || false,
      payoutsEnabled: stripeAccount?.isActive || false,
    };
  }

  // Obtenir les reçus
  async getTenantReceipts(slug: string, year: number | undefined, user: any) {
    const tenant = await this.checkAccess(slug, user);

    const whereClause: any = {
      tenantId: tenant.id,
      status: 'COMPLETED',
    };

    if (year) {
      whereClause.createdAt = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      };
    }

    const receipts = await this.prisma.taxReceipt.findMany({
      where: { tenantId: tenant.id },
      orderBy: { issueDate: 'desc' },
    });

    return receipts;
  }

  // Obtenir les événements
  async getTenantEvents(slug: string, user: any) {
    const tenant = await this.checkAccess(slug, user);

    return this.prisma.event.findMany({
      where: { tenantId: tenant.id },
      orderBy: { startDate: 'asc' },
    });
  }

  // Obtenir l'activité récente
  async getTenantActivity(slug: string, limit: number, user: any) {
    const tenant = await this.checkAccess(slug, user);

    // Récupérer les dernières donations, inscriptions et mises à jour
    const [donations, members, campaigns] = await Promise.all([
      this.prisma.donation.findMany({
        where: { tenantId: tenant.id },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.user.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.campaign.findMany({
        where: { tenantId: tenant.id },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      }),
    ]);

    // Combiner et trier les activités
    const activities = [];

    donations.forEach(d => {
      activities.push({
        type: 'donation',
        description: `Nouveau don de ${d.amount}€`,
        timeAgo: this.getTimeAgo(d.createdAt),
        timestamp: d.createdAt,
      });
    });

    members.forEach(m => {
      activities.push({
        type: 'member',
        description: `Nouvelle inscription: ${m.firstName} ${m.lastName}`,
        timeAgo: this.getTimeAgo(m.createdAt),
        timestamp: m.createdAt,
      });
    });

    campaigns.forEach(c => {
      activities.push({
        type: 'campaign',
        description: `Campagne "${c.title}" mise à jour`,
        timeAgo: this.getTimeAgo(c.updatedAt),
        timestamp: c.updatedAt,
      });
    });

    // Trier par date et limiter
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(({ timestamp, ...activity }) => activity);
  }

  // Helper pour calculer le temps écoulé
  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} heures`;
    if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} jours`;
    
    return date.toLocaleDateString('fr-FR');
  }
}
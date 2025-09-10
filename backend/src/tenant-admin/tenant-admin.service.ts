import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { Prisma, PageType } from '@prisma/client';

@Injectable()
export class TenantAdminService {
  constructor(private prisma: PrismaService) {}

  // ========== THEME METHODS ==========
  async getTheme(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { theme: true }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant.theme || {};
  }

  async updateTheme(tenantId: string, updateThemeDto: UpdateThemeDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        theme: updateThemeDto.theme as Prisma.JsonObject
      }
    });

    return { success: true, theme: updatedTenant.theme };
  }

  async resetTheme(tenantId: string) {
    const defaultTheme = {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      borderRadius: '0.5rem',
      fontFamily: 'Inter, sans-serif'
    };

    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        theme: defaultTheme as Prisma.JsonObject
      }
    });

    return { success: true, theme: updatedTenant.theme };
  }

  // ========== PAGES METHODS ==========
  async getPages(tenantId: string) {
    return this.prisma.page.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPage(tenantId: string, pageId: string) {
    const page = await this.prisma.page.findFirst({
      where: {
        id: pageId,
        tenantId
      }
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async createPage(tenantId: string, userId: string, createPageDto: CreatePageDto) {
    // Check if slug already exists for this tenant
    const existingPage = await this.prisma.page.findFirst({
      where: {
        tenantId,
        slug: createPageDto.slug
      }
    });

    if (existingPage) {
      throw new BadRequestException('A page with this slug already exists');
    }

    // Set SEO metadata
    const seo = {
      title: createPageDto.metaTitle || createPageDto.title,
      description: createPageDto.metaDescription || ''
    };

    return this.prisma.page.create({
      data: {
        tenantId,
        authorId: userId,
        title: createPageDto.title,
        slug: createPageDto.slug,
        type: PageType.CUSTOM,
        content: createPageDto.content as Prisma.JsonObject,
        seo: seo as Prisma.JsonObject,
        isActive: createPageDto.isActive ?? false,
        status: createPageDto.status ?? 'DRAFT',
        tags: createPageDto.tags || []
      }
    });
  }

  async updatePage(tenantId: string, pageId: string, updatePageDto: UpdatePageDto) {
    const page = await this.getPage(tenantId, pageId);

    // Check if new slug conflicts with existing page
    if (updatePageDto.slug && updatePageDto.slug !== page.slug) {
      const existingPage = await this.prisma.page.findFirst({
        where: {
          tenantId,
          slug: updatePageDto.slug,
          NOT: { id: pageId }
        }
      });

      if (existingPage) {
        throw new BadRequestException('A page with this slug already exists');
      }
    }

    // Update SEO if provided
    let seo = page.seo as any;
    if (updatePageDto.metaTitle !== undefined || updatePageDto.metaDescription !== undefined) {
      seo = {
        ...seo,
        title: updatePageDto.metaTitle ?? seo.title,
        description: updatePageDto.metaDescription ?? seo.description
      };
    }

    return this.prisma.page.update({
      where: { id: pageId },
      data: {
        title: updatePageDto.title,
        slug: updatePageDto.slug,
        content: updatePageDto.content as Prisma.JsonObject,
        seo: seo as Prisma.JsonObject,
        isActive: updatePageDto.isActive,
        status: updatePageDto.status,
        tags: updatePageDto.tags,
        updatedAt: new Date()
      }
    });
  }

  async deletePage(tenantId: string, pageId: string) {
    await this.getPage(tenantId, pageId);

    await this.prisma.page.delete({
      where: { id: pageId }
    });

    return { success: true, message: 'Page deleted successfully' };
  }

  async publishPage(tenantId: string, pageId: string, publish: boolean) {
    await this.getPage(tenantId, pageId);

    return this.prisma.page.update({
      where: { id: pageId },
      data: {
        isActive: publish,
        status: publish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: publish ? new Date() : null
      }
    });
  }

  // ========== CAMPAIGNS METHODS ==========
  async getCampaigns(tenantId: string) {
    return this.prisma.campaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCampaign(tenantId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        tenantId
      }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async createCampaign(tenantId: string, userId: string, createCampaignDto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        tenantId,
        userId,
        title: createCampaignDto.title,
        description: createCampaignDto.description,
        shortDescription: createCampaignDto.shortDescription,
        goal: createCampaignDto.goal,
        currency: createCampaignDto.currency || 'EUR',
        coverImage: createCampaignDto.coverImage,
        images: createCampaignDto.images || [],
        videoUrl: createCampaignDto.videoUrl,
        startDate: createCampaignDto.startDate ? new Date(createCampaignDto.startDate) : new Date(),
        endDate: createCampaignDto.endDate ? new Date(createCampaignDto.endDate) : undefined,
        status: createCampaignDto.status ?? 'ACTIVE',
        isActive: createCampaignDto.isActive ?? true,
        isUrgent: createCampaignDto.isUrgent ?? false,
        isPublic: createCampaignDto.isPublic ?? true,
        category: createCampaignDto.category,
        tags: createCampaignDto.tags || []
      }
    });
  }

  async updateCampaign(tenantId: string, campaignId: string, updateCampaignDto: UpdateCampaignDto) {
    await this.getCampaign(tenantId, campaignId);

    const updateData: any = {};

    // Only add fields that are defined in the DTO
    if (updateCampaignDto.title !== undefined) updateData.title = updateCampaignDto.title;
    if (updateCampaignDto.description !== undefined) updateData.description = updateCampaignDto.description;
    if (updateCampaignDto.shortDescription !== undefined) updateData.shortDescription = updateCampaignDto.shortDescription;
    if (updateCampaignDto.goal !== undefined) updateData.goal = updateCampaignDto.goal;
    if (updateCampaignDto.currency !== undefined) updateData.currency = updateCampaignDto.currency;
    if (updateCampaignDto.coverImage !== undefined) updateData.coverImage = updateCampaignDto.coverImage;
    if (updateCampaignDto.images !== undefined) updateData.images = updateCampaignDto.images;
    if (updateCampaignDto.videoUrl !== undefined) updateData.videoUrl = updateCampaignDto.videoUrl;
    if (updateCampaignDto.startDate !== undefined) updateData.startDate = new Date(updateCampaignDto.startDate);
    if (updateCampaignDto.endDate !== undefined) updateData.endDate = new Date(updateCampaignDto.endDate);
    if (updateCampaignDto.status !== undefined) updateData.status = updateCampaignDto.status;
    if (updateCampaignDto.isActive !== undefined) updateData.isActive = updateCampaignDto.isActive;
    if (updateCampaignDto.isUrgent !== undefined) updateData.isUrgent = updateCampaignDto.isUrgent;
    if (updateCampaignDto.isPublic !== undefined) updateData.isPublic = updateCampaignDto.isPublic;
    if (updateCampaignDto.category !== undefined) updateData.category = updateCampaignDto.category;
    if (updateCampaignDto.tags !== undefined) updateData.tags = updateCampaignDto.tags;

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: updateData
    });
  }

  async deleteCampaign(tenantId: string, campaignId: string) {
    await this.getCampaign(tenantId, campaignId);

    await this.prisma.campaign.delete({
      where: { id: campaignId }
    });

    return { success: true, message: 'Campaign deleted successfully' };
  }

  // ========== DONATIONS METHODS ==========
  async getDonations(tenantId: string, filters?: { 
    startDate?: string; 
    endDate?: string; 
    status?: string;
    campaignId?: string;
  }) {
    const where: any = { tenantId };

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.campaignId) {
      where.campaignId = filters.campaignId;
    }

    return this.prisma.donation.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        campaign: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDonationStats(tenantId: string, period?: string) {
    const now = new Date();
    let startDate = new Date();

    // Set start date based on period
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default to last month
    }

    // Get donations for the period
    const donations = await this.prisma.donation.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: now
        },
        status: 'COMPLETED'
      }
    });

    // Calculate statistics
    const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    const totalDonations = donations.length;
    const uniqueDonors = new Set(donations.map(d => d.userId)).size;
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

    // Get previous period for growth calculation
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);

    const previousDonations = await this.prisma.donation.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        },
        status: 'COMPLETED'
      }
    });

    const previousTotal = previousDonations.reduce((sum, d) => sum + Number(d.amount), 0);
    const monthlyGrowth = previousTotal > 0 
      ? ((totalAmount - previousTotal) / previousTotal) * 100 
      : 0;

    // Get top campaign
    const campaignDonations = await this.prisma.donation.groupBy({
      by: ['campaignId'],
      where: {
        tenantId,
        campaignId: { not: null },
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 1
    });

    let topCampaign = 'Aucune campagne';
    if (campaignDonations.length > 0 && campaignDonations[0].campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignDonations[0].campaignId },
        select: { title: true }
      });
      topCampaign = campaign?.title || 'Campagne inconnue';
    }

    // Calculate recurring percentage
    const recurringDonations = donations.filter(d => d.isRecurring).length;
    const recurringPercentage = totalDonations > 0 
      ? (recurringDonations / totalDonations) * 100 
      : 0;

    return {
      totalAmount,
      totalDonations,
      uniqueDonors,
      averageDonation,
      monthlyGrowth: Math.round(monthlyGrowth),
      topCampaign,
      recurringPercentage: Math.round(recurringPercentage)
    };
  }

  async getTopDonors(tenantId: string, limit: number = 5) {
    const donations = await this.prisma.donation.groupBy({
      by: ['userId'],
      where: {
        tenantId,
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: limit
    });

    // Get user details for top donors
    const topDonors = await Promise.all(
      donations.map(async (d) => {
        const user = await this.prisma.user.findUnique({
          where: { id: d.userId },
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        });

        return {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          totalAmount: Number(d._sum.amount)
        };
      })
    );

    return topDonors;
  }
}

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreatePageDto, 
  UpdatePageDto, 
  PageResponseDto, 
  PageListQueryDto,
  PageStatus,
  PageType,
  UpdateNavigationDto,
  NavigationItemDto
} from './dto/page-management.dto';

@Injectable()
export class PageManagementService {
  constructor(private prisma: PrismaService) {}

  async createPage(tenantId: string, createPageDto: CreatePageDto): Promise<PageResponseDto> {
    // Check if slug already exists for this tenant
    const existingPage = await this.prisma.page.findFirst({
      where: {
        tenantId,
        slug: createPageDto.slug
      }
    });

    if (existingPage) {
      throw new ConflictException(`Page with slug "${createPageDto.slug}" already exists`);
    }

    const page = await this.prisma.page.create({
      data: {
        tenantId,
        title: createPageDto.title,
        slug: createPageDto.slug,
        type: createPageDto.type,
        content: createPageDto.content || '',
        isActive: createPageDto.isActive ?? false,
        status: createPageDto.status || PageStatus.DRAFT,
        seo: createPageDto.seo ? JSON.stringify(createPageDto.seo) : '{}',
        settings: createPageDto.settings ? JSON.stringify({
          showInNavbar: true,
          showInFooter: false,
          requireAuth: false,
          navOrder: 999,
          ...createPageDto.settings
        }) : JSON.stringify({
          showInNavbar: true,
          showInFooter: false,
          requireAuth: false,
          navOrder: 999
        }),
        tags: createPageDto.tags || [],
        views: 0,
        publishedAt: createPageDto.status === PageStatus.PUBLISHED ? new Date() : null
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // If page is active and should show in navigation, update navigation
    const settings = typeof page.settings === 'string' ? JSON.parse(page.settings) : page.settings;
    if (page.isActive && settings?.showInNavbar) {
      await this.updateTenantNavigation(tenantId);
    }

    return this.formatPageResponse(page);
  }

  async updatePage(
    tenantId: string, 
    pageId: string, 
    updatePageDto: UpdatePageDto
  ): Promise<PageResponseDto> {
    const existingPage = await this.prisma.page.findFirst({
      where: {
        id: pageId,
        tenantId
      }
    });

    if (!existingPage) {
      throw new NotFoundException('Page not found');
    }

    // Check if slug is being changed and if new slug already exists
    if (updatePageDto.slug && updatePageDto.slug !== existingPage.slug) {
      const slugExists = await this.prisma.page.findFirst({
        where: {
          tenantId,
          slug: updatePageDto.slug,
          id: { not: pageId }
        }
      });

      if (slugExists) {
        throw new ConflictException(`Page with slug "${updatePageDto.slug}" already exists`);
      }
    }

    const wasPublished = existingPage.status === PageStatus.PUBLISHED;
    const isNowPublished = updatePageDto.status === PageStatus.PUBLISHED;

    const page = await this.prisma.page.update({
      where: { id: pageId },
      data: {
        ...updatePageDto,
        seo: updatePageDto.seo ? JSON.stringify(updatePageDto.seo) : undefined,
        settings: updatePageDto.settings ? JSON.stringify(updatePageDto.settings) : undefined,
        publishedAt: !wasPublished && isNowPublished ? new Date() : existingPage.publishedAt,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Update navigation if visibility settings changed
    const existingSettings = typeof existingPage.settings === 'string' ? JSON.parse(existingPage.settings) : existingPage.settings;
    const pageSettings = typeof page.settings === 'string' ? JSON.parse(page.settings) : page.settings;
    const navSettingsChanged = 
      existingPage.isActive !== page.isActive ||
      existingSettings?.showInNavbar !== pageSettings?.showInNavbar ||
      existingSettings?.showInFooter !== pageSettings?.showInFooter;

    if (navSettingsChanged) {
      await this.updateTenantNavigation(tenantId);
    }

    return this.formatPageResponse(page);
  }

  async deletePage(tenantId: string, pageId: string): Promise<void> {
    const page = await this.prisma.page.findFirst({
      where: {
        id: pageId,
        tenantId
      }
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    await this.prisma.page.delete({
      where: { id: pageId }
    });

    // Update navigation after deletion
    await this.updateTenantNavigation(tenantId);
  }

  async getPages(tenantId: string, query: PageListQueryDto): Promise<{
    pages: PageResponseDto[];
    total: number;
    hasMore: boolean;
  }> {
    const where: any = { tenantId };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } }
      ];
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    const [pages, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc'
        },
        take: query.limit || 20,
        skip: query.offset || 0
      }),
      this.prisma.page.count({ where })
    ]);

    return {
      pages: pages.map(page => this.formatPageResponse(page)),
      total,
      hasMore: query.offset + query.limit < total
    };
  }

  async getPageBySlug(tenantId: string, slug: string): Promise<PageResponseDto> {
    const page = await this.prisma.page.findFirst({
      where: {
        tenantId,
        slug,
        isActive: true,
        status: PageStatus.PUBLISHED
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Increment view count
    await this.prisma.page.update({
      where: { id: page.id },
      data: { views: { increment: 1 } }
    });

    return this.formatPageResponse(page);
  }

  async togglePageStatus(tenantId: string, pageId: string): Promise<PageResponseDto> {
    const page = await this.prisma.page.findFirst({
      where: {
        id: pageId,
        tenantId
      }
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const updatedPage = await this.prisma.page.update({
      where: { id: pageId },
      data: {
        isActive: !page.isActive,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Update navigation when page activation changes
    await this.updateTenantNavigation(tenantId);

    return this.formatPageResponse(updatedPage);
  }

  async getActiveNavigation(tenantId: string): Promise<{
    mainMenu: NavigationItemDto[];
    footerMenu: NavigationItemDto[];
    mobileMenu: NavigationItemDto[];
  }> {
    // Get all active pages that should appear in navigation
    const pages = await this.prisma.page.findMany({
      where: {
        tenantId,
        isActive: true,
        status: PageStatus.PUBLISHED
      },
      orderBy: [
        // Sort by creation date as JSON fields can't be sorted directly
        { createdAt: 'asc' }
      ]
    });

    const mainMenu: NavigationItemDto[] = [];
    const footerMenu: NavigationItemDto[] = [];

    // Default menu items (always present)
    mainMenu.push(
      { label: 'Accueil', path: '/', icon: 'Home', order: 0 },
      { label: 'Associations', path: '/associations', icon: 'Users', order: 1 },
      { label: 'Campagnes', path: '/campaigns', icon: 'TrendingUp', order: 2 }
    );

    // Add dynamic pages to navigation
    pages.forEach((page) => {
      const settings = typeof page.settings === 'string' ? JSON.parse(page.settings) : page.settings;
      const navItem: NavigationItemDto = {
        label: page.title,
        path: `/pages/${page.slug}`,
        icon: settings?.icon,
        order: settings?.navOrder || 999,
        requireAuth: settings?.requireAuth || false
      };

      if (settings?.showInNavbar) {
        mainMenu.push(navItem);
      }

      if (settings?.showInFooter) {
        footerMenu.push(navItem);
      }
    });

    // Sort by order
    mainMenu.sort((a, b) => (a.order || 999) - (b.order || 999));
    footerMenu.sort((a, b) => (a.order || 999) - (b.order || 999));

    // Mobile menu is same as main menu but with additional items
    const mobileMenu = [...mainMenu];

    return {
      mainMenu,
      footerMenu,
      mobileMenu
    };
  }

  async updateNavigation(
    tenantId: string, 
    updateNavigationDto: UpdateNavigationDto
  ): Promise<void> {
    // Store custom navigation configuration
    await this.prisma.tenantSettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        navigation: JSON.stringify(updateNavigationDto)
      },
      update: {
        navigation: JSON.stringify(updateNavigationDto),
        updatedAt: new Date()
      }
    });
  }

  private async updateTenantNavigation(tenantId: string): Promise<void> {
    // This method can trigger a webhook or event to update frontend navigation
    // For now, we'll just log it
    console.log(`Navigation updated for tenant: ${tenantId}`);
    
    // You could emit an event here
    // this.eventEmitter.emit('navigation.updated', { tenantId });
  }

  private formatPageResponse(page: any): PageResponseDto {
    return {
      id: page.id,
      tenantId: page.tenantId,
      title: page.title,
      slug: page.slug,
      type: page.type,
      content: page.content,
      isActive: page.isActive,
      status: page.status,
      seo: typeof page.seo === 'string' ? JSON.parse(page.seo) : (page.seo || {}),
      settings: typeof page.settings === 'string' ? JSON.parse(page.settings) : (page.settings || {}),
      tags: page.tags || [],
      views: page.views,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      publishedAt: page.publishedAt,
      author: page.author ? {
        id: page.author.id,
        name: `${page.author.firstName} ${page.author.lastName}`
      } : undefined
    };
  }

  // Page templates for different types
  async getPageTemplates(type: PageType): Promise<any[]> {
    const templates = {
      [PageType.STATIC]: [
        { id: 'default', name: 'Page par défaut', preview: '/templates/static-default.png' },
        { id: 'hero', name: 'Page avec Hero', preview: '/templates/static-hero.png' },
        { id: 'sidebar', name: 'Page avec sidebar', preview: '/templates/static-sidebar.png' }
      ],
      [PageType.BLOG]: [
        { id: 'grid', name: 'Grille d\'articles', preview: '/templates/blog-grid.png' },
        { id: 'list', name: 'Liste d\'articles', preview: '/templates/blog-list.png' },
        { id: 'magazine', name: 'Style magazine', preview: '/templates/blog-magazine.png' }
      ],
      [PageType.GALLERY]: [
        { id: 'masonry', name: 'Galerie Masonry', preview: '/templates/gallery-masonry.png' },
        { id: 'grid', name: 'Galerie en grille', preview: '/templates/gallery-grid.png' },
        { id: 'carousel', name: 'Carousel', preview: '/templates/gallery-carousel.png' }
      ],
      [PageType.EVENTS]: [
        { id: 'calendar', name: 'Calendrier', preview: '/templates/events-calendar.png' },
        { id: 'list', name: 'Liste d\'événements', preview: '/templates/events-list.png' },
        { id: 'timeline', name: 'Timeline', preview: '/templates/events-timeline.png' }
      ],
      [PageType.FAQ]: [
        { id: 'accordion', name: 'Accordéon', preview: '/templates/faq-accordion.png' },
        { id: 'categories', name: 'Par catégories', preview: '/templates/faq-categories.png' }
      ],
      [PageType.CONTACT]: [
        { id: 'default', name: 'Formulaire standard', preview: '/templates/contact-default.png' },
        { id: 'map', name: 'Avec carte', preview: '/templates/contact-map.png' }
      ]
    };

    return templates[type] || [];
  }
}
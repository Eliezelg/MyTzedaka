import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('api/tenant/:tenantId/pages')
export class PagesPublicController {
  constructor(private prisma: PrismaService) {}

  @Get(':slug')
  @Public()
  async getPage(
    @Param('tenantId') tenantId: string,
    @Param('slug') slug: string
  ) {
    const page = await this.prisma.page.findFirst({
      where: {
        tenantId,
        slug,
        isActive: true,
        status: 'PUBLISHED'
      },
      include: {
        widgets: {
          where: {
            isVisible: true
          },
          orderBy: [
            { column: 'asc' },
            { position: 'asc' }
          ]
        }
      }
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    return page;
  }

  @Get(':slug/widgets')
  @Public()
  async getPageWidgets(
    @Param('tenantId') tenantId: string,
    @Param('slug') slug: string
  ) {
    const page = await this.prisma.page.findFirst({
      where: {
        tenantId,
        slug,
        isActive: true,
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        widgets: {
          where: {
            isVisible: true
          },
          orderBy: [
            { column: 'asc' },
            { position: 'asc' }
          ]
        }
      }
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    return page.widgets;
  }
}

@Controller('api/pages')
export class PageWidgetsPublicController {
  constructor(private prisma: PrismaService) {}

  @Get(':pageId/widgets')
  @Public()
  async getWidgets(@Param('pageId') pageId: string) {
    const page = await this.prisma.page.findUnique({
      where: { 
        id: pageId,
        isActive: true,
        status: 'PUBLISHED'
      }
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    const widgets = await this.prisma.pageWidget.findMany({
      where: {
        pageId,
        isVisible: true
      },
      orderBy: [
        { column: 'asc' },
        { position: 'asc' }
      ]
    });

    return widgets;
  }
}
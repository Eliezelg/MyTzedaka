import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { PageWidgetsService, CreateWidgetDto, UpdateWidgetDto } from './page-widgets.service';

@Controller('api/admin/pages/:pageId/widgets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')
export class PageWidgetsController {
  constructor(private readonly widgetsService: PageWidgetsService) {}

  // Obtenir tous les widgets d'une page
  @Get()
  async getPageWidgets(@Param('pageId') pageId: string) {
    return this.widgetsService.getPageWidgets(pageId);
  }

  // Obtenir les types de widgets disponibles
  @Get('types')
  getAvailableWidgetTypes() {
    return this.widgetsService.getAvailableWidgetTypes();
  }

  // Ajouter un widget
  @Post()
  async addWidget(
    @Param('pageId') pageId: string,
    @Body() data: CreateWidgetDto
  ) {
    return this.widgetsService.addWidget(pageId, data);
  }

  // Mettre à jour un widget
  @Put(':widgetId')
  async updateWidget(
    @Param('widgetId') widgetId: string,
    @Body() data: UpdateWidgetDto
  ) {
    return this.widgetsService.updateWidget(widgetId, data);
  }

  // Supprimer un widget
  @Delete(':widgetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWidget(@Param('widgetId') widgetId: string) {
    await this.widgetsService.deleteWidget(widgetId);
  }

  // Dupliquer un widget
  @Post(':widgetId/duplicate')
  async duplicateWidget(@Param('widgetId') widgetId: string) {
    return this.widgetsService.duplicateWidget(widgetId);
  }

  // Réorganiser les widgets
  @Post('reorder')
  async reorderWidgets(
    @Param('pageId') pageId: string,
    @Body() data: { widgets: Array<{ id: string; position: number; column?: number }> }
  ) {
    // Mettre à jour les positions de tous les widgets
    for (const widget of data.widgets) {
      await this.widgetsService.updateWidget(widget.id, {
        position: widget.position,
        column: widget.column
      });
    }
    
    return { success: true };
  }
}
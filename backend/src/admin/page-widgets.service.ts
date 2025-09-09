import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateWidgetDto {
  widgetType: string;
  position?: number;
  column?: number;
  config?: any;
  title?: string;
  showTitle?: boolean;
  cssClass?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  isVisible?: boolean;
}

export interface UpdateWidgetDto extends Partial<CreateWidgetDto> {
  position?: number;
}

export interface ReorderWidgetDto {
  widgetId: string;
  newPosition: number;
  newColumn?: number;
}

@Injectable()
export class PageWidgetsService {
  constructor(private prisma: PrismaService) {}

  // Obtenir tous les widgets d'une page
  async getPageWidgets(pageId: string) {
    return this.prisma.pageWidget.findMany({
      where: { pageId },
      orderBy: [
        { column: 'asc' },
        { position: 'asc' }
      ]
    });
  }

  // Ajouter un widget à une page
  async addWidget(pageId: string, data: CreateWidgetDto) {
    // Vérifier que la page existe
    const page = await this.prisma.page.findUnique({
      where: { id: pageId }
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    // Déterminer la position si non fournie
    let position = data.position;
    if (position === undefined) {
      const lastWidget = await this.prisma.pageWidget.findFirst({
        where: { 
          pageId,
          column: data.column || 1
        },
        orderBy: { position: 'desc' }
      });
      position = lastWidget ? lastWidget.position + 1 : 0;
    }

    // Configuration par défaut selon le type de widget
    const defaultConfig = this.getDefaultConfig(data.widgetType);
    const config = { ...defaultConfig, ...data.config };

    return this.prisma.pageWidget.create({
      data: {
        pageId,
        widgetType: data.widgetType,
        position,
        column: data.column || 1,
        config,
        title: data.title,
        showTitle: data.showTitle ?? true,
        cssClass: data.cssClass,
        backgroundColor: data.backgroundColor,
        padding: data.padding,
        margin: data.margin,
        isVisible: data.isVisible ?? true
      }
    });
  }

  // Mettre à jour un widget
  async updateWidget(widgetId: string, data: UpdateWidgetDto) {
    const widget = await this.prisma.pageWidget.findUnique({
      where: { id: widgetId }
    });

    if (!widget) {
      throw new NotFoundException('Widget non trouvé');
    }

    // Si on change la position, réorganiser les autres widgets
    if (data.position !== undefined && data.position !== widget.position) {
      await this.reorderWidgets(widget.pageId, widgetId, data.position, widget.column);
    }

    return this.prisma.pageWidget.update({
      where: { id: widgetId },
      data: {
        ...data,
        config: data.config ? { ...widget.config as object, ...data.config } : undefined
      }
    });
  }

  // Supprimer un widget
  async deleteWidget(widgetId: string) {
    const widget = await this.prisma.pageWidget.findUnique({
      where: { id: widgetId }
    });

    if (!widget) {
      throw new NotFoundException('Widget non trouvé');
    }

    // Supprimer le widget
    await this.prisma.pageWidget.delete({
      where: { id: widgetId }
    });

    // Réorganiser les positions
    await this.prisma.pageWidget.updateMany({
      where: {
        pageId: widget.pageId,
        column: widget.column,
        position: { gt: widget.position }
      },
      data: {
        position: { decrement: 1 }
      }
    });

    return { success: true };
  }

  // Réorganiser les widgets
  async reorderWidgets(pageId: string, widgetId: string, newPosition: number, column: number) {
    const widget = await this.prisma.pageWidget.findUnique({
      where: { id: widgetId }
    });

    if (!widget) return;

    const oldPosition = widget.position;
    const oldColumn = widget.column;

    // Si on change de colonne
    if (oldColumn !== column) {
      // Décaler les widgets de l'ancienne colonne
      await this.prisma.pageWidget.updateMany({
        where: {
          pageId,
          column: oldColumn,
          position: { gt: oldPosition }
        },
        data: {
          position: { decrement: 1 }
        }
      });

      // Décaler les widgets de la nouvelle colonne
      await this.prisma.pageWidget.updateMany({
        where: {
          pageId,
          column,
          position: { gte: newPosition }
        },
        data: {
          position: { increment: 1 }
        }
      });
    } else {
      // Même colonne, juste réorganiser
      if (newPosition > oldPosition) {
        await this.prisma.pageWidget.updateMany({
          where: {
            pageId,
            column,
            position: {
              gt: oldPosition,
              lte: newPosition
            }
          },
          data: {
            position: { decrement: 1 }
          }
        });
      } else {
        await this.prisma.pageWidget.updateMany({
          where: {
            pageId,
            column,
            position: {
              gte: newPosition,
              lt: oldPosition
            }
          },
          data: {
            position: { increment: 1 }
          }
        });
      }
    }

    // Mettre à jour le widget
    await this.prisma.pageWidget.update({
      where: { id: widgetId },
      data: {
        position: newPosition,
        column
      }
    });
  }

  // Dupliquer un widget
  async duplicateWidget(widgetId: string) {
    const widget = await this.prisma.pageWidget.findUnique({
      where: { id: widgetId }
    });

    if (!widget) {
      throw new NotFoundException('Widget non trouvé');
    }

    // Créer une copie avec une nouvelle position
    const lastWidget = await this.prisma.pageWidget.findFirst({
      where: { 
        pageId: widget.pageId,
        column: widget.column
      },
      orderBy: { position: 'desc' }
    });

    const newPosition = lastWidget ? lastWidget.position + 1 : 0;

    return this.prisma.pageWidget.create({
      data: {
        pageId: widget.pageId,
        widgetType: widget.widgetType,
        position: newPosition,
        column: widget.column,
        config: widget.config,
        title: widget.title ? `${widget.title} (copie)` : null,
        showTitle: widget.showTitle,
        cssClass: widget.cssClass,
        backgroundColor: widget.backgroundColor,
        padding: widget.padding,
        margin: widget.margin,
        isVisible: widget.isVisible
      }
    });
  }

  // Configuration par défaut selon le type
  private getDefaultConfig(widgetType: string): any {
    switch (widgetType) {
      case 'zmanim':
        return {
          displayMode: 'detailed',
          showAllTimes: true
        };
      case 'prayers':
        return {
          displayMode: 'full',
          showWeekly: true,
          showNextPrayer: true
        };
      case 'shabbat':
        return {
          displayMode: 'card',
          showMultipleOptions: false,
          showHebrewDate: true
        };
      case 'hebrew-date':
        return {
          displayMode: 'banner',
          showParasha: true,
          showOmer: true
        };
      case 'parnass':
        return {
          displayMode: 'card',
          showDedicationTypes: true
        };
      case 'donation-form':
        return {
          amounts: [18, 36, 72, 100, 180],
          currency: 'EUR',
          showRecurring: true
        };
      case 'text':
        return {
          content: '',
          alignment: 'left'
        };
      case 'image':
        return {
          src: '',
          alt: '',
          link: '',
          alignment: 'center'
        };
      case 'video':
        return {
          url: '',
          autoplay: false,
          controls: true
        };
      case 'html':
        return {
          content: ''
        };
      default:
        return {};
    }
  }

  // Obtenir les types de widgets disponibles
  getAvailableWidgetTypes() {
    return [
      {
        type: 'zmanim',
        name: 'Horaires Halakhiques',
        description: 'Affiche les zmanim du jour',
        icon: 'clock',
        category: 'jewish',
        requiresModule: 'zmanim'
      },
      {
        type: 'prayers',
        name: 'Horaires de Prières',
        description: 'Affiche les horaires de prières',
        icon: 'calendar',
        category: 'jewish',
        requiresModule: 'prayers'
      },
      {
        type: 'shabbat',
        name: 'Horaires de Shabbat',
        description: 'Affiche les horaires du Shabbat',
        icon: 'star',
        category: 'jewish',
        requiresModule: 'zmanim'
      },
      {
        type: 'hebrew-date',
        name: 'Date Hébraïque',
        description: 'Affiche la date hébraïque et la parasha',
        icon: 'calendar',
        category: 'jewish',
        requiresModule: 'zmanim'
      },
      {
        type: 'parnass',
        name: 'Parnass / Sponsors',
        description: 'Affiche les sponsors du jour',
        icon: 'heart',
        category: 'jewish',
        requiresModule: 'parnass'
      },
      {
        type: 'donation-form',
        name: 'Formulaire de Don',
        description: 'Formulaire de donation intégré',
        icon: 'credit-card',
        category: 'donation'
      },
      {
        type: 'text',
        name: 'Texte',
        description: 'Bloc de texte personnalisé',
        icon: 'type',
        category: 'content'
      },
      {
        type: 'image',
        name: 'Image',
        description: 'Image avec options',
        icon: 'image',
        category: 'content'
      },
      {
        type: 'video',
        name: 'Vidéo',
        description: 'Vidéo YouTube ou Vimeo',
        icon: 'video',
        category: 'content'
      },
      {
        type: 'html',
        name: 'HTML personnalisé',
        description: 'Code HTML libre',
        icon: 'code',
        category: 'content'
      }
    ];
  }
}
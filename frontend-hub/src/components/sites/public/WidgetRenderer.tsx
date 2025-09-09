'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ZmanimWidget } from '@/components/sites/jewish/ZmanimWidget';
import { PrayerSchedule } from '@/components/sites/jewish/PrayerSchedule';
import { ShabbatTimes } from '@/components/sites/jewish/ShabbatTimes';
import { HebrewDateDisplay } from '@/components/sites/jewish/HebrewDateDisplay';
import { ParnassWidget } from '@/components/sites/jewish/ParnassWidget';
import DOMPurify from 'dompurify';

interface WidgetData {
  id: string;
  widgetType: string;
  position: number;
  column: number;
  config: any;
  title?: string;
  showTitle: boolean;
  cssClass?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  isVisible: boolean;
}

interface WidgetRendererProps {
  widget: WidgetData;
  tenantId: string;
}

export function WidgetRenderer({ widget, tenantId }: WidgetRendererProps) {
  if (!widget.isVisible) return null;

  const renderWidget = () => {
    switch (widget.widgetType) {
      case 'zmanim':
        return (
          <ZmanimWidget 
            tenantId={tenantId}
            displayMode={widget.config.displayMode || 'detailed'}
            showAllTimes={widget.config.showAllTimes ?? true}
          />
        );

      case 'prayers':
        return (
          <PrayerSchedule 
            tenantId={tenantId}
            displayMode={widget.config.displayMode || 'full'}
            showWeekly={widget.config.showWeekly ?? true}
            showNextPrayer={widget.config.showNextPrayer ?? true}
          />
        );

      case 'shabbat':
        return (
          <ShabbatTimes 
            tenantId={tenantId}
            displayMode={widget.config.displayMode || 'card'}
            showMultipleOptions={widget.config.showMultipleOptions ?? false}
            showHebrewDate={widget.config.showHebrewDate ?? true}
          />
        );

      case 'hebrew-date':
        return (
          <HebrewDateDisplay 
            tenantId={tenantId}
            displayMode={widget.config.displayMode || 'banner'}
            showParasha={widget.config.showParasha ?? true}
            showOmer={widget.config.showOmer ?? true}
          />
        );

      case 'parnass':
        return (
          <ParnassWidget 
            tenantId={tenantId}
            displayMode={widget.config.displayMode || 'card'}
            showDedicationTypes={widget.config.showDedicationTypes ?? true}
          />
        );

      case 'donation-form':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Faire un don</h3>
                <p className="text-muted-foreground mb-4">Soutenez notre communauté</p>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Donner maintenant
                </button>
              </div>
            </CardContent>
          </Card>
        );

      case 'text':
        return (
          <div 
            className={`prose prose-sm max-w-none`}
            style={{ textAlign: widget.config.alignment || 'left' }}
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(widget.config.content || '') 
            }}
          />
        );

      case 'image':
        if (!widget.config.src) return null;
        return (
          <div style={{ textAlign: widget.config.alignment || 'center' }}>
            {widget.config.link ? (
              <a href={widget.config.link} target="_blank" rel="noopener noreferrer">
                <img 
                  src={widget.config.src} 
                  alt={widget.config.alt || ''} 
                  className="max-w-full h-auto"
                />
              </a>
            ) : (
              <img 
                src={widget.config.src} 
                alt={widget.config.alt || ''} 
                className="max-w-full h-auto"
              />
            )}
          </div>
        );

      case 'video':
        if (!widget.config.url) return null;
        
        // Extract video ID and platform
        let videoEmbed = null;
        const youtubeMatch = widget.config.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        const vimeoMatch = widget.config.url.match(/vimeo\.com\/(\d+)/);
        
        if (youtubeMatch) {
          videoEmbed = (
            <iframe
              className="w-full aspect-video"
              src={`https://www.youtube.com/embed/${youtubeMatch[1]}${widget.config.autoplay ? '?autoplay=1' : ''}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          );
        } else if (vimeoMatch) {
          videoEmbed = (
            <iframe
              className="w-full aspect-video"
              src={`https://player.vimeo.com/video/${vimeoMatch[1]}${widget.config.autoplay ? '?autoplay=1' : ''}`}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          );
        }
        
        return videoEmbed;

      case 'html':
        return (
          <div 
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(widget.config.content || '', {
                ADD_TAGS: ['iframe'],
                ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
              })
            }}
          />
        );

      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Widget non supporté: {widget.widgetType}</p>
            </CardContent>
          </Card>
        );
    }
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: widget.backgroundColor,
    padding: widget.padding,
    margin: widget.margin
  };

  return (
    <div 
      className={widget.cssClass}
      style={containerStyle}
    >
      {widget.showTitle && widget.title && (
        <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
      )}
      {renderWidget()}
    </div>
  );
}

interface PageWidgetsRendererProps {
  pageId?: string;
  widgets?: WidgetData[];
  tenantId: string;
  layout?: string;
}

export function PageWidgetsRenderer({ 
  pageId, 
  widgets: providedWidgets, 
  tenantId, 
  layout = 'single-column' 
}: PageWidgetsRendererProps) {
  const [widgets, setWidgets] = useState<WidgetData[]>(providedWidgets || []);
  const [loading, setLoading] = useState(!providedWidgets);

  useEffect(() => {
    if (pageId && !providedWidgets) {
      loadWidgets();
    }
  }, [pageId]);

  const loadWidgets = async () => {
    try {
      const response = await fetch(`/api/pages/${pageId}/widgets`);
      if (response.ok) {
        const data = await response.json();
        setWidgets(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (widgets.length === 0) {
    return null;
  }

  // Group widgets by column
  const columnWidgets: Record<number, WidgetData[]> = {};
  widgets.forEach(widget => {
    const column = widget.column || 1;
    if (!columnWidgets[column]) {
      columnWidgets[column] = [];
    }
    columnWidgets[column].push(widget);
  });

  // Sort widgets in each column by position
  Object.keys(columnWidgets).forEach(col => {
    columnWidgets[Number(col)].sort((a, b) => a.position - b.position);
  });

  // Render based on layout
  switch (layout) {
    case 'two-columns':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(col => (
            <div key={col} className="space-y-6">
              {(columnWidgets[col] || []).map(widget => (
                <WidgetRenderer key={widget.id} widget={widget} tenantId={tenantId} />
              ))}
            </div>
          ))}
        </div>
      );

    case 'three-columns':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(col => (
            <div key={col} className="space-y-6">
              {(columnWidgets[col] || []).map(widget => (
                <WidgetRenderer key={widget.id} widget={widget} tenantId={tenantId} />
              ))}
            </div>
          ))}
        </div>
      );

    case 'sidebar-left':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {(columnWidgets[1] || []).map(widget => (
              <WidgetRenderer key={widget.id} widget={widget} tenantId={tenantId} />
            ))}
          </div>
          <div className="lg:col-span-3 space-y-6">
            {(columnWidgets[2] || []).map(widget => (
              <WidgetRenderer key={widget.id} widget={widget} tenantId={tenantId} />
            ))}
          </div>
        </div>
      );

    case 'sidebar-right':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {(columnWidgets[1] || []).map(widget => (
              <WidgetRenderer key={widget.id} widget={widget} tenantId={tenantId} />
            ))}
          </div>
          <div className="lg:col-span-1 space-y-6">
            {(columnWidgets[2] || []).map(widget => (
              <WidgetRenderer key={widget.id} widget={widget} tenantId={tenantId} />
            ))}
          </div>
        </div>
      );

    case 'single-column':
    default:
      return (
        <div className="space-y-6">
          {widgets
            .sort((a, b) => a.position - b.position)
            .map(widget => (
              <WidgetRenderer key={widget.id} widget={widget} tenantId={tenantId} />
            ))}
        </div>
      );
  }
}
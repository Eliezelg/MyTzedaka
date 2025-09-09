'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HebrewDateInfo {
  hebrewDate: string;
  parasha?: string;
  yomTov?: string;
  isShabbat?: boolean;
  isRoshChodesh?: boolean;
  omerCount?: number;
  isFastDay?: boolean;
  fastName?: string;
}

interface HebrewDateDisplayProps {
  tenantId: string;
  className?: string;
  showParasha?: boolean;
  showOmer?: boolean;
  displayMode?: 'inline' | 'card' | 'banner';
}

export function HebrewDateDisplay({ 
  tenantId, 
  className,
  showParasha = true,
  showOmer = true,
  displayMode = 'card'
}: HebrewDateDisplayProps) {
  const [dateInfo, setDateInfo] = useState<HebrewDateInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHebrewDate();
    
    // Refresh at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    const midnightTimer = setTimeout(() => {
      loadHebrewDate();
      // Set up daily refresh
      const dailyInterval = setInterval(loadHebrewDate, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, [tenantId]);

  const loadHebrewDate = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenantId}/zmanim/today`
      );
      
      if (response.ok) {
        const data = await response.json();
        const { zmanim } = data;
        setDateInfo({
          hebrewDate: zmanim.hebrewDate || '',
          parasha: zmanim.parasha,
          yomTov: zmanim.yomTov,
          isShabbat: zmanim.isShabbat,
          isRoshChodesh: zmanim.isRoshChodesh,
          omerCount: zmanim.omerCount,
          isFastDay: zmanim.isFastDay,
          fastName: zmanim.fastName,
        });
      }
    } catch (error) {
      console.error('Error loading Hebrew date:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dateInfo) {
    return null;
  }

  // Inline mode - simple text display
  if (displayMode === 'inline') {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="font-hebrew">{dateInfo.hebrewDate}</span>
        {showParasha && dateInfo.parasha && (
          <>
            <span className="text-muted-foreground">•</span>
            <span>פרשת {dateInfo.parasha}</span>
          </>
        )}
        {dateInfo.yomTov && (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="font-semibold text-primary">{dateInfo.yomTov}</span>
          </>
        )}
      </div>
    );
  }

  // Banner mode - horizontal banner
  if (displayMode === 'banner') {
    return (
      <div className={cn(
        "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
        "border-y py-3 px-4",
        className
      )}>
        <div className="container mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="font-hebrew text-lg font-semibold">
              {dateInfo.hebrewDate}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            {showParasha && dateInfo.parasha && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">פרשת השבוע:</span>
                <span className="font-semibold">{dateInfo.parasha}</span>
              </div>
            )}
            
            {dateInfo.yomTov && (
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold">
                {dateInfo.yomTov}
              </div>
            )}
            
            {dateInfo.isRoshChodesh && (
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                ראש חודש
              </div>
            )}
            
            {showOmer && dateInfo.omerCount && (
              <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                יום {dateInfo.omerCount} לעומר
              </div>
            )}
            
            {dateInfo.isFastDay && (
              <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                {dateInfo.fastName}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card mode - default
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="font-hebrew text-xl font-semibold">
                {dateInfo.hebrewDate}
              </div>
            </div>
            
            {showParasha && dateInfo.parasha && (
              <div className="text-sm text-muted-foreground">
                פרשת השבוע: <span className="font-semibold text-foreground">{dateInfo.parasha}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            {dateInfo.yomTov && (
              <div className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-semibold text-left">
                {dateInfo.yomTov}
              </div>
            )}
            
            {dateInfo.isShabbat && (
              <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm text-left">
                שבת קודש
              </div>
            )}
            
            {dateInfo.isRoshChodesh && (
              <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm text-left">
                ראש חודש
              </div>
            )}
          </div>
        </div>
        
        {showOmer && dateInfo.omerCount && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-sm text-purple-700 dark:text-purple-400">
              ספירת העומר: <span className="font-semibold">יום {dateInfo.omerCount}</span>
            </div>
          </div>
        )}
        
        {dateInfo.isFastDay && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-sm text-amber-700 dark:text-amber-400">
              יום צום: <span className="font-semibold">{dateInfo.fastName}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
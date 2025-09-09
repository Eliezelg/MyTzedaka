'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Moon, Star, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShabbatData {
  candleLighting?: string;
  havdalah?: string;
  parasha?: string;
  hebrewDate?: string;
  fridayDate?: string;
  saturdayDate?: string;
  // Additional candle lighting options
  candleLighting_20?: string;
  candleLighting_30?: string;
  candleLighting_40?: string;
  // Additional havdalah options
  havdalah_42?: string;
  havdalah_50?: string;
  havdalah_60?: string;
  havdalah_72?: string;
  tzeitShabbat?: string;
  tzeitShabbat_RT?: string;
}

interface ShabbatTimesProps {
  tenantId: string;
  className?: string;
  showMultipleOptions?: boolean;
  displayMode?: 'card' | 'inline' | 'banner' | 'widget';
  showHebrewDate?: boolean;
}

export function ShabbatTimes({ 
  tenantId, 
  className,
  showMultipleOptions = false,
  displayMode = 'card',
  showHebrewDate = true
}: ShabbatTimesProps) {
  const [shabbatData, setShabbatData] = useState<ShabbatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextShabbat, setNextShabbat] = useState<Date>(getNextFriday());

  function getNextFriday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    return friday;
  }

  useEffect(() => {
    loadShabbatTimes();
    
    // Refresh after Shabbat ends (Saturday night)
    const checkAndRefresh = () => {
      const now = new Date();
      if (now.getDay() === 6 && now.getHours() >= 21) {
        setNextShabbat(getNextFriday());
        loadShabbatTimes();
      }
    };
    
    const interval = setInterval(checkAndRefresh, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [tenantId, nextShabbat]);

  const loadShabbatTimes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenantId}/zmanim/shabbat`
      );
      
      if (response.ok) {
        const data = await response.json();
        setShabbatData({
          ...data,
          fridayDate: nextShabbat.toLocaleDateString('he-IL'),
          saturdayDate: new Date(nextShabbat.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('he-IL'),
        });
      }
    } catch (error) {
      console.error('Error loading Shabbat times:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilShabbat = (): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const friday = new Date(nextShabbat);
    friday.setHours(0, 0, 0, 0);
    const diffTime = friday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDayLabel = (): string => {
    const days = getDaysUntilShabbat();
    if (days === 0) return 'היום';
    if (days === 1) return 'מחר';
    if (days === 2) return 'מחרתיים';
    return `בעוד ${days} ימים`;
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="h-32" />
      </Card>
    );
  }

  if (!shabbatData) {
    return null;
  }

  // Inline mode - compact single line
  if (displayMode === 'inline') {
    return (
      <div className={cn("flex items-center gap-4 text-sm", className)}>
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>הדלקת נרות: {shabbatData.candleLighting}</span>
        </div>
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-blue-500" />
          <span>הבדלה: {shabbatData.havdalah || shabbatData.havdalah_72}</span>
        </div>
        {shabbatData.parasha && (
          <div className="text-muted-foreground">
            פרשת {shabbatData.parasha}
          </div>
        )}
      </div>
    );
  }

  // Banner mode - full width banner
  if (displayMode === 'banner') {
    return (
      <div className={cn(
        "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
        "py-4 px-6 rounded-lg shadow-lg",
        className
      )}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="text-lg font-bold flex items-center gap-2">
                <Star className="h-5 w-5" />
                שבת קודש {getDayLabel()}
              </div>
              {shabbatData.parasha && (
                <div className="text-sm opacity-90">
                  פרשת {shabbatData.parasha}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs opacity-75">הדלקת נרות</div>
                <div className="text-xl font-bold flex items-center gap-1">
                  <Flame className="h-4 w-4" />
                  {shabbatData.candleLighting}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs opacity-75">הבדלה</div>
                <div className="text-xl font-bold flex items-center gap-1">
                  <Moon className="h-4 w-4" />
                  {shabbatData.havdalah || shabbatData.havdalah_72}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Widget mode - compact card
  if (displayMode === 'widget') {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-semibold">שבת {getDayLabel()}</span>
              </div>
              {shabbatData.parasha && (
                <Badge variant="secondary">{shabbatData.parasha}</Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">הדלקת נרות</div>
                <div className="font-mono text-lg flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  {shabbatData.candleLighting}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">הבדלה</div>
                <div className="font-mono text-lg flex items-center gap-1">
                  <Moon className="h-4 w-4 text-blue-500" />
                  {shabbatData.havdalah || shabbatData.havdalah_72}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card mode - default full featured
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            <span>זמני שבת</span>
          </div>
          <Badge variant={getDaysUntilShabbat() === 0 ? "default" : "secondary"}>
            {getDayLabel()}
          </Badge>
        </CardTitle>
        
        {shabbatData.parasha && (
          <div className="text-lg font-semibold text-muted-foreground">
            פרשת {shabbatData.parasha}
          </div>
        )}
        
        {showHebrewDate && shabbatData.hebrewDate && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {shabbatData.hebrewDate}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Friday - Candle Lighting */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Flame className="h-4 w-4" />
              יום שישי - הדלקת נרות
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-md bg-orange-50 dark:bg-orange-950/20">
                  <span className="text-sm">הדלקת נרות</span>
                  <span className="font-mono font-semibold text-orange-700 dark:text-orange-400">
                    {shabbatData.candleLighting}
                  </span>
                </div>
                
                {showMultipleOptions && (
                  <>
                    {shabbatData.candleLighting_20 && (
                      <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                        <span className="text-sm text-muted-foreground">20 דקות</span>
                        <span className="font-mono text-sm">{shabbatData.candleLighting_20}</span>
                      </div>
                    )}
                    {shabbatData.candleLighting_30 && (
                      <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                        <span className="text-sm text-muted-foreground">30 דקות</span>
                        <span className="font-mono text-sm">{shabbatData.candleLighting_30}</span>
                      </div>
                    )}
                    {shabbatData.candleLighting_40 && (
                      <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                        <span className="text-sm text-muted-foreground">40 דקות</span>
                        <span className="font-mono text-sm">{shabbatData.candleLighting_40}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl">🕯️</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {shabbatData.fridayDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Saturday - Havdalah */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Moon className="h-4 w-4" />
              מוצאי שבת - הבדלה
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-md bg-blue-50 dark:bg-blue-950/20">
                  <span className="text-sm">הבדלה</span>
                  <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">
                    {shabbatData.havdalah || shabbatData.havdalah_72}
                  </span>
                </div>
                
                {showMultipleOptions && (
                  <>
                    {shabbatData.tzeitShabbat && (
                      <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                        <span className="text-sm text-muted-foreground">צאת השבת</span>
                        <span className="font-mono text-sm">{shabbatData.tzeitShabbat}</span>
                      </div>
                    )}
                    {shabbatData.havdalah_42 && (
                      <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                        <span className="text-sm text-muted-foreground">42 דקות</span>
                        <span className="font-mono text-sm">{shabbatData.havdalah_42}</span>
                      </div>
                    )}
                    {shabbatData.havdalah_50 && (
                      <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                        <span className="text-sm text-muted-foreground">50 דקות</span>
                        <span className="font-mono text-sm">{shabbatData.havdalah_50}</span>
                      </div>
                    )}
                    {shabbatData.havdalah_60 && (
                      <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                        <span className="text-sm text-muted-foreground">60 דקות</span>
                        <span className="font-mono text-sm">{shabbatData.havdalah_60}</span>
                      </div>
                    )}
                    {shabbatData.tzeitShabbat_RT && (
                      <div className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                        <span className="text-sm text-muted-foreground">רבינו תם</span>
                        <span className="font-mono text-sm">{shabbatData.tzeitShabbat_RT}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl">✨</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {shabbatData.saturdayDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Countdown */}
        {getDaysUntilShabbat() > 0 && (
          <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-md text-center">
            <div className="text-sm text-muted-foreground">
              עוד <span className="font-bold text-lg text-primary mx-1">{getDaysUntilShabbat()}</span> ימים לשבת
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
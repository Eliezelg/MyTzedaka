'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DafYomiData {
  masechta: string;
  daf: number;
  hebrewMasechta?: string;
  startDate?: string;
  endDate?: string;
}

interface DafYomiWidgetProps {
  tenantId: string;
  className?: string;
  displayMode?: 'card' | 'inline' | 'minimal';
  showHebrew?: boolean;
  showDates?: boolean;
}

const MASECHTA_TRANSLATIONS: Record<string, string> = {
  'Berachos': 'Berakhot',
  'Shabbos': 'Shabbat',
  'Eruvin': 'Erouvin',
  'Pesachim': 'Pessahim',
  'Shekalim': 'Shekalim',
  'Yoma': 'Yoma',
  'Sukkah': 'Soukka',
  'Beitzah': 'Beitza',
  'Rosh Hashana': 'Rosh Hashana',
  'Taanis': 'Taanit',
  'Megillah': 'Meguila',
  'Moed Katan': 'Moed Katan',
  'Chagigah': 'Haguiga',
  'Yevamos': 'Yevamot',
  'Kesubos': 'Ketoubot',
  'Nedarim': 'Nedarim',
  'Nazir': 'Nazir',
  'Sotah': 'Sota',
  'Gitin': 'Guitin',
  'Kiddushin': 'Kidoushin',
  'Bava Kamma': 'Baba Kama',
  'Bava Metzia': 'Baba Metsia',
  'Bava Basra': 'Baba Batra',
  'Sanhedrin': 'Sanhedrin',
  'Makkos': 'Makot',
  'Shevuos': 'Shevouot',
  'Avodah Zarah': 'Avoda Zara',
  'Horayos': 'Horayot',
  'Zevachim': 'Zevahim',
  'Menachos': 'Menahot',
  'Chullin': 'Houlin',
  'Bechoros': 'Bekhorot',
  'Arachin': 'Arakhin',
  'Temurah': 'Temoura',
  'Kerisus': 'Keritot',
  'Meilah': 'Meila',
  'Kinnim': 'Kinim',
  'Tamid': 'Tamid',
  'Middos': 'Midot',
  'Niddah': 'Nida'
};

export function DafYomiWidget({ 
  tenantId, 
  className,
  displayMode = 'card',
  showHebrew = true,
  showDates = false
}: DafYomiWidgetProps) {
  const [dafYomi, setDafYomi] = useState<DafYomiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadDafYomi();
  }, [tenantId, selectedDate]);

  const loadDafYomi = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/tenant/${tenantId}/zmanim/date?date=${dateStr}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const { zmanim } = data;
        if (zmanim?.dafYomi) {
          setDafYomi(zmanim.dafYomi);
        }
      }
    } catch (error) {
      console.error('Error loading Daf Yomi:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getMasechtaName = (masechta: string): string => {
    return MASECHTA_TRANSLATIONS[masechta] || masechta;
  };

  const formatDateRange = (start?: string, end?: string): string => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const formatter = new Intl.DateTimeFormat('fr-FR', { 
      month: 'short', 
      day: 'numeric' 
    });
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="h-20" />
      </Card>
    );
  }

  if (!dafYomi) {
    return null;
  }

  // Inline mode - simple text display
  if (displayMode === 'inline') {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <Book className="h-4 w-4 text-muted-foreground" />
        <span>
          <strong>{getMasechtaName(dafYomi.masechta)}</strong> {dafYomi.daf}
        </span>
        {showHebrew && dafYomi.hebrewMasechta && (
          <span className="text-muted-foreground">
            ({dafYomi.hebrewMasechta} דף {dafYomi.daf})
          </span>
        )}
      </div>
    );
  }

  // Minimal mode - compact display
  if (displayMode === 'minimal') {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 text-primary" />
              <span className="font-medium">Daf Yomi</span>
            </div>
            <Badge variant="secondary">
              {getMasechtaName(dafYomi.masechta)} {dafYomi.daf}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card mode - full featured
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <span>Daf Yomi</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeDate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-normal text-muted-foreground px-2">
              {selectedDate.toLocaleDateString('fr-FR')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeDate(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Main Display */}
          <div className="text-center py-4 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-2">
              {getMasechtaName(dafYomi.masechta)}
            </div>
            <div className="text-5xl font-bold mb-2">
              דף {dafYomi.daf}
            </div>
            {showHebrew && dafYomi.hebrewMasechta && (
              <div className="text-xl text-muted-foreground font-hebrew">
                {dafYomi.hebrewMasechta}
              </div>
            )}
          </div>

          {/* Date Range */}
          {showDates && (dafYomi.startDate || dafYomi.endDate) && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Période du traité: {formatDateRange(dafYomi.startDate, dafYomi.endDate)}</span>
            </div>
          )}

          {/* Study Resources */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="w-full">
              <Book className="h-4 w-4 mr-2" />
              Étudier en ligne
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Programme complet
            </Button>
          </div>

          {/* Information */}
          <div className="text-xs text-center text-muted-foreground">
            Le Daf Yomi est l'étude quotidienne d'une page du Talmud Babylonien.
            <br />
            Le cycle complet dure environ 7 ans et demi.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
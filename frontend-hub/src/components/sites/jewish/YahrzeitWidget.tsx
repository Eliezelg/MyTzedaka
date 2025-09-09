'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Flame,
  Heart,
  Plus,
  Search,
  Star,
  User,
  Clock,
  Bell,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Yahrzeit {
  id: string;
  deceasedName: string;
  hebrewName?: string;
  relationToMember?: string;
  memberName?: string;
  memberId?: string;
  dateOfDeath: string;       // Gregorian date
  hebrewDateOfDeath: string; // Hebrew date
  nextYahrzeit: string;       // Next occurrence
  hebrewNextYahrzeit: string;
  yearsElapsed: number;
  notes?: string;
  isPublic: boolean;
  notifyMember: boolean;
  notifyDaysBefore: number;
}

interface YahrzeitWidgetProps {
  tenantId: string;
  className?: string;
  displayMode?: 'upcoming' | 'today' | 'search' | 'full';
  showPrivate?: boolean;
  maxItems?: number;
  daysAhead?: number;
}

// Mock data - replace with API
const MOCK_YAHRZEITS: Yahrzeit[] = [
  {
    id: '1',
    deceasedName: 'Abraham ben Moshe',
    hebrewName: 'אברהם בן משה',
    relationToMember: 'Père',
    memberName: 'David Cohen',
    memberId: 'member1',
    dateOfDeath: '2020-03-15',
    hebrewDateOfDeath: '19 Adar 5780',
    nextYahrzeit: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hebrewNextYahrzeit: '19 Adar 5784',
    yearsElapsed: 4,
    isPublic: true,
    notifyMember: true,
    notifyDaysBefore: 7
  },
  {
    id: '2',
    deceasedName: 'Sarah bat Yosef',
    hebrewName: 'שרה בת יוסף',
    relationToMember: 'Mère',
    memberName: 'Rachel Levy',
    memberId: 'member2',
    dateOfDeath: '2019-05-20',
    hebrewDateOfDeath: '15 Iyar 5779',
    nextYahrzeit: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hebrewNextYahrzeit: '15 Iyar 5784',
    yearsElapsed: 5,
    isPublic: true,
    notifyMember: true,
    notifyDaysBefore: 3
  },
  {
    id: '3',
    deceasedName: 'Yitzhak ben David',
    hebrewName: 'יצחק בן דוד',
    relationToMember: 'Grand-père',
    memberName: 'Moshe Goldstein',
    memberId: 'member3',
    dateOfDeath: '2015-11-10',
    hebrewDateOfDeath: '28 Heshvan 5776',
    nextYahrzeit: new Date().toISOString().split('T')[0], // Today
    hebrewNextYahrzeit: '28 Heshvan 5784',
    yearsElapsed: 9,
    isPublic: true,
    notifyMember: true,
    notifyDaysBefore: 1
  }
];

export function YahrzeitWidget({ 
  tenantId, 
  className,
  displayMode = 'upcoming',
  showPrivate = false,
  maxItems = 10,
  daysAhead = 30
}: YahrzeitWidgetProps) {
  const [yahrzeits, setYahrzeits] = useState<Yahrzeit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadYahrzeits();
  }, [tenantId, displayMode, daysAhead]);

  const loadYahrzeits = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/tenant/${tenantId}/yahrzeits`);
      
      let filtered = [...MOCK_YAHRZEITS];
      
      // Filter by display mode
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      if (displayMode === 'today') {
        filtered = filtered.filter(y => y.nextYahrzeit === today);
      } else if (displayMode === 'upcoming') {
        filtered = filtered.filter(y => 
          y.nextYahrzeit >= today && y.nextYahrzeit <= futureDateStr
        );
      }
      
      // Filter private if needed
      if (!showPrivate) {
        filtered = filtered.filter(y => y.isPublic);
      }
      
      // Sort by next yahrzeit date
      filtered.sort((a, b) => a.nextYahrzeit.localeCompare(b.nextYahrzeit));
      
      setYahrzeits(filtered.slice(0, maxItems));
    } catch (error) {
      console.error('Error loading yahrzeits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntil = (date: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yahrzeitDate = new Date(date);
    yahrzeitDate.setHours(0, 0, 0, 0);
    const diffTime = yahrzeitDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimeLabel = (date: string): string => {
    const days = getDaysUntil(date);
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Demain";
    if (days === 2) return "Après-demain";
    if (days < 0) return "Passé";
    if (days <= 7) return `Dans ${days} jours`;
    if (days <= 30) return `Dans ${Math.floor(days / 7)} semaines`;
    return `Dans ${Math.floor(days / 30)} mois`;
  };

  const filteredYahrzeits = yahrzeits.filter(y => 
    searchTerm === '' || 
    y.deceasedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    y.hebrewName?.includes(searchTerm) ||
    y.memberName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="h-48" />
      </Card>
    );
  }

  // Today's yahrzeits - special display
  if (displayMode === 'today') {
    const todaysYahrzeits = yahrzeits.filter(y => getDaysUntil(y.nextYahrzeit) === 0);
    
    return (
      <Card className={cn("border-2 border-primary/20 bg-primary/5", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Yahrzeits du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysYahrzeits.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Aucun yahrzeit aujourd'hui
            </p>
          ) : (
            <div className="space-y-4">
              {todaysYahrzeits.map((yahrzeit) => (
                <div key={yahrzeit.id} className="p-4 bg-background rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {yahrzeit.deceasedName}
                      </h4>
                      {yahrzeit.hebrewName && (
                        <p className="text-lg font-hebrew text-muted-foreground">
                          {yahrzeit.hebrewName}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {yahrzeit.hebrewNextYahrzeit} • {yahrzeit.yearsElapsed}ème année
                      </p>
                      {yahrzeit.memberName && (
                        <p className="text-sm mt-2">
                          <span className="text-muted-foreground">Pour:</span> {yahrzeit.memberName}
                          {yahrzeit.relationToMember && ` (${yahrzeit.relationToMember})`}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-orange-500">
                        <Flame className="h-3 w-3 mr-1" />
                        Aujourd'hui
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted/50 rounded text-sm">
                    <p className="font-medium mb-1">Allumer une bougie de souvenir</p>
                    <p className="text-muted-foreground">
                      Réciter le Kaddish aux offices du jour
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Search mode
  if (displayMode === 'search') {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Rechercher un Yahrzeit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nom du défunt ou du membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="space-y-2 max-h-96 overflow-auto">
              {filteredYahrzeits.map((yahrzeit) => (
                <div key={yahrzeit.id} className="p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{yahrzeit.deceasedName}</p>
                      {yahrzeit.hebrewName && (
                        <p className="text-sm text-muted-foreground">{yahrzeit.hebrewName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{yahrzeit.hebrewNextYahrzeit}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTimeLabel(yahrzeit.nextYahrzeit)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full mode with tabs
  if (displayMode === 'full') {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <span>Yahrzeits</span>
            </div>
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">À venir</TabsTrigger>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-3 mt-4">
              {filteredYahrzeits.map((yahrzeit) => (
                <YahrzeitCard key={yahrzeit.id} yahrzeit={yahrzeit} />
              ))}
            </TabsContent>
            
            <TabsContent value="all" className="space-y-3 mt-4">
              <div className="mb-4">
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              {filteredYahrzeits.map((yahrzeit) => (
                <YahrzeitCard key={yahrzeit.id} yahrzeit={yahrzeit} />
              ))}
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-3 mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Configuration des rappels</p>
                <p className="text-sm mt-2">
                  Recevez des notifications avant les yahrzeits
                </p>
                <Button className="mt-4" variant="outline">
                  Configurer les rappels
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Upcoming mode (default)
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Yahrzeits à venir
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {filteredYahrzeits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun yahrzeit dans les {daysAhead} prochains jours</p>
            </div>
          ) : (
            filteredYahrzeits.map((yahrzeit) => (
              <YahrzeitCard key={yahrzeit.id} yahrzeit={yahrzeit} compact />
            ))
          )}
        </div>
        
        {filteredYahrzeits.length > 0 && (
          <Button variant="outline" className="w-full mt-4">
            Voir tous les yahrzeits
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Component for individual yahrzeit card
function YahrzeitCard({ yahrzeit, compact = false }: { yahrzeit: Yahrzeit; compact?: boolean }) {
  const daysUntil = getDaysUntil(yahrzeit.nextYahrzeit);
  const isToday = daysUntil === 0;
  const isUpcoming = daysUntil > 0 && daysUntil <= 7;
  
  const getDaysUntil = (date: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yahrzeitDate = new Date(date);
    yahrzeitDate.setHours(0, 0, 0, 0);
    const diffTime = yahrzeitDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (compact) {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg border",
        isToday && "bg-orange-50 border-orange-200 dark:bg-orange-950/20",
        isUpcoming && "bg-blue-50 border-blue-200 dark:bg-blue-950/20"
      )}>
        <div className="flex items-center gap-3">
          {isToday && <Flame className="h-5 w-5 text-orange-500" />}
          <div>
            <p className="font-medium">{yahrzeit.deceasedName}</p>
            <p className="text-sm text-muted-foreground">
              {yahrzeit.hebrewNextYahrzeit}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          {isToday ? (
            <Badge className="bg-orange-500">Aujourd'hui</Badge>
          ) : (
            <p className="text-sm text-muted-foreground">
              Dans {daysUntil} jour{daysUntil > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "p-4 rounded-lg border",
      isToday && "bg-orange-50 border-orange-200 dark:bg-orange-950/20",
      isUpcoming && "bg-blue-50 border-blue-200 dark:bg-blue-950/20"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isToday && <Flame className="h-5 w-5 text-orange-500" />}
            <h4 className="font-semibold">{yahrzeit.deceasedName}</h4>
          </div>
          
          {yahrzeit.hebrewName && (
            <p className="font-hebrew text-muted-foreground">
              {yahrzeit.hebrewName}
            </p>
          )}
          
          <p className="text-sm text-muted-foreground">
            {yahrzeit.hebrewDateOfDeath} • {yahrzeit.yearsElapsed}ème année
          </p>
          
          {yahrzeit.memberName && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              {yahrzeit.memberName}
              {yahrzeit.relationToMember && ` (${yahrzeit.relationToMember})`}
            </div>
          )}
        </div>
        
        <div className="text-right space-y-1">
          <p className="font-medium">{yahrzeit.hebrewNextYahrzeit}</p>
          {isToday ? (
            <Badge className="bg-orange-500">
              <Flame className="h-3 w-3 mr-1" />
              Aujourd'hui
            </Badge>
          ) : (
            <Badge variant={isUpcoming ? "default" : "secondary"}>
              Dans {daysUntil} jour{daysUntil > 1 ? 's' : ''}
            </Badge>
          )}
          
          {yahrzeit.notifyMember && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Bell className="h-3 w-3" />
              Rappel activé
            </div>
          )}
        </div>
      </div>
      
      {yahrzeit.notes && (
        <p className="mt-2 text-sm text-muted-foreground italic">
          {yahrzeit.notes}
        </p>
      )}
    </div>
  );
}
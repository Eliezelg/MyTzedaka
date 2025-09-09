'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useTenant } from '@/providers/tenant-provider';
import { PrayerSchedule } from '@/components/sites/jewish/PrayerSchedule';

export function PrayersModule() {
  const { tenant, isModuleEnabled } = useTenant();

  // Si le module n'est pas activé, ne rien afficher
  if (!isModuleEnabled('prayers')) {
    return null;
  }

  if (!tenant?.id) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Chargement des informations...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prayer Schedule Widget */}
      <PrayerSchedule 
        tenantId={tenant.id}
        displayMode="full"
        showWeekly={true}
        showNextPrayer={true}
      />

      {/* Note explicative */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note :</strong> Les horaires de prières sont calculés automatiquement 
            selon les paramètres définis pour {tenant.name}. 
            Veuillez consulter votre rabbin pour toute question.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
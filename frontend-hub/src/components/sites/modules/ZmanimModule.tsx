'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useTenant } from '@/providers/tenant-provider';
import { ZmanimWidget } from '@/components/sites/jewish/ZmanimWidget';
import { HebrewDateDisplay } from '@/components/sites/jewish/HebrewDateDisplay';
import { ShabbatTimes } from '@/components/sites/jewish/ShabbatTimes';

export function ZmanimModule() {
  const { tenant, isModuleEnabled } = useTenant();

  // Si le module n'est pas activé, ne rien afficher
  if (!isModuleEnabled('zmanim')) {
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
      {/* Hebrew Date Display */}
      <HebrewDateDisplay 
        tenantId={tenant.id}
        displayMode="banner"
        showParasha={true}
        showOmer={true}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shabbat Times */}
        <div className="lg:col-span-1">
          <ShabbatTimes 
            tenantId={tenant.id}
            displayMode="card"
            showMultipleOptions={false}
            showHebrewDate={false}
          />
        </div>

        {/* Zmanim Widget */}
        <div className="lg:col-span-2">
          <ZmanimWidget 
            tenantId={tenant.id}
            displayMode="detailed"
            showAllTimes={true}
          />
        </div>
      </div>

      {/* Note explicative */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note :</strong> Ces horaires sont calculés pour {tenant.name}. 
            Les horaires peuvent varier selon votre localisation exacte. 
            Consultez votre rabbin pour les questions halakhiques.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { PrayersModule } from '@/components/sites/modules/PrayersModule';
import { useTenant } from '@/providers/tenant-provider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function PrayersPage() {
  const { isModuleEnabled } = useTenant();

  // Si le module n'est pas activé, afficher un message
  if (!isModuleEnabled('prayers')) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Le module des horaires de prières n'est pas activé pour ce site. 
            Contactez l'administrateur pour l'activer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <PrayersModule />
    </div>
  );
}
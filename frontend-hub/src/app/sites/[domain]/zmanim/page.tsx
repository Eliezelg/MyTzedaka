'use client';

import { ZmanimModule } from '@/components/sites/modules/ZmanimModule';
import { useTenant } from '@/providers/tenant-provider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ZmanimPage() {
  const { isModuleEnabled } = useTenant();

  // Si le module n'est pas activé, afficher un message
  if (!isModuleEnabled('zmanim')) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Le module Zmanim n'est pas activé pour ce site. 
            Contactez l'administrateur pour l'activer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ZmanimModule />
    </div>
  );
}
'use client';

import { ZmanimWidget } from '../jewish/ZmanimWidget';
import { useModule } from '@/providers/tenant-provider';

interface ZmanimBlockProps {
  tenantId: string;
  title?: string;
  compact?: boolean;
  showAllTimes?: boolean;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    timezone?: string;
  };
}

export default function ZmanimBlock({
  tenantId,
  title,
  compact = true,
  showAllTimes = false,
  location
}: ZmanimBlockProps) {
  const isModuleEnabled = useModule('zmanim');

  // Ne rien afficher si le module n'est pas activé
  if (!isModuleEnabled) {
    return null;
  }

  return (
    <div className="my-8">
      {title && (
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
      )}
      <ZmanimWidget
        tenantId={tenantId}
        compact={compact}
        showAllTimes={showAllTimes}
        location={location}
      />
    </div>
  );
}
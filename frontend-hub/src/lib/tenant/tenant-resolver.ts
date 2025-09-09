import { cache } from 'react';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain?: string;
  logoPath?: string;  // Logo de l'association
  hasAccount?: boolean;  // Si l'association a un compte actif
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  templateId?: string | null;  // ID du template sélectionné
  templateData?: any;  // Données personnalisées du template
  theme?: {
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      foreground?: string;
    };
    typography?: {
      fontFamily?: string;
      scale?: number;
    };
    layout?: {
      maxWidth?: string;
      spacing?: string;
    };
  };
  settings?: {
    description?: string;
    tagline?: string;
    about?: string;
    heroImage?: string;
    aboutImage?: string;
    ogImage?: string;
    favicon?: string;
    stripeMode?: 'PLATFORM' | 'CUSTOM';  // Mode de paiement Stripe
    stripeConnectAccountId?: string;  // ID du compte Stripe Connect
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      postalCode?: string;
      country?: string;
      mapUrl?: string;
    };
    social?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      youtube?: string;
      linkedin?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface TenantModules {
  // Modules de base
  donations: boolean;
  campaigns: boolean;
  events: boolean;
  blog: boolean;
  gallery: boolean;
  
  // Modules synagogue
  zmanim: boolean;
  prayers: boolean;
  courses: boolean;
  hebrewCalendar: boolean;
  members: boolean;
  
  // Modules avancés
  library: boolean;
  yahrzeits: boolean;
  seatingChart: boolean;
  mikvah: boolean;
  kashrut: boolean;
  eruv: boolean;
  
  // Modules communautaires
  marketplace: boolean;
  directory: boolean;
  chesed: boolean;
  newsletter: boolean;
  
  // Configuration détaillée
  modulesConfig?: Record<string, any>;
}

// Cache les appels API avec React cache
export const getTenantByDomain = cache(async (domain: string): Promise<Tenant | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/resolve/${domain}`,
      {
        next: { revalidate: 300 }, // Cache pour 5 minutes
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
});

export const getTenantModules = cache(async (tenantId: string): Promise<TenantModules> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenantId}/modules`,
      {
        next: { revalidate: 300 }, // Cache pour 5 minutes
      }
    );
    
    if (!response.ok) {
      // Retourner les modules par défaut si erreur
      return getDefaultModules();
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching tenant modules:', error);
    return getDefaultModules();
  }
});

export const getTenantNavigation = cache(async (tenantId: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/${tenantId}/navigation`,
      {
        next: { revalidate: 300 }, // Cache pour 5 minutes
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching tenant navigation:', error);
    return null;
  }
});

function getDefaultModules(): TenantModules {
  return {
    // Modules de base activés par défaut
    donations: true,
    campaigns: true,
    events: true,
    blog: true,
    gallery: false,
    
    // Modules synagogue désactivés par défaut
    zmanim: false,
    prayers: false,
    courses: false,
    hebrewCalendar: false,
    members: false,
    
    // Modules avancés désactivés
    library: false,
    yahrzeits: false,
    seatingChart: false,
    mikvah: false,
    kashrut: false,
    eruv: false,
    
    // Modules communautaires désactivés
    marketplace: false,
    directory: false,
    chesed: false,
    newsletter: false,
  };
}
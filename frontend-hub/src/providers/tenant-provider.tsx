'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { Tenant, TenantModules } from '@/lib/tenant/tenant-resolver';

interface TenantContextType {
  tenant: Tenant;
  modules: TenantModules;
  navigation: any;
  theme: any;
  isModuleEnabled: (moduleName: keyof TenantModules) => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: React.ReactNode;
  tenant: Tenant;
  modules: TenantModules;
  navigation?: any;
  theme?: any;
}

export function TenantProvider({ 
  children, 
  tenant, 
  modules,
  navigation,
  theme 
}: TenantProviderProps) {
  const value = useMemo(() => ({
    tenant,
    modules,
    navigation,
    theme,
    isModuleEnabled: (moduleName: keyof TenantModules) => {
      return modules[moduleName] === true;
    }
  }), [tenant, modules, navigation, theme]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

// Hook pour vérifier si un module est activé
export function useModule(moduleName: keyof TenantModules): boolean {
  const { modules } = useTenant();
  return modules[moduleName] === true;
}

// Hook pour obtenir la configuration d'un module
export function useModuleConfig(moduleName: string): any {
  const { modules } = useTenant();
  return modules.modulesConfig?.[moduleName] || {};
}

// Hook pour obtenir la navigation dynamique
export function useDynamicNavigation() {
  const { navigation, modules } = useTenant();
  
  // Si une navigation custom existe, l'utiliser
  if (navigation) {
    return navigation;
  }
  
  // Sinon, générer la navigation basée sur les modules activés
  const generatedNav = {
    mainMenu: [
      { path: '/', label: 'Accueil', icon: 'Home', always: true },
    ],
    footerMenu: [],
    mobileMenu: []
  };
  
  if (modules.donations) {
    generatedNav.mainMenu.push({ 
      path: '/donate', 
      label: 'Faire un Don', 
      icon: 'Heart' 
    });
  }
  
  if (modules.campaigns) {
    generatedNav.mainMenu.push({ 
      path: '/campaigns', 
      label: 'Campagnes', 
      icon: 'TrendingUp' 
    });
  }
  
  if (modules.events) {
    generatedNav.mainMenu.push({ 
      path: '/events', 
      label: 'Événements', 
      icon: 'Calendar' 
    });
  }
  
  // Menu synagogue si au moins un module est activé
  const synagogueItems = [];
  if (modules.zmanim) {
    synagogueItems.push({ path: '/zmanim', label: 'Zmanim' });
  }
  if (modules.prayers) {
    synagogueItems.push({ path: '/prayers', label: 'Horaires de Prières' });
  }
  if (modules.courses) {
    synagogueItems.push({ path: '/courses', label: 'Cours Torah' });
  }
  
  if (synagogueItems.length > 0) {
    generatedNav.mainMenu.push({
      path: '/synagogue',
      label: 'Synagogue',
      icon: 'Building',
      subItems: synagogueItems
    });
  }
  
  if (modules.blog) {
    generatedNav.mainMenu.push({ 
      path: '/blog', 
      label: 'Actualités', 
      icon: 'Newspaper' 
    });
  }
  
  // Footer menu
  generatedNav.footerMenu = [
    { path: '/about', label: 'À Propos' },
    { path: '/contact', label: 'Contact' },
    { path: '/privacy', label: 'Confidentialité' },
    { path: '/terms', label: 'Conditions' },
  ];
  
  // Mobile menu = main menu + footer items
  generatedNav.mobileMenu = [
    ...generatedNav.mainMenu,
    ...generatedNav.footerMenu
  ];
  
  return generatedNav;
}
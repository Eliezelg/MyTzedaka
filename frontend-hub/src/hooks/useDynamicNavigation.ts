'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  order?: number;
  children?: NavigationItem[];
  external?: boolean;
  requireAuth?: boolean;
  isActive?: boolean;
  badge?: string;
  badgeColor?: string;
}

export interface DynamicNavigation {
  mainMenu: NavigationItem[];
  footerMenu: NavigationItem[];
  mobileMenu: NavigationItem[];
}

export const useDynamicNavigation = (tenantId?: string) => {
  const [navigation, setNavigation] = useState<DynamicNavigation>({
    mainMenu: [],
    footerMenu: [],
    mobileMenu: []
  });

  // Default navigation items (always present)
  const defaultMainMenu: NavigationItem[] = [
    { 
      label: 'Accueil', 
      path: '/', 
      icon: 'Home', 
      order: 0,
      isActive: true 
    },
    { 
      label: 'Associations', 
      path: '/associations', 
      icon: 'Users', 
      order: 1,
      isActive: true,
      children: [
        { label: 'Toutes les associations', path: '/associations' },
        { label: 'Associations populaires', path: '/associations/popular' },
        { label: 'Nouvelles associations', path: '/associations/new' },
        { label: 'Créer une association', path: '/associations/create', requireAuth: true }
      ]
    },
    { 
      label: 'Campagnes', 
      path: '/campaigns', 
      icon: 'TrendingUp', 
      order: 2,
      isActive: true,
      badge: 'Nouveau',
      badgeColor: 'bg-red-500',
      children: [
        { label: 'Campagnes actives', path: '/campaigns' },
        { label: 'Campagnes urgentes', path: '/campaigns/urgent', badge: '3', badgeColor: 'bg-yellow-500' },
        { label: 'Campagnes terminées', path: '/campaigns/completed' }
      ]
    }
  ];

  const defaultFooterMenu: NavigationItem[] = [
    { label: 'Mentions légales', path: '/legal', order: 100 },
    { label: 'Politique de confidentialité', path: '/privacy', order: 101 },
    { label: 'CGU', path: '/terms', order: 102 }
  ];

  // Fetch dynamic pages from API
  const { data: dynamicPages, isLoading } = useQuery({
    queryKey: ['navigation', tenantId],
    queryFn: async () => {
      try {
        // If we have a tenant ID, fetch tenant-specific navigation
        if (tenantId) {
          const response = await apiClient.get(`/admin/tenants/${tenantId}/navigation`);
          return response.data;
        }
        
        // Otherwise fetch global navigation
        const response = await apiClient.get('/pages/navigation');
        return response.data;
      } catch (error) {
        console.error('Error fetching navigation:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  });

  useEffect(() => {
    if (dynamicPages) {
      // Merge default navigation with dynamic pages
      const mainMenu = [...defaultMainMenu];
      const footerMenu = [...defaultFooterMenu];
      
      // Add dynamic pages to main menu
      if (dynamicPages.mainMenu) {
        dynamicPages.mainMenu.forEach((page: any) => {
          if (page.isActive && page.settings?.showInNavbar) {
            mainMenu.push({
              label: page.title,
              path: `/pages/${page.slug}`,
              icon: page.settings.icon,
              order: page.settings.navOrder || 999,
              requireAuth: page.settings.requireAuth,
              isActive: true
            });
          }
        });
      }
      
      // Add dynamic pages to footer menu
      if (dynamicPages.footerMenu) {
        dynamicPages.footerMenu.forEach((page: any) => {
          if (page.isActive && page.settings?.showInFooter) {
            footerMenu.push({
              label: page.title,
              path: `/pages/${page.slug}`,
              order: page.settings.navOrder || 999,
              isActive: true
            });
          }
        });
      }
      
      // Sort by order
      mainMenu.sort((a, b) => (a.order || 999) - (b.order || 999));
      footerMenu.sort((a, b) => (a.order || 999) - (b.order || 999));
      
      // Mobile menu is same as main menu but with additional mobile-specific items
      const mobileMenu = [
        ...mainMenu,
        { label: 'Mon compte', path: '/account', icon: 'User', order: 900, requireAuth: true },
        { label: 'Paramètres', path: '/settings', icon: 'Settings', order: 901, requireAuth: true }
      ];
      
      setNavigation({
        mainMenu,
        footerMenu,
        mobileMenu
      });
    } else {
      // Use default navigation if no dynamic pages
      setNavigation({
        mainMenu: defaultMainMenu,
        footerMenu: defaultFooterMenu,
        mobileMenu: [...defaultMainMenu, 
          { label: 'Mon compte', path: '/account', icon: 'User', order: 900, requireAuth: true },
          { label: 'Paramètres', path: '/settings', icon: 'Settings', order: 901, requireAuth: true }
        ]
      });
    }
  }, [dynamicPages, tenantId]);

  // Function to check if a path is active
  const isPathActive = (path: string, currentPath: string): boolean => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  // Function to get navigation item by path
  const getNavigationItem = (path: string): NavigationItem | undefined => {
    const allItems = [
      ...navigation.mainMenu,
      ...navigation.footerMenu,
      ...navigation.mainMenu.flatMap(item => item.children || [])
    ];
    
    return allItems.find(item => item.path === path);
  };

  // Function to update navigation (for admin)
  const updateNavigation = async (updates: Partial<DynamicNavigation>) => {
    try {
      const response = await apiClient.put('/admin/navigation', updates);
      
      if (response.data.success) {
        // Refetch navigation to get updated data
        window.location.reload(); // Simple reload for now
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating navigation:', error);
      throw error;
    }
  };

  return {
    navigation,
    isLoading,
    isPathActive,
    getNavigationItem,
    updateNavigation
  };
};

// Hook to get breadcrumbs based on current path
export const useBreadcrumbs = (currentPath: string) => {
  const { navigation, getNavigationItem } = useDynamicNavigation();
  const [breadcrumbs, setBreadcrumbs] = useState<NavigationItem[]>([]);

  useEffect(() => {
    const pathSegments = currentPath.split('/').filter(Boolean);
    const crumbs: NavigationItem[] = [
      { label: 'Accueil', path: '/', icon: 'Home' }
    ];

    let currentSegmentPath = '';
    pathSegments.forEach(segment => {
      currentSegmentPath += `/${segment}`;
      const navItem = getNavigationItem(currentSegmentPath);
      
      if (navItem) {
        crumbs.push(navItem);
      } else {
        // Create a default breadcrumb for unknown paths
        crumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          path: currentSegmentPath
        });
      }
    });

    setBreadcrumbs(crumbs);
  }, [currentPath, navigation]);

  return breadcrumbs;
};

export default useDynamicNavigation;
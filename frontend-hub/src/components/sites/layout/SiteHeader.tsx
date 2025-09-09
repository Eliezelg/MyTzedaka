'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useTenant, useDynamicNavigation } from '@/providers/tenant-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const { tenant, theme } = useTenant();
  const navigation = useDynamicNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Si pas de tenant, ne rien afficher
  if (!tenant) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {tenant.settings?.favicon ? (
              <img 
                src={tenant.settings.favicon} 
                alt={tenant.name} 
                className="h-8 w-8"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white font-bold">
                {tenant.name[0]}
              </div>
            )}
            <span className="font-bold text-lg">{tenant.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation?.mainMenu?.map((item: any) => (
              <div key={item.path} className="relative">
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.path ? null : item.path)}
                      className={cn(
                        "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary",
                        openDropdown === item.path && "text-primary"
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {openDropdown === item.path && (
                      <div className="absolute top-full left-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          {item.subItems.map((subItem: any) => (
                            <Link
                              key={subItem.path}
                              href={subItem.path}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            
            {/* CTA Button */}
            <Link href="/donate" className="ml-4">
              <Button>Faire un Don</Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              {(navigation?.mobileMenu || navigation?.mainMenu)?.map((item: any) => (
                <div key={item.path}>
                  {item.subItems ? (
                    <div className="space-y-2">
                      <div className="font-medium text-sm px-3 py-2 text-gray-600">
                        {item.label}
                      </div>
                      <div className="pl-4 space-y-2">
                        {item.subItems.map((subItem: any) => (
                          <Link
                            key={subItem.path}
                            href={subItem.path}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.path}
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              
              <div className="pt-3 border-t">
                <Link href="/donate" className="w-full">
                  <Button className="w-full">Faire un Don</Button>
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
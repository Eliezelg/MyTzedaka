'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTenant, useDynamicNavigation } from '@/providers/tenant-provider'
import { Menu, X, ChevronDown } from 'lucide-react'

export function TenantHeader() {
  const { tenant } = useTenant()
  const navigation = useDynamicNavigation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo et nom */}
          <Link href={`/t/${tenant.slug}`} className="flex items-center">
            {tenant.logoPath && (
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL}/tenant/${tenant.id}/logo`}
                alt={tenant.name}
                className="h-10 w-auto mr-3"
                onError={(e) => {
                  // Masquer l'image si elle ne se charge pas
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
            <span className="text-xl font-bold text-gray-900">
              {tenant.name}
            </span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.mainMenu.map((item: any) => (
              <div key={item.path} className="relative">
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === item.path ? null : item.path)}
                      className="flex items-center text-gray-700 hover:text-primary transition"
                    >
                      {item.label}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    {dropdownOpen === item.path && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                        {item.subItems.map((subItem: any) => (
                          <Link
                            key={subItem.path}
                            href={`/t/${tenant.slug}${subItem.path}`}
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary"
                            onClick={() => setDropdownOpen(null)}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/t/${tenant.slug}${item.path === '/' ? '' : item.path}`}
                    className="text-gray-700 hover:text-primary transition"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Bouton menu mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Navigation mobile */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            {navigation.mobileMenu.map((item: any) => (
              <Link
                key={item.path}
                href={`/t/${tenant.slug}${item.path === '/' ? '' : item.path}`}
                className="block py-2 text-gray-700 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
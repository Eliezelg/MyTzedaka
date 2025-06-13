'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export function DonorPortalNavigation() {
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string

  const navigation = [
    {
      name: 'Tableau de bord',
      href: `/${locale}/donor-portal/dashboard`,
      icon: '📊',
      current: pathname === `/${locale}/donor-portal/dashboard`,
    },
    {
      name: 'Historique',
      href: `/${locale}/donor-portal/history`,
      icon: '📜',
      current: pathname === `/${locale}/donor-portal/history`,
    },
    {
      name: 'Annuaire',
      href: `/${locale}/donor-portal/directory`,
      icon: '🏢',
      current: pathname === `/${locale}/donor-portal/directory`,
    },
    {
      name: 'Favoris',
      href: `/${locale}/donor-portal/favorites`,
      icon: '❤️',
      current: pathname === `/${locale}/donor-portal/favorites`,
    },
    {
      name: 'Mon profil',
      href: `/${locale}/donor-portal/profile`,
      icon: '👨',
      current: pathname === `/${locale}/donor-portal/profile`,
    },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {navigation.map((item) => {
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-1 pt-1 pb-4 text-sm font-medium border-b-2 transition-colors',
                  item.current
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <span className="w-5 h-5 mr-2">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

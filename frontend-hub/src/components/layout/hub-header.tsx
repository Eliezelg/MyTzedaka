'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search,
  Menu,
  X,
  Heart,
  User,
  Settings,
  Bell,
  LogOut,
  Home,
  Building2,
  Target,
  TrendingUp,
  HelpCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/hub/search-bar'

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<any>
  badge?: number
  description?: string
}

export function HubHeader() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const navigationItems: NavigationItem[] = [
    {
      label: 'Accueil',
      href: '/',
      icon: Home,
      description: 'Page d\'accueil du Hub'
    },
    {
      label: 'Associations',
      href: '/associations',
      icon: Building2,
      description: 'Découvrir toutes les associations'
    },
    {
      label: 'Campagnes',
      href: '/campaigns',
      icon: Target,
      description: 'Parcourir les campagnes actives'
    },
    {
      label: 'Tendances',
      href: '/trending',
      icon: TrendingUp,
      description: 'Les campagnes populaires'
    },
    {
      label: 'Recherche',
      href: '/search',
      icon: Search,
      description: 'Rechercher dans le Hub'
    }
  ]

  const userMenuItems = [
    { label: 'Mon profil', href: '/profile', icon: User },
    { label: 'Mes dons', href: '/donations', icon: Heart, badge: 3 },
    { label: 'Notifications', href: '/notifications', icon: Bell, badge: 5 },
    { label: 'Paramètres', href: '/settings', icon: Settings },
    { label: 'Aide', href: '/help', icon: HelpCircle }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Hub Central</span>
            </Link>

            {/* Navigation desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-1 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {active && (
                      <motion.div
                        className="absolute -bottom-px left-0 right-0 h-0.5 bg-blue-600"
                        layoutId="activeTab"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Actions desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Barre de recherche */}
            <div className="w-64">
              <SearchBar
                onSearch={handleSearchSubmit}
                placeholder="Rechercher..."
                size="sm"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
              >
                3
              </Badge>
            </Button>

            {/* Menu utilisateur */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <span className="text-sm font-medium">John Doe</span>
              </Button>

              {/* Menu déroulant profil */}
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-medium">John Doe</div>
                    <div className="text-sm text-gray-600">john.doe@example.com</div>
                  </div>

                  {userMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}

                  <hr className="my-2" />
                  
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" />
                    <span>Se déconnecter</span>
                  </button>
                </motion.div>
              )}

              {/* Overlay pour fermer le menu profil */}
              {isProfileOpen && (
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
              )}
            </div>
          </div>

          {/* Actions mobile */}
          <div className="lg:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Barre de recherche mobile */}
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 py-4"
          >
            <SearchBar
              onSearch={handleSearchSubmit}
              placeholder="Rechercher..."
              autoFocus
            />
          </motion.div>
        )}

        {/* Menu mobile */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 py-4"
          >
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      active
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div>{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500">{item.description}</div>
                      )}
                    </div>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>

            <hr className="my-4" />

            {/* Menu utilisateur mobile */}
            <div className="space-y-2">
              <div className="px-3 py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">JD</span>
                  </div>
                  <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-sm text-gray-600">john.doe@example.com</div>
                  </div>
                </div>
              </div>

              {userMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}

              <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                <LogOut className="w-5 h-5" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
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
  HelpCircle,
  UserPlus,
  LogIn
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/hub/search-bar'
import { LanguageSelector } from '@/components/ui/language-selector'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useNavigationTranslations, useCommonTranslations } from '@/lib/translations'

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  description?: string
}

export function HubHeader() {
  const pathname = usePathname()
  const locale = useLocale()
  const { user, logout, isLoading } = useAuthContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Utiliser les hooks de traduction
  const t = useNavigationTranslations()

  const navigationItems: NavigationItem[] = [
    {
      label: t('home'),
      href: `/${locale}`,
      icon: Home,
      description: 'Page d\'accueil du Hub'
    },
    {
      label: t('associations'),
      href: `/${locale}/associations`,
      icon: Building2,
      description: 'Découvrir les associations'
    },
    {
      label: t('campaigns'),
      href: `/${locale}/campaigns`,
      icon: Target,
      badge: 12,
      description: 'Campagnes de collecte'
    },
    {
      label: t('trending'),
      href: `/${locale}/trending`,
      icon: TrendingUp,
      description: 'Campagnes populaires'
    }
  ]

  const profileMenuItems = [
    { label: t('dashboard'), href: `/${locale}/dashboard`, icon: Home },
    { label: t('profile'), href: `/${locale}/profile`, icon: User },
    { label: t('settings'), href: `/${locale}/settings`, icon: Settings },
    { label: t('help'), href: `/${locale}/help`, icon: HelpCircle },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      setIsProfileOpen(false)
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo et Navigation Principal */}
          <div className="flex items-center space-x-8">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Hub Central</span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                        layoutId="activeTab"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Actions de droite */}
          <div className="flex items-center space-x-4">
            {/* Barre de recherche */}
            <div className="hidden lg:block">
              <SearchBar />
            </div>

            {/* Bouton recherche mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Sélecteur de langue */}
            <LanguageSelector />

            {/* Authentification */}
            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">3</Badge>
                </Button>

                {/* Menu profil */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user.firstName}</span>
                  </Button>

                  {/* Dropdown menu */}
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <Badge variant="outline" className="mt-1">
                          {user.role === 'ASSOCIATION_ADMIN' ? 'Responsable' : 'Donateur'}
                        </Badge>
                      </div>
                      
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Link>
                      ))}
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          disabled={isLoading}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          {t('logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href={`/${locale}/auth/login`}>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:block">{t('login')}</span>
                  </Button>
                </Link>
                <Link href={`/${locale}/signup`}>
                  <Button size="sm" className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:block">{t('signup')}</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile ouvert */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white py-4"
          >
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-lg ${
                      isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}

        {/* Overlay de recherche mobile */}
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-white z-50 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Rechercher</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SearchBar />
          </motion.div>
        )}
      </div>

      {/* Click outside handlers */}
      {(isProfileOpen || isMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileOpen(false)
            setIsMenuOpen(false)
          }}
        />
      )}
    </header>
  )
}

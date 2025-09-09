'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, Home, Heart, Users, Search, Bell, 
  User, Settings, LogOut, ChevronDown, Sun, Moon,
  Globe, TrendingUp, Award, HelpCircle, MessageCircle
} from 'lucide-react';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const ModernNavbar: React.FC<NavbarProps> = ({ user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { 
      label: 'Accueil', 
      href: '/', 
      icon: Home,
      description: 'Page principale'
    },
    { 
      label: 'Associations', 
      href: '/associations', 
      icon: Users,
      description: 'Découvrir les associations',
      subItems: [
        { label: 'Toutes les associations', href: '/associations' },
        { label: 'Associations populaires', href: '/associations/popular' },
        { label: 'Nouvelles associations', href: '/associations/new' },
        { label: 'Créer une association', href: '/associations/create' }
      ]
    },
    { 
      label: 'Campagnes', 
      href: '/campaigns', 
      icon: TrendingUp,
      description: 'Campagnes de collecte',
      subItems: [
        { label: 'Campagnes actives', href: '/campaigns' },
        { label: 'Campagnes urgentes', href: '/campaigns/urgent' },
        { label: 'Campagnes terminées', href: '/campaigns/completed' }
      ]
    },
    { 
      label: 'Impact', 
      href: '/impact', 
      icon: Award,
      description: 'Notre impact collectif'
    },
    { 
      label: 'À propos', 
      href: '/about', 
      icon: HelpCircle,
      description: 'En savoir plus'
    }
  ];

  const userMenuItems = [
    { label: 'Mon profil', href: '/profile', icon: User },
    { label: 'Mes dons', href: '/donations', icon: Heart },
    { label: 'Mes associations', href: '/my-associations', icon: Users },
    { label: 'Paramètres', href: '/settings', icon: Settings },
    { label: 'Aide', href: '/help', icon: HelpCircle },
    { label: 'Déconnexion', href: '/logout', icon: LogOut }
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                MyTzedaka
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <div key={item.label} className="relative group">
                  <Link
                    href={item.href}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                      pathname === item.href
                        ? isScrolled 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-white/20 text-white'
                        : isScrolled
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.subItems && <ChevronDown className="w-3 h-3" />}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.subItems && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      <div className="p-2">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isScrolled 
                    ? 'text-gray-600 hover:bg-gray-100' 
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Language Selector */}
              <button className={`p-2 rounded-lg transition-colors duration-300 ${
                isScrolled 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-white/90 hover:bg-white/10'
              }`}>
                <Globe className="w-5 h-5" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isScrolled 
                    ? 'text-gray-600 hover:bg-gray-100' 
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              {user && (
                <button className="relative p-2 rounded-lg transition-colors duration-300">
                  <Bell className={`w-5 h-5 ${
                    isScrolled ? 'text-gray-600' : 'text-white/90'
                  }`} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              )}

              {/* User Menu or Login Button */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-300 hover:bg-gray-100"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                      ) : (
                        <span className="text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 ${
                      isScrolled ? 'text-gray-600' : 'text-white/90'
                    }`} />
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600">
                          <p className="text-white font-semibold">{user.name}</p>
                          <p className="text-white/80 text-sm">{user.email}</p>
                        </div>
                        <div className="p-2">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <button className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                      isScrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white/90 hover:bg-white/10'
                    }`}>
                      Connexion
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                      S'inscrire
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
                isScrolled 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white z-50 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 bg-gradient-to-br from-purple-600 to-blue-600">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-bold text-white">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors duration-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {user && (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-white/80 text-sm">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {navItems.map((item) => (
                  <div key={item.label} className="mb-2">
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        pathname === item.href
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </Link>
                    {item.subItems && (
                      <div className="ml-12 mt-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-600 hover:text-purple-700 transition-colors duration-200"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!user && (
                <div className="p-4 border-t">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-3 mb-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-300">
                      Connexion
                    </button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300">
                      S'inscrire
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl mx-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher une association, une campagne..."
                    className="w-full px-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-300"
                    autoFocus
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-3">Recherches populaires</p>
                  <div className="flex flex-wrap gap-2">
                    {['Éducation', 'Santé', 'Urgence Gaza', 'Enfance', 'Aide alimentaire'].map((tag) => (
                      <button
                        key={tag}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-300 text-sm font-medium"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ModernNavbar;
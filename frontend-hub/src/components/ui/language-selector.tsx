'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ChevronDown, Globe } from 'lucide-react'
import { locales } from '@/i18n'

const languages = {
  fr: { name: 'Français', flag: '🇫🇷' },
  he: { name: 'עברית', flag: '🇮🇱' }
}

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const localeFromHook = useLocale()
  
  // Extraire la locale actuelle du pathname comme fallback
  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  const currentLocale = localeMatch ? localeMatch[1] : localeFromHook

  const handleLanguageChange = (newLocale: string) => {
    // Ne rien faire si c'est déjà la locale actuelle
    if (newLocale === currentLocale) {
      setIsOpen(false)
      return
    }
    
    // Utiliser une expression régulière pour remplacer la locale
    const newPathname = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, `/${newLocale}`)
    
    // Si le pathname n'a pas changé, c'est qu'il n'y avait pas de locale
    // Dans ce cas, ajouter la nouvelle locale
    const finalPath = newPathname === pathname ? `/${newLocale}${pathname}` : newPathname
    
    // Forcer un rechargement complet pour les changements de langue
    window.location.replace(finalPath)
    setIsOpen(false)
  }

  const currentLanguage = languages[currentLocale as keyof typeof languages] || languages.fr

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le menu */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu déroulant */}
          <div className="absolute right-0 top-full z-[9999] mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {locales.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`flex w-full items-center space-x-3 px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                  lang === currentLocale ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{languages[lang as keyof typeof languages].flag}</span>
                <span>{languages[lang as keyof typeof languages].name}</span>
                {lang === currentLocale && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Version simplifiée pour les footers
export function SimpleLanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const localeFromHook = useLocale()
  
  // Extraire la locale actuelle du pathname
  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  const currentLocale = localeMatch ? localeMatch[1] : localeFromHook

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return
    
    const newPathname = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, `/${newLocale}`)
    const finalPath = newPathname === pathname ? `/${newLocale}${pathname}` : newPathname
    
    // Forcer un rechargement complet pour les changements de langue
    window.location.replace(finalPath)
  }

  return (
    <div className="flex space-x-2">
      {locales.map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`flex items-center space-x-1 rounded px-2 py-1 text-sm transition-colors ${
            lang === currentLocale
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>{languages[lang as keyof typeof languages].flag}</span>
          <span className="hidden sm:inline">
            {languages[lang as keyof typeof languages].name}
          </span>
        </button>
      ))}
    </div>
  )
}
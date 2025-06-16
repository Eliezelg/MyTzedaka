'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ChevronDown, Globe } from 'lucide-react'
import { locales } from '@/i18n'
import { useI18nRouter } from '@/hooks/useI18nRouter'

const languages = {
  fr: { name: 'Français', flag: '🇫🇷' },
  he: { name: 'עברית', flag: '🇮🇱' }
}

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useI18nRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const handleLanguageChange = (newLocale: string) => {
    // Ne rien faire si c'est déjà la locale actuelle
    if (newLocale === locale) {
      setIsOpen(false)
      return
    }
    
    // Extraire le pathname sans la locale actuelle
    // pathname peut être "/fr/associations" ou juste "/"
    const segments = pathname.split('/')
    const currentLocaleIndex = segments.findIndex(seg => seg === locale)
    
    let pathWithoutLocale = '/'
    if (currentLocaleIndex !== -1) {
      // Enlever la locale du pathname
      segments.splice(currentLocaleIndex, 1)
      pathWithoutLocale = segments.join('/') || '/'
    } else if (pathname !== '/') {
      // Si pas de locale dans le path mais ce n'est pas la racine
      pathWithoutLocale = pathname
    }
    
    // S'assurer que le path commence par /
    if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale
    }
    
    // Rediriger vers la nouvelle locale
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
    router.push(newPath)
    setIsOpen(false)
  }

  const currentLanguage = languages[locale as keyof typeof languages]

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
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu déroulant */}
          <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {locales.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`flex w-full items-center space-x-3 px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                  lang === locale ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{languages[lang as keyof typeof languages].flag}</span>
                <span>{languages[lang as keyof typeof languages].name}</span>
                {lang === locale && (
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
  const router = useI18nRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const handleLanguageChange = (newLocale: string) => {
    // Ne rien faire si c'est déjà la locale actuelle
    if (newLocale === locale) return
    
    // Extraire le pathname sans la locale actuelle
    const segments = pathname.split('/')
    const currentLocaleIndex = segments.findIndex(seg => seg === locale)
    
    let pathWithoutLocale = '/'
    if (currentLocaleIndex !== -1) {
      segments.splice(currentLocaleIndex, 1)
      pathWithoutLocale = segments.join('/') || '/'
    } else if (pathname !== '/') {
      pathWithoutLocale = pathname
    }
    
    if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale
    }
    
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
    router.push(newPath)
  }

  return (
    <div className="flex space-x-2">
      {locales.map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`flex items-center space-x-1 rounded px-2 py-1 text-sm transition-colors ${
            lang === locale
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

'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ClientTestComponent() {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('common')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    console.log('ClientTest - Current locale:', locale)
    console.log('ClientTest - Current pathname:', pathname)
    console.log('ClientTest - Welcome translation:', t('welcome'))
    console.log('ClientTest - Search translation:', t('search'))
  }, [locale, pathname, t])
  
  if (!mounted) {
    return <div>Loading...</div>
  }
  
  return (
    <div className="space-y-2">
      <div>
        <strong>Locale from useLocale():</strong> {locale}
      </div>
      
      <div>
        <strong>Current pathname:</strong> {pathname}
      </div>
      
      <div>
        <strong>Welcome (client):</strong> {t('welcome')}
      </div>
      
      <div>
        <strong>Search (client):</strong> {t('search')}
      </div>
      
      <div>
        <strong>Search placeholder (client):</strong> {t('searchPlaceholder')}
      </div>
      
      <div>
        <strong>Expected for {locale}:</strong> 
        {locale === 'he' ? 'ברוכים הבאים / חיפוש / חיפוש עמותה, קמפיין...' : 'Bienvenue / Rechercher / Rechercher une association, une campagne...'}
      </div>
    </div>
  )
}
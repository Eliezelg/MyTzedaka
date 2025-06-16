import { getTranslations } from 'next-intl/server'
import { LanguageSelector } from '@/components/ui/language-selector'
import ClientTestComponent from './client-test'

type Props = {
  params: { locale: string }
}

export default async function TestI18nPage({ params: { locale } }: Props) {
  // Traductions côté serveur
  const t = await getTranslations({ locale, namespace: 'common' })
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Test i18n - {locale}</h1>
      
      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Server-side translations:</h2>
          <div>
            <strong>Locale:</strong> {locale}
          </div>
          <div>
            <strong>Welcome (server):</strong> {t('welcome')}
          </div>
          <div>
            <strong>Search (server):</strong> {t('search')}
          </div>
          <div>
            <strong>Search placeholder (server):</strong> {t('searchPlaceholder')}
          </div>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Client-side translations:</h2>
          <ClientTestComponent />
        </div>
        
        <div>
          <LanguageSelector />
        </div>
      </div>
    </div>
  )
}
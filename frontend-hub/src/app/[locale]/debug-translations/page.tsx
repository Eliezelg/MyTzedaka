import { getTranslations, getMessages } from 'next-intl/server'

type Props = {
  params: { locale: string }
}

export default async function DebugTranslationsPage({ params: { locale } }: Props) {
  const messages = await getMessages({ locale })
  const t = await getTranslations({ locale, namespace: 'common' })
  
  const welcomeMessage = messages?.common?.welcome || 'NOT_FOUND'
  const searchMessage = messages?.common?.search || 'NOT_FOUND'
  const searchPlaceholder = messages?.common?.searchPlaceholder || 'NOT_FOUND'
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Debug Translations</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Locale:</strong> {locale}
        </div>
        
        <div>
          <strong>Messages object keys:</strong> {Object.keys(messages || {}).join(', ')}
        </div>
        
        <div>
          <strong>Common keys:</strong> {Object.keys(messages?.common || {}).slice(0, 10).join(', ')}
        </div>
        
        <div>
          <strong>Welcome (direct from messages):</strong> {welcomeMessage}
        </div>
        
        <div>
          <strong>Search (direct from messages):</strong> {searchMessage}
        </div>
        
        <div>
          <strong>Search placeholder (direct from messages):</strong> {searchPlaceholder}
        </div>
        
        <div>
          <strong>Welcome (via getTranslations):</strong> {t('welcome')}
        </div>
        
        <div>
          <strong>Expected for {locale}:</strong>
        </div>
        
        {locale === 'he' ? (
          <div className="text-right">
            <div>ברוכים הבאים (welcome)</div>
            <div>חיפוש (search)</div>
            <div>חיפוש עמותה, קמפיין... (search placeholder)</div>
          </div>
        ) : (
          <div>
            <div>Bienvenue (welcome)</div>
            <div>Rechercher (search)</div>
            <div>Rechercher une association, une campagne... (search placeholder)</div>
          </div>
        )}
      </div>
    </div>
  )
}
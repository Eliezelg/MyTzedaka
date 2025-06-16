import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { redirect } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { locales } from '@/i18n'
import { QueryProvider } from '@/lib/query-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { HubHeader } from '@/components/layout/hub-header'
import { ClientLayout } from '@/components/layout/client-layout'
import { LanguageSelector } from '@/components/ui/language-selector'

const inter = Inter({ subsets: ['latin'] })

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' })
  
  return {
    title: locale === 'he' ? 'מרכז התרומות - פורטל תורמים מאוחד' : 'Hub Central - Portail Donateur Unifié',
    description: locale === 'he' 
      ? 'גלו ותמכו בעמותות צדקה בפורטל מאוחד. תרמו בקלות ועקבו אחר השפעת התרומות שלכם.'
      : 'Découvrez et soutenez les associations caritatives dans un portail unifié. Donnez facilement et suivez l\'impact de vos contributions.',
    keywords: locale === 'he' 
      ? 'תרומה, צדקה, עמותות, גיוס כספים, תרומות'
      : 'don, charité, associations, fundraising, tzedaka',
    openGraph: {
      title: locale === 'he' ? 'מרכז התרומות - פורטל תורמים מאוחד' : 'Hub Central - Portail Donateur Unifié',
      description: locale === 'he' 
        ? 'גלו ותמכו בעמותות צדקה בפורטל מאוחד.'
        : 'Découvrez et soutenez les associations caritatives dans un portail unifié.',
      type: 'website',
      locale: locale === 'he' ? 'he_IL' : 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'he' ? 'מרכז התרומות - פורטל תורמים מאוחד' : 'Hub Central - Portail Donateur Unifié',
      description: locale === 'he' 
        ? 'גלו ותמכו בעמותות צדקה בפורטל מאוחד.'
        : 'Découvrez et soutenez les associations caritatives dans un portail unifié.',
    },
    authors: [{ name: 'Cascade' }],
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Props) {
  // Valider que la locale est supportée
  if (!locales.includes(locale as any)) {
    // Rediriger vers la locale par défaut au lieu de notFound()
    redirect('/fr')
  }

  const messages = await getMessages({ locale })

  return (
    <html 
      lang={locale} 
      dir={locale === 'he' ? 'rtl' : 'ltr'}
      className="scroll-smooth"
    >
      <body className={inter.className}>
        <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
          <QueryProvider>
            <AuthProvider>
              <ClientLayout>
                <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50">
                  {/* Header Navigation */}
                  <HubHeader />

                  {/* Main Content */}
                  <main className="flex-1">
                    {children}
                  </main>

                  {/* Footer */}
                  <footer className="bg-gray-900 text-white">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div className="md:col-span-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                              <span className="text-sm font-bold text-white">TC</span>
                            </div>
                            <span className="text-xl font-bold">
                              {locale === 'he' ? 'מרכז התרומות' : 'Hub Central'}
                            </span>
                          </div>
                          <p className="mt-4 text-gray-400">
                            {locale === 'he' 
                              ? 'פלטפורמה מאוחדת לתמיכה בעמותות ומטרות חברתיות'
                              : 'Plateforme unifiée pour soutenir les associations et causes sociales'
                            }
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-wider">
                            {locale === 'he' ? 'קישורים' : 'Liens'}
                          </h3>
                          <ul className="mt-4 space-y-2">
                            <li>
                              <a href={`/${locale}`} className="text-gray-400 hover:text-white">
                                {locale === 'he' ? 'בית' : 'Accueil'}
                              </a>
                            </li>
                            <li>
                              <a href={`/${locale}/associations`} className="text-gray-400 hover:text-white">
                                {locale === 'he' ? 'עמותות' : 'Associations'}
                              </a>
                            </li>
                            <li>
                              <a href={`/${locale}/campaigns`} className="text-gray-400 hover:text-white">
                                {locale === 'he' ? 'קמפיינים' : 'Campagnes'}
                              </a>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                            {locale === 'he' ? 'שפות' : 'Langues'}
                          </h3>
                          <div className="mt-4">
                            <LanguageSelector />
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 border-t border-gray-800 pt-8">
                        <p className="text-center text-gray-400">
                          2025 {locale === 'he' ? 'מרכז התרומות' : 'Hub Central'}. 
                          {locale === 'he' ? ' כל הזכויות שמורות.' : ' Tous droits réservés.'}
                        </p>
                      </div>
                    </div>
                  </footer>
                </div>
              </ClientLayout>
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

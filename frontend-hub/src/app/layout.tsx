import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/query-provider'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { HubHeader } from '@/components/layout/hub-header'
import { ClientLayout } from '@/components/layout/client-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hub Central - Portail Donateur Unifié',
  description: 'Découvrez et soutenez les associations caritatives dans un portail unifié. Donnez facilement et suivez l\'impact de vos contributions.',
  keywords: 'don, charité, associations, fundraising, tzedaka',
  openGraph: {
    title: 'Hub Central - Portail Donateur Unifié',
    description: 'Découvrez et soutenez les associations caritatives dans un portail unifié.',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hub Central - Portail Donateur Unifié',
    description: 'Découvrez et soutenez les associations caritatives dans un portail unifié.',
  },
  authors: [{ name: 'Cascade' }],
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={inter.className}>
        <QueryProvider>
          <ClientLayout>
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50">
              {/* Header Navigation */}
              <HubHeader />

              {/* Main Content */}
              <main className="flex-1">
                {children}
              </main>

              {/* Footer */}
              <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="container mx-auto px-4 py-12">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">Hub Central</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Plateforme centralisée pour découvrir et soutenir les associations caritatives.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Découvrir</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li><Link href="/associations" className="hover:text-primary-600">Associations</Link></li>
                        <li><Link href="/campagnes" className="hover:text-primary-600">Campagnes</Link></li>
                        <li><Link href="/categories" className="hover:text-primary-600">Catégories</Link></li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li><Link href="/aide" className="hover:text-primary-600">Centre d'aide</Link></li>
                        <li><Link href="/contact" className="hover:text-primary-600">Contact</Link></li>
                        <li><Link href="/faq" className="hover:text-primary-600">FAQ</Link></li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Légal</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li><Link href="/confidentialite" className="hover:text-primary-600">Confidentialité</Link></li>
                        <li><Link href="/mentions-legales" className="hover:text-primary-600">Mentions légales</Link></li>
                        <li><Link href="/cgu" className="hover:text-primary-600">CGU</Link></li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-8 mt-8 text-center text-sm text-gray-600">
                    <p>&copy; 2024 Hub Central. Tous droits réservés.</p>
                  </div>
                </div>
              </footer>
            </div>
          </ClientLayout>
        </QueryProvider>
      </body>
    </html>
  )
}

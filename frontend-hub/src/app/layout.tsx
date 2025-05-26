import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/query-provider'
import Link from 'next/link'
import { Heart, Search, Users, Gift } from 'lucide-react'

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
          <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header Navigation */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
              <nav className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      Hub Central
                    </span>
                  </Link>

                  {/* Navigation Links */}
                  <div className="hidden md:flex items-center space-x-8">
                    <Link 
                      href="/" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Accueil</span>
                    </Link>
                    <Link 
                      href="/associations" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      <span>Associations</span>
                    </Link>
                    <Link 
                      href="/campagnes" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Campagnes</span>
                    </Link>
                    <Link 
                      href="/recherche" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      <span>Rechercher</span>
                    </Link>
                  </div>

                  {/* Mobile Menu Button */}
                  <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </nav>
            </header>

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
        </QueryProvider>
      </body>
    </html>
  )
}

import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextRequest, NextResponse } from 'next/server';

// Créer le middleware next-intl
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Force toujours le préfixe de locale dans l'URL
  localeDetection: true
});

export default function middleware(request: NextRequest) {
  // Appliquer le middleware next-intl pour toutes les routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Matcher pour toutes les routes sauf les fichiers statiques et l'API
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|.*\\..*).*)' 
  ],
};

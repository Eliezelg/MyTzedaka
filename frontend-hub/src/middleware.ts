import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextRequest } from 'next/server';

// Créer le middleware next-intl
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: true
});

export default function middleware(request: NextRequest) {
  // Appliquer le middleware next-intl
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Matcher pour toutes les routes sauf les fichiers statiques et l'API
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|.*\\..*).*)' 
  ],
};

import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// Middleware simplifié pour l'internationalisation
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // Revenir à 'as-needed' pour éviter les conflits
});

export default intlMiddleware;

export const config = {
  matcher: [
    // Matcher pour toutes les routes sauf les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|.*\\..*).*)',
  ],
};

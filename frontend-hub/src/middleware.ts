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

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/associations/create',
  '/dashboard',
  '/associations/*/dashboard',
  '/associations/*/stripe-onboarding'
];

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  
  // Extraire la locale et le path
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  
  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => {
    if (route.includes('*')) {
      const pattern = route.replace('*', '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathWithoutLocale);
    }
    return pathWithoutLocale === route;
  });
  
  if (isProtectedRoute) {
    // Vérifier la présence du token d'authentification
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      // Rediriger vers la page de login avec returnUrl
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    // Matcher pour toutes les routes sauf les fichiers statiques et l'API
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|.*\\..*).*)' 
  ],
};

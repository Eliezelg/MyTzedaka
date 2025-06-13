import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale } from './i18n';

// Middleware pour l'internationalisation
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always' // Changé de 'as-needed' à 'always' pour forcer le préfixe
});

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/associations/create',
  '/associations/manage',
  '/campaigns/create',
  '/campaigns/manage',
  '/admin'
]

// Routes d'authentification (accessible seulement si non connecté)
const authRoutes = [
  '/login',
  '/signup'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Extraire la locale depuis l'URL
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  
  // Si pas de locale dans l'URL, laisser next-intl gérer la redirection
  if (pathnameIsMissingLocale) {
    return intlMiddleware(request);
  }
  
  // Extraire la locale actuelle
  const locale = pathname.split('/')[1];
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  
  // Récupérer le token depuis les cookies
  const token = request.cookies.get('auth_token')?.value
  const isAuthenticated = !!token

  // Vérifier si la route est protégée (sans locale)
  const isProtectedRoute = protectedRoutes.some(route => 
    pathnameWithoutLocale.startsWith(route)
  )
  
  // Vérifier si c'est une route d'authentification (sans locale)
  const isAuthRoute = authRoutes.some(route => 
    pathnameWithoutLocale.startsWith(route)
  )

  // Rediriger vers login si route protégée et non authentifié
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirect', pathnameWithoutLocale)
    return NextResponse.redirect(loginUrl)
  }

  // Rediriger vers dashboard si route d'auth et déjà authentifié
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  // Appliquer le middleware d'internationalisation
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Matcher pour toutes les routes sauf les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api).*)',
  ],
}

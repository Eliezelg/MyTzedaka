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

// Domaines réservés pour le hub central
const HUB_DOMAINS = [
  'localhost',
  'mytzedaka.com',
  'www.mytzedaka.com',
  'hub.mytzedaka.com'
];

// Vérifier si c'est un domaine custom
function isCustomDomain(hostname: string): boolean {
  // Nettoyer le hostname (enlever le port si présent)
  const cleanHostname = hostname.split(':')[0];
  
  // Si c'est un domaine hub, ce n'est pas custom
  if (HUB_DOMAINS.includes(cleanHostname)) {
    return false;
  }
  
  // Si c'est un sous-domaine de localhost (ex: siah.localhost)
  if (cleanHostname.endsWith('.localhost') && cleanHostname !== 'localhost') {
    return true;
  }
  
  // Si c'est un sous-domaine de mytzedaka.com (sauf hub)
  if (cleanHostname.endsWith('.mytzedaka.com') && !cleanHostname.startsWith('hub.')) {
    return true;
  }
  
  // Tout autre domaine est considéré comme custom
  return true;
}

export default function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;
  
  // Si on accède à /t/[slug] (sites tenants), ne pas rediriger avec i18n
  // Le path doit gérer ses propres locales
  if (pathname.startsWith('/t/')) {
    const response = NextResponse.next();
    response.headers.set('x-site-mode', 'tenant');
    return response;
  }
  
  // Si on accède directement à /sites/[domain], ne pas appliquer le middleware i18n
  if (pathname.startsWith('/sites/')) {
    // Extraire le domain depuis l'URL
    const pathParts = pathname.split('/');
    const tenantIdentifier = pathParts[2]; // /sites/[domain]/...
    
    if (tenantIdentifier) {
      // Ajouter les headers pour le tenant
      const response = NextResponse.next();
      response.headers.set('x-tenant-identifier', tenantIdentifier);
      response.headers.set('x-site-mode', 'custom');
      return response;
    }
  }
  
  // Détection site custom vs hub
  if (isCustomDomain(hostname)) {
    // Extraire l'identifiant du tenant
    let tenantIdentifier = hostname.split(':')[0];
    
    // Pour les sous-domaines de localhost (ex: siah.localhost)
    if (tenantIdentifier.endsWith('.localhost')) {
      tenantIdentifier = tenantIdentifier.replace('.localhost', '');
    }
    // Pour les sous-domaines de mytzedaka.com
    else if (tenantIdentifier.endsWith('.mytzedaka.com')) {
      tenantIdentifier = tenantIdentifier.replace('.mytzedaka.com', '');
    }
    
    // Créer une nouvelle URL avec le path rewrité
    const url = request.nextUrl.clone();
    
    // Gérer les routes avec locale (ex: /fr, /he)
    const localePattern = /^\/(fr|he|en)(\/.*)?$/;
    const match = pathname.match(localePattern);
    
    if (match) {
      // Si c'est une route avec locale, rediriger vers /sites/[domain]/[path sans locale]
      const pathWithoutLocale = match[2] || '';
      url.pathname = `/sites/${tenantIdentifier}${pathWithoutLocale}`;
    } else if (pathname === '/') {
      url.pathname = `/sites/${tenantIdentifier}`;
    } else {
      url.pathname = `/sites/${tenantIdentifier}${pathname}`;
    }
    
    console.log(`[Middleware] Custom domain detected: ${hostname} -> ${url.pathname}`);
    
    // Ajouter les headers pour le tenant
    const response = NextResponse.rewrite(url);
    response.headers.set('x-tenant-identifier', tenantIdentifier);
    response.headers.set('x-site-mode', 'custom');
    
    return response;
  }
  
  // Pour le hub, continuer avec le middleware i18n
  const response = intlMiddleware(request);
  
  // Extraire la locale et le path
  const currentPath = request.nextUrl.pathname;
  const locale = currentPath.split('/')[1];
  const pathWithoutLocale = currentPath.replace(`/${locale}`, '') || '/';
  
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
      // Rediriger vers la page de login unifiée avec returnUrl
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  response.headers.set('x-site-mode', 'hub');
  return response;
}

export const config = {
  matcher: [
    // Matcher pour toutes les routes sauf les fichiers statiques et l'API
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|.*\\..*).*)' 
  ],
};

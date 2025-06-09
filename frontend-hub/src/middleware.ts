import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
  
  // Récupérer le token depuis les cookies
  const token = request.cookies.get('auth_token')?.value
  const isAuthenticated = !!token

  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Vérifier si c'est une route d'authentification
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Rediriger vers login si route protégée et non authentifié
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Rediriger vers dashboard si route d'auth et déjà authentifié
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Matcher pour toutes les routes sauf les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

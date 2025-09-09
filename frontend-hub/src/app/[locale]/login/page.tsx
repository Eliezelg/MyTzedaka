'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function LoginRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Extraire la locale du chemin actuel
    const locale = pathname?.split('/')[1] || 'fr'
    // Rediriger vers la page de login unifiée
    router.replace(`/${locale}/auth/login`)
  }, [router, pathname])

  return null
}
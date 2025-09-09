'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function SignupRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Extraire la locale du chemin actuel
    const locale = pathname?.split('/')[1] || 'fr'
    // Rediriger vers la page de signup unifiée
    router.replace(`/${locale}/auth/signup`)
  }, [router, pathname])

  return null
}
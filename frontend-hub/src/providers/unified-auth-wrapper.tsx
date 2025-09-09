'use client'

import { ReactNode } from 'react'
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext'

interface AuthWrapperProps {
  children: ReactNode
}

export function UnifiedAuthWrapper({ children }: AuthWrapperProps) {
  // Toujours utiliser UnifiedAuthProvider maintenant
  // L'ancien AuthProvider n'est plus nécessaire
  return <UnifiedAuthProvider>{children}</UnifiedAuthProvider>
}
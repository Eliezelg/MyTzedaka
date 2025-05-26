"use client"

import { ReactNode } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { ToastProvider } from '@/components/ui/toast'
import { usePathname } from 'next/navigation'

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()

  return (
    <ToastProvider>
      <PageTransition key={pathname}>
        {children}
      </PageTransition>
    </ToastProvider>
  )
}

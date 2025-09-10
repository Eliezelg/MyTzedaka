'use client'

import { useParams } from 'next/navigation'
import { CompleteAssociationDashboard } from '@/components/shared/complete-association-dashboard'
import { useTenant } from '@/providers/tenant-provider'
import { useAuthContext } from '@/hooks/useAuthContext'

export default function TenantDashboardPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenant } = useTenant()
  const { user } = useAuthContext()

  return (
    <CompleteAssociationDashboard 
      slug={slug} 
      isHub={false}
      association={tenant}
      user={user}
    />
  )
}
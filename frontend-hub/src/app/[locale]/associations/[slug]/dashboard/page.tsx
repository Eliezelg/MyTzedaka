'use client'

import UnifiedHubDashboard from './unified-page'

export default function AssociationDashboard({ params }: { params: { slug: string } }) {
  return <UnifiedHubDashboard params={params} />
}
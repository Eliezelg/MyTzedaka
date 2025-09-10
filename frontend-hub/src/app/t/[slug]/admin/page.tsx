'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  useEffect(() => {
    // Redirection automatique vers le dashboard
    router.replace(`/t/${slug}/dashboard`)
  }, [slug, router])

  return (
    <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirection vers le dashboard...</p>
      </div>
    </main>
  )
}
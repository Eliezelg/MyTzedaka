'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function NotFoundPage() {
  const t = useTranslations('errors')
  const params = useParams()
  const locale = params.locale as string

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
        </div>
        
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('pageNotFound')}
          </h2>
          <p className="text-gray-600">
            {t('pageNotFoundDescription')}
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}

import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DonorDashboard } from '@/components/donor-portal/donor-dashboard'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'donorPortal' })

  return {
    title: t('dashboard.title'),
    description: t('dashboard.description'),
  }
}

export default function DonorDashboardPage({
  params,
}: {
  params: { locale: string }
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {/* Dynamiquement depuis les traductions */}
          Tableau de bord donateur
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de toutes vos contributions cross-associations
        </p>
      </div>

      {/* Dashboard principal */}
      <DonorDashboard />
    </div>
  )
}

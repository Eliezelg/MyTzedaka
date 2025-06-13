import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DonationHistory } from '@/components/donor-portal/donation-history'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'donorPortal' })

  return {
    title: t('history.title'),
    description: t('history.description'),
  }
}

export default function DonationHistoryPage({
  params,
}: {
  params: { locale: string }
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Historique des dons
        </h1>
        <p className="text-gray-600">
          Tous vos dons cross-associations avec filtres avancés
        </p>
      </div>

      {/* Historique avec filtres */}
      <DonationHistory />
    </div>
  )
}

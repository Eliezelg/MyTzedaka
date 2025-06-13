import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AssociationDirectory } from '@/components/donor-portal/association-directory'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'donorPortal' })

  return {
    title: t('directory.title'),
    description: t('directory.description'),
  }
}

export default function AssociationDirectoryPage({
  params,
}: {
  params: { locale: string }
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Annuaire des associations
        </h1>
        <p className="text-gray-600">
          Découvrez toutes les associations de la plateforme
        </p>
      </div>

      {/* Annuaire avec recherche et filtres */}
      <AssociationDirectory />
    </div>
  )
}

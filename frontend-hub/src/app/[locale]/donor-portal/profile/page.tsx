import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DonorProfile } from '@/components/donor-portal/donor-profile'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'donorPortal' })

  return {
    title: t('profile.title'),
    description: t('profile.description'),
  }
}

export default function DonorProfilePage({
  params,
}: {
  params: { locale: string }
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mon profil donateur
        </h1>
        <p className="text-gray-600">
          Gérez vos informations personnelles et préférences
        </p>
      </div>

      {/* Profil donateur */}
      <DonorProfile />
    </div>
  )
}

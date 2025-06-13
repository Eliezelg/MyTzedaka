import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DonorPortalNavigation } from '@/components/donor-portal/donor-portal-navigation'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'donorPortal' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default function DonorPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Vérifier que la locale est supportée
  if (!['fr', 'he'].includes(params.locale)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation du portail donateur */}
      <DonorPortalNavigation />
      
      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

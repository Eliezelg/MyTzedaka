import { redirect } from 'next/navigation'

export default function RootPage() {
  // Cette page ne devrait jamais être rendue car le middleware next-intl
  // redirige automatiquement vers la locale appropriée
  // Redirection vers la locale par défaut (sera gérée par next-intl)
  redirect('/fr')
  return null
}

import { redirect } from 'next/navigation'

export default function GlobalNotFound() {
  // Rediriger vers la page 404 localisée par défaut
  redirect('/fr/not-found')
}

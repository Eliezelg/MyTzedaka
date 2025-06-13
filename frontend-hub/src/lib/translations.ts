import { useTranslations } from 'next-intl'

// Hook pour les traductions communes
export function useCommonTranslations() {
  return useTranslations('common')
}

// Hook pour les traductions de navigation
export function useNavigationTranslations() {
  return useTranslations('navigation')
}

// Hook pour les traductions des formulaires
export function useFormTranslations() {
  return useTranslations('forms')
}

// Hook pour les traductions des associations
export function useAssociationTranslations() {
  return useTranslations('associations')
}

// Hook pour les traductions des campagnes
export function useCampaignTranslations() {
  return useTranslations('campaigns')
}

// Hook pour les traductions des dons
export function useDonationTranslations() {
  return useTranslations('donations')
}

// Hook pour les traductions d'authentification
export function useAuthTranslations() {
  return useTranslations('auth')
}

// Hook pour les traductions du dashboard
export function useDashboardTranslations() {
  return useTranslations('dashboard')
}

// Hook pour les traductions d'erreurs
export function useErrorTranslations() {
  return useTranslations('errors')
}

// Fonction utilitaire pour les traductions côté serveur
export function getServerTranslations(namespace: string) {
  // Cette fonction sera utilisée dans les composants serveur
  // avec getTranslations de next-intl/server
  return {
    namespace,
    // Autres utilitaires si nécessaire
  }
}

// Types pour les namespaces de traduction
export type TranslationNamespace = 
  | 'common'
  | 'navigation'
  | 'forms'
  | 'associations'
  | 'campaigns'
  | 'donations'
  | 'auth'
  | 'dashboard'
  | 'errors'

// Fonction pour formater les montants selon la locale
export function formatCurrency(amount: number, currency: string = 'EUR', locale: string = 'fr') {
  if (locale === 'he') {
    // Pour l'hébreu, utiliser les shekels comme devise par défaut
    const targetCurrency = currency === 'EUR' ? 'ILS' : currency
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: targetCurrency,
    }).format(amount)
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Fonction pour formater les dates selon la locale
export function formatDate(date: Date | string, locale: string = 'fr') {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (locale === 'he') {
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj)
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

// Fonction pour formater les nombres selon la locale
export function formatNumber(number: number, locale: string = 'fr') {
  if (locale === 'he') {
    return new Intl.NumberFormat('he-IL').format(number)
  }
  
  return new Intl.NumberFormat('fr-FR').format(number)
}

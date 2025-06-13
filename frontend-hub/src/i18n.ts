import { getRequestConfig } from 'next-intl/server';

// Langues supportées
export const locales = ['fr', 'he'] as const;
export type Locale = (typeof locales)[number];

// Langue par défaut
export const defaultLocale: Locale = 'fr';

export default getRequestConfig(async ({ locale }) => {
  // Valider que la locale incoming est supportée  
  if (!locales.includes(locale as any)) {
    // Retourner la configuration pour la locale par défaut si la locale n'est pas supportée
    return {
      locale: defaultLocale,
      messages: (await import(`../messages/${defaultLocale}/index.json`)).default
    };
  }

  return {
    locale: locale as string,
    messages: (await import(`../messages/${locale}/index.json`)).default
  };
});

import { getRequestConfig } from 'next-intl/server';

// Langues supportées
export const locales = ['fr', 'he'] as const;
export type Locale = (typeof locales)[number];

// Langue par défaut
export const defaultLocale: Locale = 'fr';

export default getRequestConfig(async ({ locale }) => {
  // Valider que la locale incoming est supportée  
  if (!locales.includes(locale as any)) {
    const defaultIndex = (await import(`../messages/${defaultLocale}/index.json`)).default;
    const defaultCommon = (await import(`../messages/${defaultLocale}/common.json`)).default;
    return {
      locale: defaultLocale,
      messages: { common: defaultCommon, ...defaultIndex }
    };
  }

  try {
    // Charger les fichiers de messages pour la locale demandée
    const messages: Record<string, any> = {};
    
    // Charger les messages communs et index en premier
    const commonMessages = (await import(`../messages/${locale}/common.json`)).default;
    const indexMessages = (await import(`../messages/${locale}/index.json`)).default;
    
    // Charger les autres namespaces
    const namespaces = [
      'actions',
      'associations',
      'auth',
      'campaigns',
      'components',
      'connectedUser',
      'dashboard',
      'directory',
      'donations',
      'empty',
      'errors',
      'filters',
      'forms',
      'goals',
      'metrics',
      'navigation',
      'page',
      'performance',
      'progress',
      'search',
      'socialImpact',
      'stats'
    ];

    // Charger tous les namespaces de manière asynchrone
    const namespacePromises = namespaces.map(async (ns) => {
      try {
        const module = await import(`../messages/${locale}/${ns}.json`);
        messages[ns] = module.default;
      } catch (error) {
        console.warn(`Namespace ${ns} not found for locale ${locale}`);
      }
    });

    await Promise.all(namespacePromises);
    
    // Fusionner avec les messages communs et index
    return {
      locale: locale as string,
      messages: {
        ...messages,
        common: commonMessages,
        ...indexMessages
      }
    };
  } catch (error) {
    console.error('Error loading messages for locale:', locale, error);
    const fallbackIndex = (await import(`../messages/${defaultLocale}/index.json`)).default;
    const fallbackCommon = (await import(`../messages/${defaultLocale}/common.json`)).default;
    return {
      locale: defaultLocale,
      messages: { common: fallbackCommon, ...fallbackIndex }
    };
  }
});

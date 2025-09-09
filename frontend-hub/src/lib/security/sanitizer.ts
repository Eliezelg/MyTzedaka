import DOMPurify from 'dompurify';

/**
 * Service centralisé de sanitisation pour prévenir les attaques XSS
 */
export class Sanitizer {
  private static instance: Sanitizer;
  private purify: typeof DOMPurify;

  private constructor() {
    // Initialiser DOMPurify seulement côté client
    if (typeof window !== 'undefined') {
      this.purify = DOMPurify(window);
      this.configureDefaults();
    } else {
      // Côté serveur, on retourne le HTML tel quel (sera sanitizé côté client)
      this.purify = {
        sanitize: (html: string) => html,
      } as any;
    }
  }

  private configureDefaults(): void {
    // Configuration sécurisée par défaut
    this.purify.setConfig({
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'q',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'a', 'img', 'video', 'audio', 'source',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'div', 'span', 'section', 'article', 'aside', 'nav',
        'header', 'footer', 'main', 'figure', 'figcaption',
        'code', 'pre', 'kbd', 'samp', 'var',
        'iframe' // Pour vidéos YouTube/Vimeo uniquement
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'width', 'height',
        'class', 'id', 'style', 'target', 'rel',
        'data-*', 'aria-*', 'role',
        'controls', 'autoplay', 'loop', 'muted', 'poster',
        'frameborder', 'allowfullscreen', 'loading'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ALLOW_DATA_ATTR: true,
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['target', 'rel'],
      FORCE_BODY: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false,
      SANITIZE_DOM: true,
      KEEP_CONTENT: true,
      IN_PLACE: false
    });

    // Hooks personnalisés pour validation supplémentaire
    this.purify.addHook('afterSanitizeAttributes', (node) => {
      // Sécuriser les liens externes
      if (node.tagName === 'A') {
        const target = node.getAttribute('target');
        if (target === '_blank') {
          node.setAttribute('rel', 'noopener noreferrer');
        }
      }

      // Valider les iframes (seulement YouTube/Vimeo)
      if (node.tagName === 'IFRAME') {
        const src = node.getAttribute('src');
        if (src && !this.isAllowedIframeSrc(src)) {
          node.remove();
        }
      }
    });
  }

  public static getInstance(): Sanitizer {
    if (!Sanitizer.instance) {
      Sanitizer.instance = new Sanitizer();
    }
    return Sanitizer.instance;
  }

  /**
   * Sanitize HTML content for safe rendering
   */
  public sanitizeHTML(dirty: string, options?: DOMPurify.Config): string {
    if (!dirty) return '';
    
    try {
      return this.purify.sanitize(dirty, options);
    } catch (error) {
      console.error('Sanitization error:', error);
      return '';
    }
  }

  /**
   * Sanitize pour contenu riche (articles, pages CMS)
   */
  public sanitizeRichContent(content: string): string {
    return this.sanitizeHTML(content, {
      ADD_TAGS: ['iframe', 'video', 'audio', 'source'],
      ADD_ATTR: ['allowfullscreen', 'frameborder', 'controls']
    });
  }

  /**
   * Sanitize pour commentaires/messages utilisateurs
   */
  public sanitizeUserContent(content: string): string {
    return this.sanitizeHTML(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'blockquote'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed']
    });
  }

  /**
   * Sanitize pour texte simple (titres, descriptions)
   */
  public sanitizePlainText(text: string): string {
    return this.sanitizeHTML(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }

  /**
   * Valide si une URL d'iframe est autorisée
   */
  private isAllowedIframeSrc(src: string): boolean {
    const allowedDomains = [
      'youtube.com',
      'youtube-nocookie.com',
      'youtu.be',
      'vimeo.com',
      'player.vimeo.com',
      'dailymotion.com',
      'google.com/maps',
      'maps.google.com'
    ];

    try {
      const url = new URL(src);
      return allowedDomains.some(domain => 
        url.hostname.includes(domain)
      );
    } catch {
      return false;
    }
  }

  /**
   * Valide et sanitize une URL
   */
  public sanitizeURL(url: string): string | null {
    if (!url) return null;

    try {
      const parsed = new URL(url);
      
      // Autoriser seulement certains protocoles
      const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
      if (!allowedProtocols.includes(parsed.protocol)) {
        return null;
      }

      // Éviter les redirections JavaScript
      if (url.toLowerCase().includes('javascript:')) {
        return null;
      }

      return parsed.toString();
    } catch {
      // Si ce n'est pas une URL valide, essayer de la réparer
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return this.sanitizeURL(`https://${url}`);
      }
      return null;
    }
  }

  /**
   * Escape HTML entities pour affichage sûr
   */
  public escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Valide un slug/identifiant tenant
   */
  public validateTenantSlug(slug: string): boolean {
    if (!slug || typeof slug !== 'string') return false;
    
    // Seulement lettres minuscules, chiffres et tirets
    const slugRegex = /^[a-z0-9-]+$/;
    
    // Entre 3 et 50 caractères
    if (slug.length < 3 || slug.length > 50) return false;
    
    // Pas de tirets au début ou à la fin
    if (slug.startsWith('-') || slug.endsWith('-')) return false;
    
    // Pas de tirets doubles
    if (slug.includes('--')) return false;
    
    return slugRegex.test(slug);
  }

  /**
   * Valide un identifiant UUID
   */
  public validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Nettoie et valide un email
   */
  public sanitizeEmail(email: string): string | null {
    if (!email || typeof email !== 'string') return null;
    
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailRegex.test(trimmed) ? trimmed : null;
  }

  /**
   * Nettoie et valide un numéro de téléphone
   */
  public sanitizePhone(phone: string): string | null {
    if (!phone || typeof phone !== 'string') return null;
    
    // Garder seulement les chiffres, +, -, espaces et parenthèses
    const cleaned = phone.replace(/[^0-9+\-\s()]/g, '');
    
    // Vérifier la longueur minimale
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return null;
    }
    
    return cleaned;
  }

  /**
   * Crée un hook React pour utiliser le sanitizer
   */
  public static useSanitizer() {
    return Sanitizer.getInstance();
  }
}

// Export singleton pour usage direct
export const sanitizer = Sanitizer.getInstance();

// Export des méthodes utilitaires
export const {
  sanitizeHTML,
  sanitizeRichContent,
  sanitizeUserContent,
  sanitizePlainText,
  sanitizeURL,
  escapeHTML,
  validateTenantSlug,
  validateUUID,
  sanitizeEmail,
  sanitizePhone
} = {
  sanitizeHTML: (html: string, options?: any) => sanitizer.sanitizeHTML(html, options),
  sanitizeRichContent: (content: string) => sanitizer.sanitizeRichContent(content),
  sanitizeUserContent: (content: string) => sanitizer.sanitizeUserContent(content),
  sanitizePlainText: (text: string) => sanitizer.sanitizePlainText(text),
  sanitizeURL: (url: string) => sanitizer.sanitizeURL(url),
  escapeHTML: (text: string) => sanitizer.escapeHTML(text),
  validateTenantSlug: (slug: string) => sanitizer.validateTenantSlug(slug),
  validateUUID: (uuid: string) => sanitizer.validateUUID(uuid),
  sanitizeEmail: (email: string) => sanitizer.sanitizeEmail(email),
  sanitizePhone: (phone: string) => sanitizer.sanitizePhone(phone)
};

// Hook React personnalisé
export function useSanitizer() {
  return sanitizer;
}
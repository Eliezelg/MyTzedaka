import { useState, useEffect } from 'react';

export interface ThemeConfig {
  // Couleurs principales
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    // Couleurs sémantiques
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
  };
  
  // Typographie
  typography: {
    fontFamily: {
      sans: string;
      serif?: string;
      mono?: string;
      hebrew?: string; // Police pour textes hébraïques
    };
    fontSize: {
      base: string;
      scale: number; // Ratio pour les tailles
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  
  // Layout
  layout: {
    maxWidth: string;
    spacing: {
      base: string;
      scale: number;
    };
    borderRadius: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
  };
  
  // Composants spécifiques
  components?: {
    button?: {
      borderRadius?: string;
      padding?: string;
      fontWeight?: number;
      textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    };
    card?: {
      borderRadius?: string;
      padding?: string;
      shadow?: string;
      border?: boolean;
    };
    navbar?: {
      height?: string;
      background?: string;
      blur?: boolean;
      sticky?: boolean;
    };
    footer?: {
      background?: string;
      textColor?: string;
    };
  };
  
  // Mode sombre
  darkMode?: {
    enabled: boolean;
    colors?: Partial<ThemeConfig['colors']>;
  };
}

// Thèmes prédéfinis
export const presetThemes: Record<string, ThemeConfig> = {
  modern: {
    colors: {
      primary: '#3B82F6',      // Bleu moderne
      secondary: '#8B5CF6',    // Violet
      accent: '#10B981',       // Vert
      background: '#FFFFFF',
      foreground: '#0F172A',
      muted: '#F1F5F9',
      border: '#E2E8F0',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    typography: {
      fontFamily: {
        sans: 'Inter, system-ui, -apple-system, sans-serif',
        serif: 'Merriweather, Georgia, serif',
        mono: 'JetBrains Mono, monospace',
        hebrew: 'David Libre, serif'
      },
      fontSize: {
        base: '16px',
        scale: 1.25
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    layout: {
      maxWidth: '1280px',
      spacing: {
        base: '1rem',
        scale: 1.5
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '1rem',
        full: '9999px'
      }
    },
    components: {
      button: {
        borderRadius: '0.5rem',
        fontWeight: 600,
        textTransform: 'none'
      },
      card: {
        borderRadius: '0.75rem',
        shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        border: true
      }
    },
    darkMode: {
      enabled: true,
      colors: {
        background: '#0F172A',
        foreground: '#F8FAFC',
        muted: '#1E293B',
        border: '#334155'
      }
    }
  },
  
  classic: {
    colors: {
      primary: '#1E40AF',      // Bleu classique
      secondary: '#7C3AED',    // Violet royal
      accent: '#DC2626',       // Rouge
      background: '#FAFAF9',
      foreground: '#18181B',
      muted: '#F4F4F5',
      border: '#D4D4D8',
      success: '#16A34A',
      warning: '#CA8A04',
      error: '#DC2626',
      info: '#2563EB'
    },
    typography: {
      fontFamily: {
        sans: 'Georgia, serif',
        serif: 'Georgia, serif',
        mono: 'Courier, monospace',
        hebrew: 'Frank Ruhl Libre, serif'
      },
      fontSize: {
        base: '18px',
        scale: 1.333
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.6,
        relaxed: 1.8
      }
    },
    layout: {
      maxWidth: '1140px',
      spacing: {
        base: '1.25rem',
        scale: 1.618
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
      }
    },
    darkMode: {
      enabled: false
    }
  },
  
  jerusalem: {
    colors: {
      primary: '#8B4513',      // Terre de Jérusalem
      secondary: '#DAA520',    // Or
      accent: '#4682B4',       // Bleu ciel
      background: '#FFF8DC',   // Crème
      foreground: '#2F2F2F',
      muted: '#F5E6D3',
      border: '#D2B48C',
      success: '#228B22',
      warning: '#FF8C00',
      error: '#B22222',
      info: '#4682B4'
    },
    typography: {
      fontFamily: {
        sans: 'Heebo, sans-serif',
        serif: 'David Libre, serif',
        mono: 'Courier, monospace',
        hebrew: 'David Libre, serif'
      },
      fontSize: {
        base: '17px',
        scale: 1.25
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.3,
        normal: 1.6,
        relaxed: 1.8
      }
    },
    layout: {
      maxWidth: '1200px',
      spacing: {
        base: '1rem',
        scale: 1.5
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.375rem',
        xl: '0.5rem',
        full: '9999px'
      }
    },
    components: {
      button: {
        borderRadius: '0.25rem',
        fontWeight: 600,
        textTransform: 'none'
      },
      card: {
        borderRadius: '0.375rem',
        shadow: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
        border: true
      }
    },
    darkMode: {
      enabled: true,
      colors: {
        background: '#1A1A1A',
        foreground: '#F5E6D3',
        muted: '#2F2F2F',
        border: '#4A4A4A'
      }
    }
  }
};

// Générateur de CSS Variables
export function generateCSSVariables(theme: ThemeConfig | null | undefined): string {
  if (!theme) {
    return ':root {\n  /* No theme configured */\n}';
  }
  
  const cssVars: string[] = [];
  
  // Couleurs
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (value) {
        cssVars.push(`--color-${key}: ${value};`);
      }
    });
  }
  
  // Typographie
  if (theme.typography?.fontFamily) {
    if (theme.typography.fontFamily.sans) {
      cssVars.push(`--font-sans: ${theme.typography.fontFamily.sans};`);
    }
    if (theme.typography.fontFamily.serif) {
      cssVars.push(`--font-serif: ${theme.typography.fontFamily.serif};`);
    }
    if (theme.typography.fontFamily.hebrew) {
      cssVars.push(`--font-hebrew: ${theme.typography.fontFamily.hebrew};`);
    }
  }
  
  if (theme.typography?.fontSize) {
    if (theme.typography.fontSize.base) {
      cssVars.push(`--font-size-base: ${theme.typography.fontSize.base};`);
    }
    if (theme.typography.fontSize.scale) {
      cssVars.push(`--font-scale: ${theme.typography.fontSize.scale};`);
    }
  }
  
  // Layout
  if (theme.layout) {
    if (theme.layout.maxWidth) {
      cssVars.push(`--max-width: ${theme.layout.maxWidth};`);
    }
    if (theme.layout.spacing?.base) {
      cssVars.push(`--spacing-base: ${theme.layout.spacing.base};`);
    }
    
    // Border radius
    if (theme.layout.borderRadius) {
      Object.entries(theme.layout.borderRadius).forEach(([key, value]) => {
        if (value) {
          cssVars.push(`--radius-${key}: ${value};`);
        }
      });
    }
  }
  
  return `:root {\n  ${cssVars.join('\n  ')}\n}`;
}

// Application du thème
export function applyTheme(theme: ThemeConfig | string | null | undefined): void {
  if (!theme) {
    console.warn('No theme provided to applyTheme');
    return;
  }
  
  const themeConfig = typeof theme === 'string' ? presetThemes[theme] : theme;
  
  if (!themeConfig) {
    console.error('Theme not found');
    return;
  }
  
  // Générer et injecter les CSS variables
  const cssVariables = generateCSSVariables(themeConfig);
  
  // Supprimer l'ancien style si présent
  const existingStyle = document.getElementById('dynamic-theme');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Créer et ajouter le nouveau style
  const styleElement = document.createElement('style');
  styleElement.id = 'dynamic-theme';
  styleElement.textContent = cssVariables;
  document.head.appendChild(styleElement);
  
  // Sauvegarder le thème dans localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme-config', JSON.stringify(themeConfig));
  }
  
  // Appliquer le mode sombre si activé
  if (themeConfig.darkMode?.enabled) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark && themeConfig.darkMode.colors) {
      applyDarkMode(themeConfig.darkMode.colors);
    }
  }
}

// Mode sombre
export function applyDarkMode(darkColors: Partial<ThemeConfig['colors']>): void {
  const root = document.documentElement;
  
  Object.entries(darkColors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  root.classList.add('dark');
}

// Récupérer le thème sauvegardé
export function getSavedTheme(): ThemeConfig | null {
  if (typeof window === 'undefined') return null;
  
  const saved = localStorage.getItem('theme-config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  
  return null;
}

// Hook React pour utiliser le thème
export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(getSavedTheme());
  
  useEffect(() => {
    const saved = getSavedTheme();
    if (saved) {
      applyTheme(saved);
    }
  }, []);
  
  const changeTheme = (theme: ThemeConfig | string) => {
    const themeConfig = typeof theme === 'string' ? presetThemes[theme] : theme;
    if (themeConfig) {
      applyTheme(themeConfig);
      setCurrentTheme(themeConfig);
    }
  };
  
  return {
    theme: currentTheme,
    changeTheme,
    presetThemes: Object.keys(presetThemes)
  };
}

// Export pour TypeScript déjà fait en haut du fichier
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeAccessibilityContextType {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Accessibility
  fontSize: 'normal' | 'large' | 'extra-large';
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  screenReaderMode: boolean;
  toggleScreenReaderMode: () => void;
  
  // Focus indicators
  focusVisible: boolean;
  toggleFocusVisible: () => void;
  
  // Color blindness modes
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
  setColorBlindMode: (mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome') => void;
}

const ThemeAccessibilityContext = createContext<ThemeAccessibilityContextType | undefined>(undefined);

export const useThemeAccessibility = () => {
  const context = useContext(ThemeAccessibilityContext);
  if (!context) {
    throw new Error('useThemeAccessibility must be used within ThemeAccessibilityProvider');
  }
  return context;
};

export const ThemeAccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme states
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Accessibility states
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [focusVisible, setFocusVisible] = useState(true);
  const [colorBlindMode, setColorBlindMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome'>('none');

  // Load saved preferences
  useEffect(() => {
    const savedPreferences = localStorage.getItem('themeAccessibilityPreferences');
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences);
      setIsDarkMode(prefs.isDarkMode || false);
      setFontSize(prefs.fontSize || 'normal');
      setHighContrast(prefs.highContrast || false);
      setReducedMotion(prefs.reducedMotion || false);
      setScreenReaderMode(prefs.screenReaderMode || false);
      setFocusVisible(prefs.focusVisible !== false);
      setColorBlindMode(prefs.colorBlindMode || 'none');
    }

    // Check system preferences
    if (window.matchMedia) {
      // Dark mode
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (!savedPreferences) {
        setIsDarkMode(darkModeQuery.matches);
      }
      
      // Reduced motion
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (!savedPreferences) {
        setReducedMotion(reducedMotionQuery.matches);
      }
      
      // High contrast
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      if (!savedPreferences) {
        setHighContrast(highContrastQuery.matches);
      }
    }
  }, []);

  // Save preferences
  useEffect(() => {
    const preferences = {
      isDarkMode,
      fontSize,
      highContrast,
      reducedMotion,
      screenReaderMode,
      focusVisible,
      colorBlindMode
    };
    localStorage.setItem('themeAccessibilityPreferences', JSON.stringify(preferences));
  }, [isDarkMode, fontSize, highContrast, reducedMotion, screenReaderMode, focusVisible, colorBlindMode]);

  // Apply theme classes
  useEffect(() => {
    const root = document.documentElement;
    
    // Dark mode
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    }
    
    // Font size
    root.classList.remove('font-normal', 'font-large', 'font-extra-large');
    root.classList.add(`font-${fontSize}`);
    
    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Screen reader mode
    if (screenReaderMode) {
      root.classList.add('screen-reader');
    } else {
      root.classList.remove('screen-reader');
    }
    
    // Focus visible
    if (!focusVisible) {
      root.classList.add('focus-hidden');
    } else {
      root.classList.remove('focus-hidden');
    }
    
    // Color blind modes
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'monochrome');
    if (colorBlindMode !== 'none') {
      root.classList.add(colorBlindMode);
    }
  }, [isDarkMode, fontSize, highContrast, reducedMotion, screenReaderMode, focusVisible, colorBlindMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleHighContrast = () => setHighContrast(!highContrast);
  const toggleReducedMotion = () => setReducedMotion(!reducedMotion);
  const toggleScreenReaderMode = () => setScreenReaderMode(!screenReaderMode);
  const toggleFocusVisible = () => setFocusVisible(!focusVisible);

  return (
    <ThemeAccessibilityContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        fontSize,
        setFontSize,
        highContrast,
        toggleHighContrast,
        reducedMotion,
        toggleReducedMotion,
        screenReaderMode,
        toggleScreenReaderMode,
        focusVisible,
        toggleFocusVisible,
        colorBlindMode,
        setColorBlindMode
      }}
    >
      {children}
      
      {/* Accessibility Toolbar */}
      <AccessibilityToolbar />
      
      {/* Screen Reader Announcements */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        id="screen-reader-announcements"
      />
    </ThemeAccessibilityContext.Provider>
  );
};

// Accessibility Toolbar Component
const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isDarkMode,
    toggleDarkMode,
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    colorBlindMode,
    setColorBlindMode
  } = useThemeAccessibility();

  return (
    <>
      {/* Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-8 z-40 p-3 bg-[#334e68] text-white rounded-full shadow-lg hover:bg-[#243b53] transition-colors"
        aria-label="Ouvrir les options d'accessibilité"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-8 z-40 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-[#102a43] dark:text-white mb-4">
            Options d'accessibilité
          </h3>
          
          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mode sombre
              </label>
              <button
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-colors ${
                  isDarkMode ? 'bg-[#17b897]' : 'bg-gray-300'
                }`}
                aria-label={isDarkMode ? "Désactiver le mode sombre" : "Activer le mode sombre"}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Font Size */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Taille du texte
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-3 py-1 rounded text-sm ${
                    fontSize === 'normal' 
                      ? 'bg-[#17b897] text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  aria-label="Taille normale"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-3 py-1 rounded text-base ${
                    fontSize === 'large' 
                      ? 'bg-[#17b897] text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  aria-label="Grande taille"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('extra-large')}
                  className={`px-3 py-1 rounded text-lg ${
                    fontSize === 'extra-large' 
                      ? 'bg-[#17b897] text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  aria-label="Très grande taille"
                >
                  A
                </button>
              </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraste élevé
              </label>
              <button
                onClick={toggleHighContrast}
                className={`w-12 h-6 rounded-full transition-colors ${
                  highContrast ? 'bg-[#17b897]' : 'bg-gray-300'
                }`}
                aria-label={highContrast ? "Désactiver le contraste élevé" : "Activer le contraste élevé"}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  highContrast ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Réduire les animations
              </label>
              <button
                onClick={toggleReducedMotion}
                className={`w-12 h-6 rounded-full transition-colors ${
                  reducedMotion ? 'bg-[#17b897]' : 'bg-gray-300'
                }`}
                aria-label={reducedMotion ? "Activer les animations" : "Réduire les animations"}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Color Blind Mode */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Mode daltonien
              </label>
              <select
                value={colorBlindMode}
                onChange={(e) => setColorBlindMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                aria-label="Sélectionner le mode daltonien"
              >
                <option value="none">Aucun</option>
                <option value="protanopia">Protanopie</option>
                <option value="deuteranopia">Deutéranopie</option>
                <option value="tritanopia">Tritanopie</option>
                <option value="monochrome">Monochrome</option>
              </select>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong>Raccourcis clavier:</strong><br />
                Alt + D : Mode sombre<br />
                Alt + C : Contraste élevé<br />
                Alt + M : Réduire animations<br />
                Alt + Plus : Augmenter texte<br />
                Alt + Moins : Réduire texte
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeAccessibilityProvider;
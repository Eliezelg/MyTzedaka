#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const config = {
    sourceDir: 'src',
    messagesDir: 'messages',
    locales: ['fr', 'he'],
    extensions: ['tsx', 'ts', 'jsx', 'js'],
    outputFile: 'translation-analysis.json'
};

// Patterns pour détecter les clés de traduction
const translationPatterns = [
    // Hooks et appels directs
    /useTranslations\(['"`]([^'"`]+)['"`]\)/g,
    /useCommonTranslations\(\)/g,
    /useNavigationTranslations\(\)/g,
    /useFormTranslations\(\)/g,
    /useAssociationTranslations\(\)/g,
    /useCampaignTranslations\(\)/g,
    /useDonationTranslations\(\)/g,
    /useAuthTranslations\(\)/g,
    /useDashboardTranslations\(\)/g,
    /useErrorTranslations\(\)/g,
    /useSearchTranslations\(\)/g,
    
    // Appels t()
    /\bt\(['"`]([^'"`]+)['"`]\)/g,
    
    // Composants TranslatedText
    /tKey=['"`]([^'"`]+)['"`]/g,
    
    // Composants spécifiques
    /<CommonText[^>]*tKey=['"`]([^'"`]+)['"`]/g,
    /<FormText[^>]*tKey=['"`]([^'"`]+)['"`]/g,
    /<AssociationText[^>]*tKey=['"`]([^'"`]+)['"`]/g,
    
    // Namespaces dans TranslatedText
    /namespace=['"`]([^'"`]+)['"`]/g
];

// Mapping des hooks vers namespaces
const hookToNamespace = {
    'useCommonTranslations': 'common',
    'useNavigationTranslations': 'navigation',
    'useFormTranslations': 'forms',
    'useAssociationTranslations': 'associations',
    'useCampaignTranslations': 'campaigns',
    'useDonationTranslations': 'donations',
    'useAuthTranslations': 'auth',
    'useDashboardTranslations': 'dashboard',
    'useErrorTranslations': 'errors',
    'useSearchTranslations': 'search'
};

class TranslationAnalyzer {
    constructor() {
        this.usedKeys = new Map();
        this.usedNamespaces = new Set();
        this.availableKeys = new Map();
        this.missingKeys = [];
        this.unusedKeys = [];
        this.inconsistentKeys = [];
    }

    // Analyse récursive pour obtenir toutes les clés d'un objet JSON
    flattenKeys(obj, prefix = '') {
        const keys = [];
        
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                keys.push(...this.flattenKeys(value, fullKey));
            } else {
                keys.push(fullKey);
            }
        }
        
        return keys;
    }

    // Charger toutes les clés disponibles dans les fichiers de messages
    loadAvailableKeys() {
        console.log('📚 Chargement des clés disponibles...');
        
        for (const locale of config.locales) {
            const localeDir = path.join(config.messagesDir, locale);
            if (!fs.existsSync(localeDir)) continue;
            
            const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
            
            for (const file of files) {
                const namespace = path.basename(file, '.json');
                const filePath = path.join(localeDir, file);
                
                try {
                    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    const keys = this.flattenKeys(content);
                    
                    if (!this.availableKeys.has(namespace)) {
                        this.availableKeys.set(namespace, new Map());
                    }
                    
                    this.availableKeys.get(namespace).set(locale, keys);
                    
                    console.log(`  ✓ ${locale}/${namespace}.json: ${keys.length} clés`);
                } catch (error) {
                    console.error(`  ❌ Erreur lecture ${filePath}:`, error.message);
                }
            }
        }
    }

    // Extraire toutes les clés utilisées dans le code source
    extractUsedKeys() {
        console.log('🔍 Extraction des clés utilisées...');
        
        const sourceFiles = glob.sync(`${config.sourceDir}/**/*.{${config.extensions.join(',')}}`, {
            ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
        });
        
        console.log(`📁 Analyse de ${sourceFiles.length} fichiers...`);
        
        for (const filePath of sourceFiles) {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            // Détecter les namespaces utilisés via les hooks
            for (const [hookName, namespace] of Object.entries(hookToNamespace)) {
                const hookPattern = new RegExp(`${hookName}\\(\\)`, 'g');
                if (hookPattern.test(content)) {
                    this.usedNamespaces.add(namespace);
                }
            }
            
            // Détecter les appels useTranslations avec namespace explicite
            const useTransPattern = /useTranslations\(['"`]([^'"`]+)['"`]\)/g;
            let match;
            while ((match = useTransPattern.exec(content)) !== null) {
                this.usedNamespaces.add(match[1]);
            }
            
            // Extraire toutes les clés utilisées
            for (const pattern of translationPatterns) {
                pattern.lastIndex = 0; // Reset regex
                
                while ((match = pattern.exec(content)) !== null) {
                    if (match[1]) {
                        const key = match[1];
                        const lineNumber = content.substring(0, match.index).split('\n').length;
                        
                        if (!this.usedKeys.has(key)) {
                            this.usedKeys.set(key, []);
                        }
                        
                        this.usedKeys.get(key).push({
                            file: path.relative(process.cwd(), filePath),
                            line: lineNumber,
                            context: lines[lineNumber - 1]?.trim() || ''
                        });
                    }
                }
            }
        }
        
        console.log(`  ✓ ${this.usedKeys.size} clés uniques trouvées`);
        console.log(`  ✓ ${this.usedNamespaces.size} namespaces utilisés: ${Array.from(this.usedNamespaces).join(', ')}`);
    }

    // Vérifier les clés manquantes et incohérences
    validateKeys() {
        console.log('🔍 Vérification des clés...');
        
        for (const [key, usages] of this.usedKeys) {
            const keyParts = key.split('.');
            
            if (keyParts.length > 1) {
                const namespace = keyParts[0];
                const keyPath = keyParts.slice(1).join('.');
                
                this.validateKeyInNamespace(namespace, keyPath, usages);
            } else {
                // Clé sans namespace - vérifier dans tous les namespaces utilisés
                for (const namespace of this.usedNamespaces) {
                    this.validateKeyInNamespace(namespace, key, usages);
                }
            }
        }
        
        // Rechercher les clés inutilisées
        this.findUnusedKeys();
        
        // Vérifier la cohérence entre locales
        this.checkConsistency();
    }

    validateKeyInNamespace(namespace, keyPath, usages) {
        if (!this.availableKeys.has(namespace)) {
            this.missingKeys.push({
                namespace,
                key: keyPath,
                fullKey: `${namespace}.${keyPath}`,
                usages,
                reason: 'Namespace non trouvé'
            });
            return;
        }
        
        const namespaceKeys = this.availableKeys.get(namespace);
        
        for (const locale of config.locales) {
            if (namespaceKeys.has(locale)) {
                const keys = namespaceKeys.get(locale);
                if (!keys.includes(keyPath)) {
                    this.missingKeys.push({
                        namespace,
                        key: keyPath,
                        fullKey: `${namespace}.${keyPath}`,
                        locale,
                        usages,
                        reason: `Clé manquante en ${locale}`
                    });
                }
            }
        }
    }

    findUnusedKeys() {
        console.log('🧹 Recherche des clés inutilisées...');
        
        for (const [namespace, localeKeys] of this.availableKeys) {
            for (const [locale, keys] of localeKeys) {
                for (const key of keys) {
                    const fullKey = `${namespace}.${key}`;
                    const simpleKey = key;
                    
                    const isUsed = this.usedKeys.has(fullKey) || 
                                  this.usedKeys.has(simpleKey) ||
                                  this.usedNamespaces.has(namespace);
                    
                    if (!isUsed) {
                        this.unusedKeys.push({
                            namespace,
                            key,
                            fullKey,
                            locale
                        });
                    }
                }
            }
        }
    }

    checkConsistency() {
        console.log('🔄 Vérification cohérence entre locales...');
        
        for (const [namespace, localeKeys] of this.availableKeys) {
            const locales = Array.from(localeKeys.keys());
            if (locales.length < 2) continue;
            
            const [firstLocale, ...otherLocales] = locales;
            const firstKeys = new Set(localeKeys.get(firstLocale));
            
            for (const locale of otherLocales) {
                const currentKeys = new Set(localeKeys.get(locale));
                
                // Clés manquantes dans la locale courante
                for (const key of firstKeys) {
                    if (!currentKeys.has(key)) {
                        this.inconsistentKeys.push({
                            namespace,
                            key,
                            missingIn: locale,
                            presentIn: firstLocale
                        });
                    }
                }
                
                // Clés supplémentaires dans la locale courante
                for (const key of currentKeys) {
                    if (!firstKeys.has(key)) {
                        this.inconsistentKeys.push({
                            namespace,
                            key,
                            extraIn: locale,
                            missingIn: firstLocale
                        });
                    }
                }
            }
        }
    }

    // Générer le rapport
    generateReport() {
        console.log('\n📊 Génération du rapport...');
        
        const report = {
            summary: {
                totalUsedKeys: this.usedKeys.size,
                totalNamespaces: this.usedNamespaces.size,
                missingKeysCount: this.missingKeys.length,
                unusedKeysCount: this.unusedKeys.length,
                inconsistentKeysCount: this.inconsistentKeys.length,
                analysisDate: new Date().toISOString()
            },
            usedNamespaces: Array.from(this.usedNamespaces).sort(),
            usedKeys: Object.fromEntries(this.usedKeys),
            missingKeys: this.missingKeys,
            unusedKeys: this.unusedKeys,
            inconsistentKeys: this.inconsistentKeys,
            availableKeysCounts: Object.fromEntries(
                Array.from(this.availableKeys.entries()).map(([ns, localeKeys]) => [
                    ns,
                    Object.fromEntries(localeKeys)
                ])
            )
        };
        
        // Sauvegarder le rapport
        fs.writeFileSync(config.outputFile, JSON.stringify(report, null, 2), 'utf8');
        
        // Afficher le résumé
        this.displaySummary(report);
        
        return report;
    }

    displaySummary(report) {
        console.log('\n' + '='.repeat(60));
        console.log('📋 RÉSUMÉ DE L\'ANALYSE DES TRADUCTIONS');
        console.log('='.repeat(60));
        
        console.log(`📊 Statistiques générales:`);
        console.log(`   • Clés utilisées: ${report.summary.totalUsedKeys}`);
        console.log(`   • Namespaces: ${report.summary.totalNamespaces}`);
        console.log(`   • Locales: ${config.locales.join(', ')}`);
        
        if (report.summary.missingKeysCount > 0) {
            console.log(`\n❌ Clés manquantes: ${report.summary.missingKeysCount}`);
            report.missingKeys.slice(0, 5).forEach(missing => {
                console.log(`   • ${missing.fullKey} (${missing.reason})`);
            });
            if (report.missingKeys.length > 5) {
                console.log(`   ... et ${report.missingKeys.length - 5} autres`);
            }
        } else {
            console.log(`\n✅ Toutes les clés utilisées existent !`);
        }
        
        if (report.summary.inconsistentKeysCount > 0) {
            console.log(`\n⚠️  Incohérences entre locales: ${report.summary.inconsistentKeysCount}`);
        } else {
            console.log(`\n✅ Cohérence parfaite entre locales !`);
        }
        
        if (report.summary.unusedKeysCount > 0) {
            console.log(`\n🧹 Clés potentiellement inutilisées: ${report.summary.unusedKeysCount}`);
        }
        
        console.log(`\n📄 Rapport détaillé: ${config.outputFile}`);
        console.log('='.repeat(60));
    }

    // Méthode principale
    async analyze() {
        console.log('🚀 Démarrage de l\'analyse des traductions...\n');
        
        this.loadAvailableKeys();
        this.extractUsedKeys();
        this.validateKeys();
        
        return this.generateReport();
    }
}

// Exécution si script appelé directement
if (require.main === module) {
    const analyzer = new TranslationAnalyzer();
    analyzer.analyze().catch(console.error);
}

module.exports = TranslationAnalyzer;

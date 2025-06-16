#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction récursive pour trouver tous les fichiers
function findFiles(dir, extensions) {
    const files = [];
    
    function scan(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                scan(fullPath);
            } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                files.push(fullPath);
            }
        }
    }
    
    scan(dir);
    return files;
}

// Patterns pour extraire les clés
const patterns = [
    // Hooks de traduction
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
    /useComponentTranslations\(\)/g,
    
    // Appels t()
    /\bt\(['"`]([^'"`]+)['"`]\)/g,
    
    // Props tKey
    /tKey=['"`]([^'"`]+)['"`]/g,
    
    // Namespace props
    /namespace=['"`]([^'"`]+)['"`]/g,
    
    // Composants traduits
    /<\w*Text[^>]*tKey=['"`]([^'"`]+)['"`]/g,
    /<TranslatedText[^>]*tKey=['"`]([^'"`]+)['"`]/g
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
    'useSearchTranslations': 'search',
    'useComponentTranslations': 'components'
};

function extractKeys() {
    console.log('🔍 Extraction des clés de traduction...\n');
    
    // Trouver tous les fichiers source
    const sourceFiles = findFiles('src', ['.tsx', '.ts', '.jsx', '.js']);
    console.log(`📁 Analyse de ${sourceFiles.length} fichiers...\n`);
    
    const usedKeys = new Map();
    const usedNamespaces = new Set();
    
    // Analyser chaque fichier
    for (const filePath of sourceFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        const lines = content.split('\n');
        
        // Analyser avec chaque pattern
        for (const pattern of patterns) {
            pattern.lastIndex = 0; // Reset regex
            let match;
            
            while ((match = pattern.exec(content)) !== null) {
                const lineNumber = content.substring(0, match.index).split('\n').length;
                const line = lines[lineNumber - 1]?.trim() || '';
                
                // Déterminer si c'est un hook ou une clé
                if (match[0].includes('Translations()')) {
                    // C'est un hook
                    const hookName = match[0].replace('()', '');
                    if (hookToNamespace[hookName]) {
                        usedNamespaces.add(hookToNamespace[hookName]);
                    }
                } else if (match[1]) {
                    // C'est une clé ou namespace
                    const key = match[1];
                    
                    if (!usedKeys.has(key)) {
                        usedKeys.set(key, []);
                    }
                    
                    usedKeys.get(key).push({
                        file: relativePath,
                        line: lineNumber,
                        context: line
                    });
                    
                    // Si la clé contient un point, extraire le namespace
                    if (key.includes('.')) {
                        const namespace = key.split('.')[0];
                        usedNamespaces.add(namespace);
                    }
                }
            }
        }
    }
    
    console.log('📊 RÉSULTATS:\n');
    console.log(`✅ Clés utilisées: ${usedKeys.size}`);
    console.log(`✅ Namespaces: ${usedNamespaces.size}`);
    console.log(`✅ Fichiers analysés: ${sourceFiles.length}\n`);
    
    console.log('🏷️  Namespaces trouvés:');
    for (const namespace of Array.from(usedNamespaces).sort()) {
        const count = Array.from(usedKeys.keys()).filter(key => 
            key.startsWith(namespace + '.') || usedNamespaces.has(key)
        ).length;
        console.log(`   • ${namespace}`);
    }
    
    console.log('\n🔑 Top 20 clés utilisées:');
    const sortedKeys = Array.from(usedKeys.keys()).sort();
    for (let i = 0; i < Math.min(20, sortedKeys.length); i++) {
        const key = sortedKeys[i];
        const usageCount = usedKeys.get(key).length;
        console.log(`   • ${key} (${usageCount} utilisations)`);
    }
    
    // Sauvegarder le rapport
    const report = {
        summary: {
            totalKeys: usedKeys.size,
            totalNamespaces: usedNamespaces.size,
            filesAnalyzed: sourceFiles.length,
            analysisDate: new Date().toISOString()
        },
        namespaces: Array.from(usedNamespaces).sort(),
        keys: Object.fromEntries(usedKeys),
        allKeys: Array.from(usedKeys.keys()).sort()
    };
    
    fs.writeFileSync('translation-keys-simple.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Rapport sauvegardé: translation-keys-simple.json');
    
    return report;
}

// Vérifier les clés manquantes
function checkMissingKeys(report) {
    console.log('\n🔍 Vérification des traductions...');
    
    try {
        const messagesDir = 'messages';
        const frDir = path.join(messagesDir, 'fr');
        const heDir = path.join(messagesDir, 'he');
        
        if (!fs.existsSync(frDir) || !fs.existsSync(heDir)) {
            console.log('❌ Dossiers messages/fr ou messages/he introuvables');
            return;
        }
        
        // Charger toutes les clés disponibles
        const availableKeys = new Map();
        
        const frFiles = fs.readdirSync(frDir).filter(f => f.endsWith('.json'));
        for (const file of frFiles) {
            const namespace = path.basename(file, '.json');
            const content = JSON.parse(fs.readFileSync(path.join(frDir, file), 'utf8'));
            
            // Fonction pour aplatir les clés
            function flattenKeys(obj, prefix = '') {
                const keys = [];
                for (const [key, value] of Object.entries(obj)) {
                    const fullKey = prefix ? `${prefix}.${key}` : key;
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        keys.push(...flattenKeys(value, fullKey));
                    } else {
                        keys.push(fullKey);
                    }
                }
                return keys;
            }
            
            availableKeys.set(namespace, flattenKeys(content));
        }
        
        console.log('\n📚 Clés disponibles par namespace:');
        for (const [namespace, keys] of availableKeys) {
            console.log(`   • ${namespace}: ${keys.length} clés`);
        }
        
        // Vérifier les clés manquantes
        const missingKeys = [];
        for (const key of report.allKeys) {
            if (key.includes('.')) {
                const [namespace, ...keyParts] = key.split('.');
                const keyPath = keyParts.join('.');
                
                if (availableKeys.has(namespace)) {
                    const keys = availableKeys.get(namespace);
                    if (!keys.includes(keyPath)) {
                        missingKeys.push({ namespace, key: keyPath, fullKey: key });
                    }
                } else {
                    missingKeys.push({ namespace, key: keyParts.join('.'), fullKey: key, reason: 'Namespace non trouvé' });
                }
            }
        }
        
        if (missingKeys.length > 0) {
            console.log(`\n❌ ${missingKeys.length} clés manquantes trouvées:`);
            missingKeys.slice(0, 10).forEach(missing => {
                console.log(`   • ${missing.fullKey} ${missing.reason ? '(' + missing.reason + ')' : ''}`);
            });
            if (missingKeys.length > 10) {
                console.log(`   ... et ${missingKeys.length - 10} autres`);
            }
        } else {
            console.log('\n✅ Toutes les clés utilisées existent !');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error.message);
    }
}

// Exécution
if (require.main === module) {
    try {
        const report = extractKeys();
        checkMissingKeys(report);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

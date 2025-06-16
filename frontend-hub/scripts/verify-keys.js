#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function verifyTranslationKeys() {
    console.log('🔍 Vérification des clés de traduction...\n');
    
    // Charger le rapport d'extraction
    if (!fs.existsSync('translation-keys-simple.json')) {
        console.error('❌ Fichier translation-keys-simple.json non trouvé. Exécutez d\'abord: node scripts/simple-extract.js');
        process.exit(1);
    }
    
    const report = JSON.parse(fs.readFileSync('translation-keys-simple.json', 'utf8'));
    
    // Charger toutes les clés disponibles
    const messagesDir = 'messages';
    const availableKeys = new Map();
    
    for (const locale of ['fr', 'he']) {
        const localeDir = path.join(messagesDir, locale);
        if (!fs.existsSync(localeDir)) {
            console.log(`⚠️  Dossier ${localeDir} non trouvé`);
            continue;
        }
        
        console.log(`📚 Chargement des traductions ${locale.toUpperCase()}...`);
        
        const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
            const namespace = path.basename(file, '.json');
            const filePath = path.join(localeDir, file);
            
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                // Fonction pour aplatir les clés récursivement
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
                
                const keys = flattenKeys(content);
                
                if (!availableKeys.has(namespace)) {
                    availableKeys.set(namespace, new Map());
                }
                availableKeys.get(namespace).set(locale, keys);
                
                console.log(`   ✓ ${namespace}.json: ${keys.length} clés`);
                
            } catch (error) {
                console.error(`   ❌ Erreur lecture ${file}:`, error.message);
            }
        }
    }
    
    console.log('\n📊 ANALYSE DES CLÉS UTILISÉES:\n');
    
    const missingKeys = [];
    const foundKeys = [];
    const ambiguousKeys = [];
    
    // Analyser chaque clé utilisée
    for (const [key, usages] of Object.entries(report.keys)) {
        
        if (key.includes('.')) {
            // Clé avec namespace explicite (ex: "common.welcome")
            const [namespace, ...keyParts] = key.split('.');
            const keyPath = keyParts.join('.');
            
            if (availableKeys.has(namespace)) {
                const namespaceKeys = availableKeys.get(namespace);
                let foundInFr = false;
                let foundInHe = false;
                
                if (namespaceKeys.has('fr')) {
                    foundInFr = namespaceKeys.get('fr').includes(keyPath);
                }
                if (namespaceKeys.has('he')) {
                    foundInHe = namespaceKeys.get('he').includes(keyPath);
                }
                
                if (foundInFr && foundInHe) {
                    foundKeys.push({ key, namespace, keyPath, status: 'found' });
                } else if (foundInFr || foundInHe) {
                    missingKeys.push({ 
                        key, 
                        namespace, 
                        keyPath, 
                        status: 'partial',
                        missingIn: foundInFr ? 'he' : 'fr',
                        usages: usages.length
                    });
                } else {
                    missingKeys.push({ 
                        key, 
                        namespace, 
                        keyPath, 
                        status: 'missing',
                        reason: 'Clé non trouvée',
                        usages: usages.length
                    });
                }
            } else {
                missingKeys.push({ 
                    key, 
                    namespace, 
                    keyPath, 
                    status: 'missing',
                    reason: 'Namespace non trouvé',
                    usages: usages.length
                });
            }
        } else {
            // Clé sans namespace - peut être dans n'importe quel namespace utilisé
            const possibleNamespaces = [];
            
            for (const [namespace, localeKeys] of availableKeys) {
                if (localeKeys.has('fr') && localeKeys.get('fr').includes(key)) {
                    possibleNamespaces.push(namespace);
                }
            }
            
            if (possibleNamespaces.length === 0) {
                ambiguousKeys.push({ 
                    key, 
                    status: 'not_found',
                    usages: usages.length 
                });
            } else if (possibleNamespaces.length === 1) {
                foundKeys.push({ 
                    key, 
                    namespace: possibleNamespaces[0], 
                    status: 'inferred' 
                });
            } else {
                ambiguousKeys.push({ 
                    key, 
                    status: 'ambiguous',
                    possibleNamespaces,
                    usages: usages.length 
                });
            }
        }
    }
    
    // Afficher les résultats
    console.log(`✅ Clés trouvées: ${foundKeys.length}`);
    console.log(`❌ Clés manquantes: ${missingKeys.length}`);
    console.log(`⚠️  Clés ambiguës: ${ambiguousKeys.length}`);
    
    if (missingKeys.length > 0) {
        console.log('\n❌ CLÉS MANQUANTES:');
        missingKeys.slice(0, 20).forEach(missing => {
            const usageInfo = missing.usages ? ` (${missing.usages} utilisations)` : '';
            if (missing.status === 'partial') {
                console.log(`   • ${missing.key} - Manquante en ${missing.missingIn.toUpperCase()}${usageInfo}`);
            } else {
                console.log(`   • ${missing.key} - ${missing.reason}${usageInfo}`);
            }
        });
        if (missingKeys.length > 20) {
            console.log(`   ... et ${missingKeys.length - 20} autres`);
        }
    }
    
    if (ambiguousKeys.length > 0) {
        console.log('\n⚠️  CLÉS AMBIGUËS:');
        ambiguousKeys.slice(0, 10).forEach(ambiguous => {
            const usageInfo = ambiguous.usages ? ` (${ambiguous.usages} utilisations)` : '';
            if (ambiguous.status === 'ambiguous') {
                console.log(`   • ${ambiguous.key} - Trouvée dans: ${ambiguous.possibleNamespaces.join(', ')}${usageInfo}`);
            } else {
                console.log(`   • ${ambiguous.key} - Non trouvée${usageInfo}`);
            }
        });
        if (ambiguousKeys.length > 10) {
            console.log(`   ... et ${ambiguousKeys.length - 10} autres`);
        }
    }
    
    // Statistiques des namespaces
    console.log('\n📋 STATISTIQUES PAR NAMESPACE:');
    const namespaceStats = new Map();
    
    for (const [namespace, localeKeys] of availableKeys) {
        let frCount = 0;
        let heCount = 0;
        
        if (localeKeys.has('fr')) frCount = localeKeys.get('fr').length;
        if (localeKeys.has('he')) heCount = localeKeys.get('he').length;
        
        const usedCount = foundKeys.filter(k => k.namespace === namespace).length;
        
        namespaceStats.set(namespace, { frCount, heCount, usedCount });
    }
    
    for (const [namespace, stats] of namespaceStats) {
        const diff = Math.abs(stats.frCount - stats.heCount);
        const status = diff === 0 ? '✅' : '⚠️ ';
        console.log(`   ${status} ${namespace}: FR=${stats.frCount}, HE=${stats.heCount}, Utilisées=${stats.usedCount}`);
    }
    
    // Sauvegarder le rapport détaillé
    const detailedReport = {
        summary: {
            totalKeys: Object.keys(report.keys).length,
            foundKeys: foundKeys.length,
            missingKeys: missingKeys.length,
            ambiguousKeys: ambiguousKeys.length,
            verificationDate: new Date().toISOString()
        },
        foundKeys,
        missingKeys,
        ambiguousKeys,
        namespaceStats: Object.fromEntries(namespaceStats)
    };
    
    fs.writeFileSync('translation-verification.json', JSON.stringify(detailedReport, null, 2));
    console.log('\n💾 Rapport détaillé sauvegardé: translation-verification.json');
    
    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    if (missingKeys.length > 0) {
        console.log('   1. Ajouter les clés manquantes dans les fichiers de traduction');
        console.log('   2. Vérifier l\'orthographe des namespaces et clés');
    }
    if (ambiguousKeys.length > 0) {
        console.log('   3. Spécifier explicitement les namespaces pour les clés ambiguës');
    }
    
    const healthScore = Math.round((foundKeys.length / Object.keys(report.keys).length) * 100);
    console.log(`\n🎯 Score de santé des traductions: ${healthScore}%`);
    
    if (healthScore >= 95) {
        console.log('   🎉 Excellent ! Système de traduction très sain');
    } else if (healthScore >= 80) {
        console.log('   👍 Bon état, quelques améliorations possibles');
    } else {
        console.log('   ⚠️  Attention requise, beaucoup de clés manquantes');
    }
}

// Exécution
if (require.main === module) {
    try {
        verifyTranslationKeys();
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

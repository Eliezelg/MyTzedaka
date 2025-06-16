#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function listMissingKeys() {
    console.log('🔍 Recherche des clés manquantes...\n');
    
    // Charger le rapport d'extraction
    if (!fs.existsSync('translation-keys-simple.json')) {
        console.error('❌ Fichier translation-keys-simple.json non trouvé. Exécutez d\'abord: node scripts/simple-extract.js');
        process.exit(1);
    }
    
    const report = JSON.parse(fs.readFileSync('translation-keys-simple.json', 'utf8'));
    const allKeys = report.allKeys || [];
    
    // Charger les clés disponibles
    const messagesDir = 'messages';
    const availableKeys = new Map();
    
    for (const locale of ['fr', 'he']) {
        const localeDir = path.join(messagesDir, locale);
        if (!fs.existsSync(localeDir)) continue;
        
        console.log(`📚 Chargement des traductions ${locale.toUpperCase()}...`);
        
        const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
            const namespace = path.basename(file, '.json');
            const filePath = path.join(localeDir, file);
            
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
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
    
    // Vérifier les clés manquantes
    console.log('\n🔍 Vérification des clés manquantes...');
    
    const missingKeys = [];
    
    for (const fullKey of allKeys) {
        const [namespace, ...keyParts] = fullKey.split('.');
        const keyPath = keyParts.join('.');
        
        if (availableKeys.has(namespace)) {
            const namespaceKeys = availableKeys.get(namespace);
            const frHasKey = namespaceKeys.has('fr') && namespaceKeys.get('fr').includes(keyPath);
            const heHasKey = namespaceKeys.has('he') && namespaceKeys.get('he').includes(keyPath);
            
            if (!frHasKey || !heHasKey) {
                missingKeys.push({
                    key: fullKey,
                    namespace,
                    keyPath,
                    missingFr: !frHasKey,
                    missingHe: !heHasKey
                });
            }
        } else {
            missingKeys.push({
                key: fullKey,
                namespace,
                keyPath,
                missingFr: true,
                missingHe: true,
                namespaceMissing: true
            });
        }
    }
    
    // Afficher le rapport
    if (missingKeys.length === 0) {
        console.log('✅ Toutes les clés sont traduites !');
        return;
    }
    
    console.log(`\n❌ ${missingKeys.length} clés manquantes trouvées :`);
    
    const byNamespace = {};
    missingKeys.forEach(item => {
        if (!byNamespace[item.namespace]) {
            byNamespace[item.namespace] = [];
        }
        byNamespace[item.namespace].push(item);
    });
    
    for (const [ns, items] of Object.entries(byNamespace)) {
        console.log(`\n📁 ${ns}.json (${items.length} clés manquantes):`);
        
        // Grouper par structure de clé
        const structure = {};
        
        items.forEach(item => {
            const parts = item.keyPath.split('.');
            let current = structure;
            
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (!current[part]) {
                    current[part] = i === parts.length - 1 ? null : {};
                }
                current = current[part] || {};
            }
        });
        
        // Afficher la structure
        function printStructure(obj, prefix = '  ') {
            Object.entries(obj).forEach(([key, value]) => {
                const isLast = Object.keys(obj).indexOf(key) === Object.keys(obj).length - 1;
                const connector = isLast ? '└─' : '├─';
                
                if (value === null) {
                    console.log(`${prefix}${connector} "${key}": "",`);
                } else {
                    console.log(`${prefix}${connector} "${key}": {`);
                    printStructure(value, prefix + (isLast ? '  ' : '│ '));
                    console.log(`${prefix}${isLast ? ' ' : ' '}}`);
                }
            });
        }
        
        console.log('{');
        printStructure(structure, '  ');
        console.log('}');
    }
    
    console.log('\n💡 Pour ajouter ces clés manquantes, copiez la structure ci-dessus dans les fichiers correspondants.');
}

// Exécution
if (require.main === module) {
    try {
        listMissingKeys();
    } catch (error) {
        console.error('❌ Erreur lors de la vérification des clés :', error);
        process.exit(1);
    }
}

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const { transformFromAstSync } = require('@babel/core');

// Configuration des dossiers à analyser
const SOURCE_DIR = path.join(__dirname, '..', 'src');
const MESSAGES_DIR = path.join(__dirname, '..', 'messages');

// Détecter toutes les clés de traduction utilisées dans le code
function extractKeysFromFiles() {
  const keys = new Set();
  const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
    cwd: SOURCE_DIR,
    ignore: ['**/node_modules/**', '**/.next/**', '**/out/**'],
  });

  files.forEach((file) => {
    const filePath = path.join(SOURCE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
      });

      traverse(ast, {
        CallExpression(path) {
          // Détecter les appels à useTranslations()
          if (
            t.isIdentifier(path.node.callee, { name: 'useTranslations' }) ||
            (t.isMemberExpression(path.node.callee) &&
              t.isIdentifier(path.node.callee.property, { name: 'useTranslations' }))
          ) {
            // Extraire le namespace (premier argument)
            const namespaceArg = path.node.arguments[0];
            if (t.isStringLiteral(namespaceArg)) {
              const namespace = namespaceArg.value;
              
              // Trouver tous les appels t() dans le composant parent
              const componentPath = path.findParent((p) => p.isFunctionDeclaration() || p.isVariableDeclarator());
              if (componentPath) {
                componentPath.traverse({
                  CallExpression(innerPath) {
                    if (
                      t.isIdentifier(innerPath.node.callee, { name: 't' }) ||
                      (t.isMemberExpression(innerPath.node.callee) &&
                        t.isIdentifier(innerPath.node.callee.property, { name: 't' }))
                    ) {
                      const keyArg = innerPath.node.arguments[0];
                      if (t.isStringLiteral(keyArg)) {
                        keys.add(`${namespace}.${keyArg.value}`);
                      }
                    }
                  },
                });
              }
            }
          }
          
          // Détecter les composants TranslatedText et similaires
          if (t.isJSXOpeningElement(path.node.callee)) {
            const componentName = path.node.callee.name?.name || 
                               (path.node.callee.property?.name || '');
            
            if (['TranslatedText', 'CommonText', 'NavigationText', 'FormText', 
                 'AssociationText', 'CampaignText', 'DonationText', 'AuthText', 'ErrorText'].includes(componentName)) {
              const props = path.node.arguments[0]?.properties || [];
              let namespace = '';
              let key = '';
              
              props.forEach(prop => {
                if (t.isObjectProperty(prop) || t.isObjectMethod(prop)) {
                  const propName = t.isIdentifier(prop.key) ? prop.key.name : prop.key.value;
                  if (propName === 'namespace' && t.isStringLiteral(prop.value)) {
                    namespace = prop.value.value;
                  } else if (propName === 'tKey' && t.isStringLiteral(prop.value)) {
                    key = prop.value.value;
                  }
                }
              });
              
              if (namespace && key) {
                keys.add(`${namespace}.${key}`);
              }
            }
          }
        },
      });
    } catch (error) {
      console.error(`Erreur lors de l'analyse du fichier ${file}:`, error);
    }
  });

  return Array.from(keys).sort();
}

// Vérifier les clés manquantes dans les fichiers de traduction
function checkMissingKeys() {
  const usedKeys = extractKeysFromFiles();
  const locales = fs.readdirSync(MESSAGES_DIR).filter(
    (item) => fs.statSync(path.join(MESSAGES_DIR, item)).isDirectory()
  );

  const missingKeys = {};
  
  locales.forEach((locale) => {
    missingKeys[locale] = [];
    const localePath = path.join(MESSAGES_DIR, locale);
    const translationFiles = fs.readdirSync(localePath).filter(file => file.endsWith('.json'));
    
    // Lire toutes les traductions pour cette locale
    const translations = {};
    translationFiles.forEach(file => {
      const namespace = path.basename(file, '.json');
      const filePath = path.join(localePath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        translations[namespace] = JSON.parse(content);
      } catch (error) {
        console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
      }
    });
    
    // Vérifier les clés manquantes
    usedKeys.forEach(usedKey => {
      const [namespace, ...keyParts] = usedKey.split('.');
      const key = keyParts.join('.');
      
      if (!translations[namespace] || translations[namespace][key] === undefined) {
        missingKeys[locale].push(usedKey);
      }
    });
  });
  
  return missingKeys;
}

// Exécuter la vérification
const missingKeys = checkMissingKeys();

// Afficher les résultats
Object.entries(missingKeys).forEach(([locale, keys]) => {
  if (keys.length > 0) {
    console.log(`\n🔍 Clés manquantes pour la locale ${locale}:`);
    keys.forEach(key => console.log(`  - ${key}`));
  } else {
    console.log(`\n✅ Aucune clé manquante pour la locale ${locale}`);
  }
});

// Créer un rapport détaillé
const reportPath = path.join(__dirname, '..', 'translation-report.json');
fs.writeFileSync(reportPath, JSON.stringify(missingKeys, null, 2));
console.log(`\n📊 Rapport complet enregistré dans: ${reportPath}`);

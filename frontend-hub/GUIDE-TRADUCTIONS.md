# 🌍 Guide Rapide - Analyse des Traductions

## 🚀 Commandes Essentielles

### Analyse Complète (Recommandée)
```bash
# Extraction + Vérification en une commande
npm run i18n:full
```

### Étapes Séparées
```bash
# 1. Extraire toutes les clés utilisées dans le code
npm run i18n:simple

# 2. Vérifier quelles clés existent dans messages/
npm run i18n:verify
```

### Vérification Rapide FR/HE
```bash
# Comparer seulement FR vs HE
npm run i18n:check
```

## 📊 Fichiers Générés

| Fichier | Description |
|---------|-------------|
| `translation-keys-simple.json` | Toutes les clés extraites du code |
| `translation-verification.json` | Rapport de vérification détaillé |
| `translation-comparison.json` | Comparaison FR vs HE |

## 🎯 Résultats Typiques

### ✅ Bon État (Score ≥95%)
```
🔍 Vérification des clés de traduction...
✅ Clés trouvées: 140
❌ Clés manquantes: 7
⚠️  Clés ambiguës: 0
🎯 Score de santé des traductions: 95%
🎉 Excellent ! Système de traduction très sain
```

### ⚠️ Attention Requise (Score <80%)
```
❌ CLÉS MANQUANTES:
   • common.newFeature - Clé non trouvée (3 utilisations)
   • auth.forgotPassword - Manquante en HE (2 utilisations)
⚠️  CLÉS AMBIGUËS:
   • welcome - Trouvée dans: common, homepage (1 utilisation)
```

## 🔧 Solutions aux Problèmes Courants

### 1. Clés Manquantes
**Problème :** `❌ common.newButton - Clé non trouvée`

**Solution :**
```json
// Ajouter dans messages/fr/common.json
{
  "newButton": "Nouveau bouton"
}

// Ajouter dans messages/he/common.json  
{
  "newButton": "כפתור חדש"
}
```

### 2. Clés Ambiguës  
**Problème :** `⚠️ welcome - Trouvée dans: common, homepage`

**Solution :**
```tsx
// ❌ Avant (ambigu)
const t = useTranslations();
return <h1>{t('welcome')}</h1>

// ✅ Après (explicite)
const t = useTranslations('common');
return <h1>{t('welcome')}</h1>
```

### 3. Incohérence FR/HE
**Problème :** `⚠️ auth: FR=15, HE=12, Utilisées=10`

**Solution :**
```bash
# Voir les différences exactes
npm run i18n:check
```

## 📋 Checklist Avant Commit

```bash
# 1. Extraire et vérifier
npm run i18n:full

# 2. Vérifier le score
# Score ≥95% = ✅ OK pour commit
# Score <95% = ❌ Corriger d'abord

# 3. Si nécessaire, corriger les clés manquantes
# 4. Re-vérifier
npm run i18n:verify
```

## 🔍 Patterns Détectés

Le système détecte automatiquement :

```tsx
// ✅ Hooks spécialisés
const t = useCommonTranslations();      // → namespace: common
const t = useAuthTranslations();        // → namespace: auth

// ✅ Hooks génériques  
const t = useTranslations('campaigns'); // → namespace: campaigns

// ✅ Props tKey
<CommonText tKey="welcome" />           // → common.welcome
<TranslatedText namespace="auth" tKey="login" /> // → auth.login

// ✅ Appels directs
t('common.welcome')                     // → common.welcome
t('error.notFound')                     // → error.notFound
```

## 💡 Bonnes Pratiques

### ✅ À Faire
- Utiliser des namespaces explicites : `t('common.welcome')`
- Préférer les hooks spécialisés : `useCommonTranslations()`
- Tester régulièrement : `npm run i18n:full`

### ❌ À Éviter  
- Clés ambiguës : `t('welcome')` sans namespace
- Clés en dur : `"Bienvenue"` au lieu de `t('welcome')`
- Oublier la traduction HE

## 🆘 Support

### Erreurs Communes

**Script PowerShell bloqué :**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Node.js manquant :**
```bash
# Installer Node.js 18+ depuis nodejs.org
node --version  # Vérifier la version
```

**Fichiers messages corrompus :**
```bash
# Valider JSON en ligne ou avec :
node -e "JSON.parse(require('fs').readFileSync('messages/fr/common.json', 'utf8'))"
```

---

💡 **Tip :** Ajoutez `npm run i18n:full` dans votre workflow Git pre-commit pour garantir la qualité des traductions !

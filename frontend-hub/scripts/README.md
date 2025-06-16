# 🌍 Scripts d'Analyse des Traductions

Cette collection de scripts permet d'automatiser l'extraction, la vérification et l'analyse des clés de traduction dans le projet MyTzedaka.

## 📋 Scripts Disponibles

### 1. 🔍 `extract-all-used-keys.ps1`
**Script principal** pour extraire TOUTES les clés de traduction utilisées dans le code.

```powershell
# Extraction complète
npm run i18n:extract-all

# Version détaillée avec info par fichier
npm run i18n:extract-detailed
```

**Fonctionnalités :**
- ✅ Détecte tous les patterns de traduction (hooks, props, composants)
- ✅ Analyse les namespaces utilisés
- ✅ Statistiques complètes par type et par fichier
- ✅ Export JSON avec toutes les données

### 2. 🧪 `analyze-translations.js`
**Script Node.js sophistiqué** pour analyse approfondie avec validation.

```bash
npm run i18n:analyze
```

**Fonctionnalités :**
- ✅ Détection clés manquantes
- ✅ Vérification cohérence FR/HE
- ✅ Identification clés inutilisées
- ✅ Rapport détaillé avec contexte d'utilisation

### 3. ⚖️ `check-missing-translations.ps1`
**Script rapide** pour comparer FR vs HE uniquement.

```powershell
npm run i18n:check
```

**Fonctionnalités :**
- ✅ Comparaison directe FR ↔ HE
- ✅ Détection clés manquantes ou supplémentaires
- ✅ Rapport de cohérence par fichier

### 4. 📊 `extract-translation-keys.ps1`
**Script complet** avec extraction ET vérification.

```powershell
npm run i18n:full-report
```

**Fonctionnalités :**
- ✅ Extraction + validation en une commande
- ✅ Analyse des patterns utilisés
- ✅ Rapport final consolidé

## 🎯 Utilisation Recommandée

### Workflow d'analyse complète :

1. **Extraction exhaustive** (point de départ)
   ```bash
   npm run i18n:extract-detailed
   ```

2. **Analyse approfondie** (recommandé)
   ```bash
   npm run i18n:analyze
   ```

3. **Vérification rapide FR/HE** (quotidien)
   ```bash
   npm run i18n:check
   ```

### Cas d'usage spécifiques :

#### 🆕 Nouveau développeur
```bash
# Vue d'ensemble complète du système i18n
npm run i18n:extract-detailed
```

#### 🔧 Pendant le développement
```bash
# Vérification rapide après ajout de nouvelles traductions
npm run i18n:check
```

#### 🚀 Avant déploiement
```bash
# Analyse complète pour garantir la qualité
npm run i18n:analyze
```

#### 🧹 Nettoyage de code
```bash
# Identifier les clés inutilisées
npm run i18n:analyze
# Voir section "unusedKeys" dans le rapport
```

## 📤 Fichiers de Sortie

| Script | Fichier | Description |
|--------|---------|-------------|
| `extract-all-used-keys.ps1` | `all-translation-keys.json` | Toutes les clés extraites avec contexte |
| `analyze-translations.js` | `translation-analysis.json` | Analyse complète avec validations |
| `check-missing-translations.ps1` | `translation-comparison.json` | Comparaison FR vs HE |
| `extract-translation-keys.ps1` | `translation-analysis.json` | Rapport consolidé |

## 🔧 Configuration

### Personnalisation des patterns
Modifier les patterns dans `extract-all-used-keys.ps1` pour ajouter de nouveaux formats :

```powershell
$patterns = @{
    "CustomPattern" = @(
        "customHook\('([^']+)'\)",
        "myTranslation\(`"([^`"]+)`"\)"
    )
}
```

### Ajout de nouveaux hooks
Étendre le mapping dans `analyze-translations.js` :

```javascript
const hookToNamespace = {
    'useMyCustomTranslations': 'custom',
    // ...
}
```

## 🐛 Résolution de Problèmes

### Script PowerShell bloqué
```powershell
# Autoriser l'exécution des scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erreurs de parsing JSON
- Vérifier la syntaxe des fichiers `messages/**/*.json`
- Utiliser un validateur JSON en ligne

### Patterns non détectés
- Ajouter le nouveau pattern dans le script approprié
- Tester avec un fichier simple d'abord

## 📈 Métriques et KPIs

### Objectifs qualité :
- ✅ **0 clé manquante** entre FR et HE
- ✅ **≤ 5% clés inutilisées** (acceptable)
- ✅ **100% namespaces documentés**
- ✅ **Cohérence parfaite** entre locales

### Surveillance continue :
```bash
# CI/CD - vérification automatique
npm run i18n:check
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Incohérences détectées dans les traductions"
    exit 1 
}
```

## 🤝 Contribution

Pour ajouter un nouveau pattern de traduction :

1. Modifier le script approprié
2. Tester sur un échantillon
3. Mettre à jour cette documentation
4. Créer un commit avec les modifications

---

**💡 Conseil :** Exécutez `npm run i18n:analyze` avant chaque merge pour garantir la qualité des traductions !

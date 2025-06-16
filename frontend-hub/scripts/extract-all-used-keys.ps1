# Script PowerShell pour extraire TOUTES les clés de traduction utilisées
param(
    [string]$SourceDir = "src",
    [switch]$Detailed = $false
)

Write-Host "🔍 Extraction complète des clés de traduction..." -ForegroundColor Green

# Patterns exhaustifs pour détecter les clés
$patterns = @{
    # Appels directs t()
    "DirectT" = @(
        "t\('([^']+)'\)",
        "t\(`"([^`"]+)`"\)",
        "t\(\s*'([^']+)'\s*\)",
        "t\(\s*`"([^`"]+)`"\s*\)"
    )
    
    # Hooks useTranslations
    "UseTranslations" = @(
        "useTranslations\('([^']+)'\)",
        "useTranslations\(`"([^`"]+)`"\)"
    )
    
    # Hooks spécialisés
    "SpecializedHooks" = @(
        "useCommonTranslations\(\)",
        "useNavigationTranslations\(\)",
        "useFormTranslations\(\)",
        "useAssociationTranslations\(\)",
        "useCampaignTranslations\(\)",
        "useDonationTranslations\(\)",
        "useAuthTranslations\(\)",
        "useDashboardTranslations\(\)",
        "useErrorTranslations\(\)",
        "useSearchTranslations\(\)",
        "useComponentTranslations\(\)"
    )
    
    # Props tKey
    "TKeyProps" = @(
        "tKey=\s*'([^']+)'",
        "tKey=\s*`"([^`"]+)`"",
        "tKey=\s*\{[^}]*'([^']+)'[^}]*\}",
        "tKey=\s*\{[^}]*`"([^`"]+)`"[^}]*\}"
    )
    
    # Namespace props
    "NamespaceProps" = @(
        "namespace=\s*'([^']+)'",
        "namespace=\s*`"([^`"]+)`""
    )
    
    # Composants traduits
    "TranslatedComponents" = @(
        "<CommonText[^>]*tKey=\s*['\`"]([^'\`"]+)['\`"]",
        "<FormText[^>]*tKey=\s*['\`"]([^'\`"]+)['\`"]",
        "<AssociationText[^>]*tKey=\s*['\`"]([^'\`"]+)['\`"]",
        "<CampaignText[^>]*tKey=\s*['\`"]([^'\`"]+)['\`"]",
        "<DonationText[^>]*tKey=\s*['\`"]([^'\`"]+)['\`"]",
        "<AuthText[^>]*tKey=\s*['\`"]([^'\`"]+)['\`"]",
        "<DashboardText[^>]*tKey=\s*['\`"]([^'\`"]+)['\`"]",
        "<ErrorText[^>]*tKey=\s*['\`"]([^'\`"]+)['\`"]",
        "<NavigationText[^>]*tKey=\s*['\`"]([^'\`"]+)['\`"]",
        "<SearchText[^>]*tKey=\s*['\`"]([^'\`"]+)['\`"]",
        "<TranslatedText[^>]*tKey=\s*['\`"]([^'\`"]+)['\`"]"
    )
}

# Mapping hooks vers namespaces
$hookNamespaces = @{
    "useCommonTranslations" = "common"
    "useNavigationTranslations" = "navigation"
    "useFormTranslations" = "forms"
    "useAssociationTranslations" = "associations"
    "useCampaignTranslations" = "campaigns"
    "useDonationTranslations" = "donations"
    "useAuthTranslations" = "auth"
    "useDashboardTranslations" = "dashboard"
    "useErrorTranslations" = "errors"
    "useSearchTranslations" = "search"
    "useComponentTranslations" = "components"
}

# Stockage des résultats
$allKeys = @()
$namespaces = @()
$fileStats = @{}

# Fonction pour analyser un fichier
function Analyze-File {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return }
    
    $lines = $content -split "`n"
    $fileName = Split-Path $FilePath -Leaf
    $relativeFile = $FilePath.Replace((Get-Location).Path, "").TrimStart("\")
    
    $fileKeys = @()
    $fileNamespaces = @()
    
    # Analyser chaque catégorie de patterns
    foreach ($category in $patterns.Keys) {
        foreach ($pattern in $patterns[$category]) {
            $matches = [regex]::Matches($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            
            foreach ($match in $matches) {
                $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
                $line = if ($lineNumber -le $lines.Count) { $lines[$lineNumber - 1].Trim() } else { "" }
                
                if ($category -eq "SpecializedHooks") {
                    # Extraire le namespace du nom du hook
                    $hookName = $match.Value -replace '\(\)', ''
                    if ($hookNamespaces.ContainsKey($hookName)) {
                        $namespace = $hookNamespaces[$hookName]
                        $fileNamespaces += $namespace
                        
                        $allKeys += [PSCustomObject]@{
                            File = $relativeFile
                            Type = "Hook"
                            Namespace = $namespace
                            Key = ""
                            FullKey = $namespace
                            Line = $lineNumber
                            Context = $line
                            Pattern = $pattern
                        }
                    }
                } elseif ($match.Groups.Count -gt 1 -and $match.Groups[1].Value) {
                    $key = $match.Groups[1].Value
                    
                    # Déterminer le namespace et la clé
                    $namespace = ""
                    $actualKey = $key
                    
                    if ($key.Contains('.')) {
                        $parts = $key -split '\.', 2
                        $namespace = $parts[0]
                        $actualKey = $parts[1]
                    } elseif ($category -eq "UseTranslations" -or $category -eq "NamespaceProps") {
                        $namespace = $key
                        $actualKey = ""
                    }
                    
                    $fileKeys += $key
                    if ($namespace) { $fileNamespaces += $namespace }
                    
                    $allKeys += [PSCustomObject]@{
                        File = $relativeFile
                        Type = $category
                        Namespace = $namespace
                        Key = $actualKey
                        FullKey = $key
                        Line = $lineNumber
                        Context = $line
                        Pattern = $pattern
                    }
                }
            }
        }
    }
    
    $fileStats[$relativeFile] = @{
        TotalKeys = $fileKeys.Count
        UniqueKeys = ($fileKeys | Sort-Object -Unique).Count
        Namespaces = ($fileNamespaces | Sort-Object -Unique)
        KeyTypes = ($allKeys | Where-Object { $_.File -eq $relativeFile } | Group-Object Type | ForEach-Object { @{$_.Name = $_.Count} })
    }
    
    if ($Detailed) {
        Write-Host "📄 $fileName : $($fileKeys.Count) clés, $($fileNamespaces | Sort-Object -Unique | Measure-Object).Count namespaces" -ForegroundColor Gray
    }
}

# Analyser tous les fichiers
Write-Host "📁 Analyse des fichiers..." -ForegroundColor Yellow

$sourceFiles = Get-ChildItem -Path $SourceDir -Recurse -Include "*.tsx", "*.ts", "*.jsx", "*.js" | 
    Where-Object { $_.FullName -notmatch "node_modules|\.test\.|\.spec\.|\.d\.ts$" }

$totalFiles = $sourceFiles.Count
$currentFile = 0

foreach ($file in $sourceFiles) {
    $currentFile++
    Write-Progress -Activity "Analyse des fichiers" -Status "Fichier $currentFile/$totalFiles" -PercentComplete (($currentFile / $totalFiles) * 100)
    
    Analyze-File $file.FullName
}

Write-Progress -Completed -Activity "Analyse des fichiers"

# Analyser les résultats
$uniqueKeys = $allKeys | Sort-Object FullKey -Unique
$uniqueNamespaces = $allKeys | Where-Object { $_.Namespace } | Select-Object -ExpandProperty Namespace | Sort-Object -Unique
$keysByType = $allKeys | Group-Object Type
$keysByNamespace = $allKeys | Where-Object { $_.Namespace } | Group-Object Namespace

Write-Host "`n📊 RÉSULTATS D'ANALYSE:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "📈 Statistiques générales:" -ForegroundColor White
Write-Host "   • Fichiers analysés: $totalFiles" -ForegroundColor Green
Write-Host "   • Total occurrences: $($allKeys.Count)" -ForegroundColor Green
Write-Host "   • Clés uniques: $($uniqueKeys.Count)" -ForegroundColor Green
Write-Host "   • Namespaces: $($uniqueNamespaces.Count)" -ForegroundColor Green

Write-Host "`n🏷️  Namespaces trouvés:" -ForegroundColor White
$uniqueNamespaces | ForEach-Object { 
    $count = ($allKeys | Where-Object { $_.Namespace -eq $_ }).Count
    Write-Host "   • $_ ($count occurrences)" -ForegroundColor Yellow
}

Write-Host "`n📝 Types de clés:" -ForegroundColor White
$keysByType | ForEach-Object {
    Write-Host "   • $($_.Name): $($_.Count)" -ForegroundColor Yellow
}

if ($Detailed) {
    Write-Host "`n📋 Détail par fichier:" -ForegroundColor White
    $fileStats.Keys | Sort-Object | ForEach-Object {
        $stats = $fileStats[$_]
        Write-Host "   📄 $_" -ForegroundColor Gray
        Write-Host "      Clés: $($stats.TotalKeys) (uniques: $($stats.UniqueKeys))" -ForegroundColor White
        if ($stats.Namespaces.Count -gt 0) {
            Write-Host "      Namespaces: $($stats.Namespaces -join ', ')" -ForegroundColor White
        }
    }
}

# Exporter les résultats
$results = @{
    summary = @{
        filesAnalyzed = $totalFiles
        totalOccurrences = $allKeys.Count
        uniqueKeys = $uniqueKeys.Count
        namespacesCount = $uniqueNamespaces.Count
        analyzedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    namespaces = $uniqueNamespaces
    allKeys = $allKeys
    uniqueKeys = $uniqueKeys | Select-Object FullKey, Namespace, Key | Sort-Object FullKey
    fileStats = $fileStats
    keysByType = $keysByType | ForEach-Object { @{ Type = $_.Name; Count = $_.Count; Keys = $_.Group | Select-Object FullKey -Unique } }
    keysByNamespace = $keysByNamespace | ForEach-Object { @{ Namespace = $_.Name; Count = $_.Count; Keys = $_.Group | Select-Object FullKey -Unique } }
}

$outputFile = "all-translation-keys.json"
$results | ConvertTo-Json -Depth 10 | Out-File $outputFile -Encoding UTF8

Write-Host "`n💾 Rapport complet exporté: $outputFile" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Afficher un échantillon des clés trouvées
Write-Host "`n🔍 Échantillon des clés (top 20):" -ForegroundColor White
$uniqueKeys | Select-Object -First 20 | ForEach-Object {
    if ($_.Namespace) {
        Write-Host "   • $($_.FullKey)" -ForegroundColor Green
    } else {
        Write-Host "   • $($_.FullKey) (namespace à déterminer)" -ForegroundColor Yellow
    }
}

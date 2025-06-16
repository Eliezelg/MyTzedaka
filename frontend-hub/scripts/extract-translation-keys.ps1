# Script PowerShell pour extraire et vérifier les clés de traduction
param(
    [string]$SourceDir = "src",
    [string]$MessagesDir = "messages"
)

Write-Host "🔍 Extraction des clés de traduction..." -ForegroundColor Green

# Patterns de recherche pour les clés de traduction
$patterns = @(
    "t\('([^']+)'\)",           # t('key')
    "t\(`"([^`"]+)`"\)",        # t("key")
    "tKey=`"([^`"]+)`"",        # tKey="key"
    "tKey='([^']+)'",           # tKey='key'
    "useTranslations\('([^']+)'\)", # useTranslations('namespace')
    "TranslatedText[^>]*tKey=`"([^`"]+)`"" # TranslatedText tKey="key"
)

# Extraire toutes les clés utilisées
$usedKeys = @()
$namespaces = @()

Get-ChildItem -Path $SourceDir -Recurse -Include "*.tsx", "*.ts", "*.jsx", "*.js" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    foreach ($pattern in $patterns) {
        $matches = [regex]::Matches($content, $pattern)
        foreach ($match in $matches) {
            $key = $match.Groups[1].Value
            if ($pattern -like "*useTranslations*") {
                $namespaces += $key
            } else {
                $usedKeys += [PSCustomObject]@{
                    File = $_.Name
                    Key = $key
                    Line = ($content.Substring(0, $match.Index) -split "`n").Count
                }
            }
        }
    }
}

Write-Host "📊 Résultats d'extraction:" -ForegroundColor Yellow
Write-Host "- Clés utilisées: $($usedKeys.Count)" -ForegroundColor White
Write-Host "- Namespaces: $($namespaces | Sort-Object -Unique | ForEach-Object { $_ }) " -ForegroundColor White

# Lister toutes les clés disponibles dans les messages
$availableKeys = @{}
Get-ChildItem -Path "$MessagesDir\fr" -Filter "*.json" | ForEach-Object {
    $namespace = $_.BaseName
    $content = Get-Content $_.FullName | ConvertFrom-Json
    
    function Get-FlatKeys($obj, $prefix = "") {
        $keys = @()
        $obj.PSObject.Properties | ForEach-Object {
            if ($_.Value -is [PSCustomObject]) {
                $keys += Get-FlatKeys $_.Value "$prefix$($_.Name)."
            } else {
                $keys += "$prefix$($_.Name)"
            }
        }
        return $keys
    }
    
    $flatKeys = Get-FlatKeys $content
    $availableKeys[$namespace] = $flatKeys
}

Write-Host "`n🔍 Vérification des clés manquantes:" -ForegroundColor Green

# Vérifier les clés manquantes
$missingKeys = @()
$usedKeys | ForEach-Object {
    $keyParts = $_.Key -split '\.'
    if ($keyParts.Count -gt 1) {
        $namespace = $keyParts[0]
        $key = ($keyParts[1..($keyParts.Count-1)]) -join '.'
        
        if ($availableKeys.ContainsKey($namespace)) {
            if ($key -notin $availableKeys[$namespace]) {
                $missingKeys += [PSCustomObject]@{
                    File = $_.File
                    Namespace = $namespace
                    Key = $key
                    FullKey = $_.Key
                    Line = $_.Line
                }
            }
        } else {
            $missingKeys += [PSCustomObject]@{
                File = $_.File
                Namespace = $namespace
                Key = $key
                FullKey = $_.Key
                Line = $_.Line
            }
        }
    }
}

if ($missingKeys.Count -gt 0) {
    Write-Host "❌ Clés manquantes trouvées:" -ForegroundColor Red
    $missingKeys | Format-Table -AutoSize
} else {
    Write-Host "✅ Toutes les clés existent!" -ForegroundColor Green
}

# Exporter les résultats
$results = @{
    UsedKeys = $usedKeys
    Namespaces = $namespaces | Sort-Object -Unique
    AvailableKeys = $availableKeys
    MissingKeys = $missingKeys
    Summary = @{
        TotalUsedKeys = $usedKeys.Count
        TotalNamespaces = ($namespaces | Sort-Object -Unique).Count
        MissingKeysCount = $missingKeys.Count
    }
}

$results | ConvertTo-Json -Depth 10 | Out-File "translation-analysis.json" -Encoding UTF8
Write-Host "`n📄 Rapport complet sauvegardé dans: translation-analysis.json" -ForegroundColor Blue

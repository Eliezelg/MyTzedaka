# Script rapide pour vérifier les clés manquantes entre FR et HE
param(
    [string]$MessagesDir = "messages"
)

Write-Host "🔍 Vérification des traductions FR vs HE..." -ForegroundColor Green

$frDir = Join-Path $MessagesDir "fr"
$heDir = Join-Path $MessagesDir "he"

if (-not (Test-Path $frDir) -or -not (Test-Path $heDir)) {
    Write-Host "❌ Dossiers messages/fr ou messages/he introuvables!" -ForegroundColor Red
    exit 1
}

$missingInHe = @()
$missingInFr = @()
$extraInHe = @()

# Comparer chaque fichier JSON
Get-ChildItem -Path $frDir -Filter "*.json" | ForEach-Object {
    $fileName = $_.Name
    $frFile = $_.FullName
    $heFile = Join-Path $heDir $fileName
    
    Write-Host "📄 Analyse: $fileName" -ForegroundColor Yellow
    
    if (-not (Test-Path $heFile)) {
        Write-Host "  ❌ Fichier manquant en hébreu: $fileName" -ForegroundColor Red
        return
    }
    
    try {
        $frContent = Get-Content $frFile -Raw | ConvertFrom-Json
        $heContent = Get-Content $heFile -Raw | ConvertFrom-Json
        
        # Fonction récursive pour obtenir toutes les clés
        function Get-AllKeys($obj, $prefix = "") {
            $keys = @()
            if ($obj -is [PSCustomObject]) {
                $obj.PSObject.Properties | ForEach-Object {
                    $fullKey = if ($prefix) { "$prefix.$($_.Name)" } else { $_.Name }
                    if ($_.Value -is [PSCustomObject]) {
                        $keys += Get-AllKeys $_.Value $fullKey
                    } else {
                        $keys += $fullKey
                    }
                }
            }
            return $keys
        }
        
        $frKeys = Get-AllKeys $frContent
        $heKeys = Get-AllKeys $heContent
        
        # Trouver les clés manquantes
        $frKeys | ForEach-Object {
            if ($_ -notin $heKeys) {
                $missingInHe += [PSCustomObject]@{
                    File = $fileName
                    Key = $_
                }
            }
        }
        
        $heKeys | ForEach-Object {
            if ($_ -notin $frKeys) {
                $extraInHe += [PSCustomObject]@{
                    File = $fileName  
                    Key = $_
                }
            }
        }
        
        Write-Host "  ✓ FR: $($frKeys.Count) clés, HE: $($heKeys.Count) clés" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Erreur analyse $fileName : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Afficher les résultats
Write-Host "`n📊 RÉSULTATS:" -ForegroundColor Cyan

if ($missingInHe.Count -gt 0) {
    Write-Host "`n❌ Clés manquantes en hébreu ($($missingInHe.Count)):" -ForegroundColor Red
    $missingInHe | Format-Table -AutoSize
} else {
    Write-Host "`n✅ Aucune clé manquante en hébreu!" -ForegroundColor Green
}

if ($extraInHe.Count -gt 0) {
    Write-Host "`n⚠️  Clés supplémentaires en hébreu ($($extraInHe.Count)):" -ForegroundColor Yellow
    $extraInHe | Format-Table -AutoSize
} else {
    Write-Host "`n✅ Aucune clé supplémentaire en hébreu!" -ForegroundColor Green
}

# Sauvegarder le rapport
$report = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    missingInHebrew = $missingInHe
    extraInHebrew = $extraInHe
    summary = @{
        missingInHebrewCount = $missingInHe.Count
        extraInHebrewCount = $extraInHe.Count
        filesAnalyzed = (Get-ChildItem -Path $frDir -Filter "*.json").Count
    }
}

$report | ConvertTo-Json -Depth 10 | Out-File "translation-comparison.json" -Encoding UTF8
Write-Host "`n📄 Rapport sauvegardé: translation-comparison.json" -ForegroundColor Blue

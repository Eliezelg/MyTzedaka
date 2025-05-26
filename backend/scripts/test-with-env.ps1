# Script PowerShell pour exécuter les tests avec les bonnes variables d'environnement
param(
    [Parameter(Mandatory=$true)]
    [string]$TestCommand
)

# Charger les variables d'environnement de test
$envTestFile = Join-Path $PSScriptRoot ".." ".env.test"

if (Test-Path $envTestFile) {
    Get-Content $envTestFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim('"')
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "Set $key" -ForegroundColor Green
        }
    }
}

# Exécuter la commande de test
Write-Host "Exécution: $TestCommand" -ForegroundColor Yellow
Invoke-Expression $TestCommand

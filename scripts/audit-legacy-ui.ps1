param(
    [string]$Target = "."
)

Write-Host ">>> Auditing Legacy UI Patterns in: $Target" -ForegroundColor Yellow

$Patterns = @(
    "@gluestack-ui/themed",
    "@gluestack-ui/config",
    "from 'react-native'",
    "from ""react-native"""
)

$Exclude = "packages/ui,node_modules,dist,.turbo"

foreach ($p in $Patterns) {
    Write-Host "`n--- Searching for: $p ---" -ForegroundColor Cyan
    powershell -ExecutionPolicy Bypass -File scripts/grep-code.ps1 -Query $p -Exclude $Exclude
}

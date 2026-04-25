param(
    [string]$Target = "packages"
)

Write-Host ">>> Auditing Legacy UI Patterns in: $Target (Zero-Legacy Shiny Edition)" -ForegroundColor Yellow

$Patterns = @(
    "@gluestack-ui/themed",
    "@gluestack-ui/config",
    "@gluestack-ui/react",
    "native-base",
    "from 'react-native'",
    "from ""react-native"""
)


# Exclude the UI library itself and node_modules/dist
$Exclude = "packages/ui,node_modules,dist,.turbo,.git"

# Build the rg command
# We use multiple -e flags for better pattern management
$RgArgs = @("--line-number", "--column", "--smart-case", "--color=always")

foreach ($p in $Patterns) {
    $RgArgs += "-e"
    $RgArgs += $p
}

# Add exclusions as globs
$ExcludePatterns = $Exclude.Split(",").Trim() | Where-Object { $_ -ne "" }
foreach ($pattern in $ExcludePatterns) {
    $RgArgs += "-g"
    $RgArgs += "!$pattern"
}

# Add specific glob for packages to avoid auditing tools or scripts if not in Target
# but since Target defaults to packages, it's already scoped.

try {
    Write-Host "--- Running ripgrep on legacy patterns ---" -ForegroundColor Cyan
    & rg $RgArgs "$Target"
    
    Write-Host "`n>>> Audit Complete." -ForegroundColor Green
    Write-Host "If matches were found above, please refactor them to use @repo/ui primitives and NativeWind v4 utility classes." -ForegroundColor Gray
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

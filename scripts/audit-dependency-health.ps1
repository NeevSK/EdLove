param(
    [string]$Package = "all"
)

Write-Host "`n>>> Polymath Dependency Health Audit <<<" -ForegroundColor Cyan

# 1. Capture Universal Outdated (Discovery)
Write-Host "--- Scanning Registry for Newer Versions ---" -ForegroundColor Yellow
$outdatedJson = pnpm outdated --json -r | Out-String
if ($null -eq $outdatedJson -or $outdatedJson.Trim() -eq "") {
    $outdated = @{}
} else {
    try {
        $outdated = $outdatedJson | ConvertFrom-Json
    } catch {
        $outdated = @{}
    }
}

# 2. Capture Expo Context (Validation)
Write-Host "--- Checking Expo SDK Compliance (SDK 55) ---" -ForegroundColor Yellow
$expoCheck = pnpm --filter gurudevi-mobile exec expo install --check | Out-String

# 3. Analyze Misalignment
Write-Host "`n--- Health Report ---`n" -ForegroundColor Cyan

# It's a PSCustomObject or a Hashtable depending on structure
foreach ($prop in $outdated.PSObject.Properties) {
    $pkgName = $prop.Name
    $item = $prop.Value
    
    # Check if this package is part of the Expo SDK 55 "Locked" set
    $isPinnedByExpo = $false
    if ($pkgName -match "^expo" -or $pkgName -match "react-native") {
        $isPinnedByExpo = $true
    }

    $status = "Safe"
    if ($item.current -ne $item.wanted) { $status = "Urgent" }
    if ($item.wanted -ne $item.latest) { $status = "Review" }
    if ($isPinnedByExpo) { $status = "PINNED" }

    Write-Host "[$status] $pkgName ($($item.current) -> $($item.latest))"
}

if ($expoCheck -match "Dependencies are up to date") {
    Write-Host "`n[OK] Expo SDK Integrity: VALID" -ForegroundColor Green
} else {
    Write-Host "`n[FAIL] Expo SDK Integrity: MISALIGNED" -ForegroundColor Red
    Write-Host $expoCheck
}

Write-Host "`n--- Audit Complete ---" -ForegroundColor Cyan

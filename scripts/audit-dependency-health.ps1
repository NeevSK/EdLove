param(
    [int]$MajorLag = 1,
    [switch]$JSON = $false,
    [switch]$FailOnUnannotated = $false
)

Write-Host "`n>>> Polymath Dependency Health & Version Drift Audit <<<" -ForegroundColor Cyan

# 1. Execute Unified Version Drift Engine
$argsList = @("scripts/audit-version-drift.mjs", "--n-major=$MajorLag")
if ($JSON) { $argsList += "--json" }
if ($FailOnUnannotated) { $argsList += "--fail-on-unannotated" }

node $argsList

# 2. Check Expo SDK Compliance via expo-doctor (Complies with AGENTS.md Rule 1)
Write-Host "`n--- Checking Expo SDK Compliance (expo-doctor) ---" -ForegroundColor Yellow
$expoDoctorResult = pnpm --filter gurudevi-mobile exec expo-doctor 2>&1 | Out-String

if ($expoDoctorResult -match "Didn't find any issues" -or $LASTEXITCODE -eq 0) {
    Write-Host "`n[OK] Expo SDK Integrity (expo-doctor): VALID" -ForegroundColor Green
} else {
    Write-Host "`n[NOTICE] Expo Doctor Output:" -ForegroundColor Yellow
    Write-Host $expoDoctorResult
}

Write-Host "`n--- Audit Complete ---" -ForegroundColor Cyan

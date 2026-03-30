if (!(Test-Path -Path "reports")) { New-Item -ItemType Directory -Path "reports" }

$hasErrors = $false

Write-Host "`n>>> Starting Unified Hygiene Audit <<<`n" -ForegroundColor Cyan

# 1. Circular Dependencies
Write-Host "--- Checking Circular Dependencies ---" -ForegroundColor Yellow
pnpm run check:circular
if ($LASTEXITCODE -ne 0) { $hasErrors = $true; Write-Host "❌ Circular dependencies found!" -ForegroundColor Red }

# 2. Unused Code
Write-Host "`n--- Checking Unused Code ---" -ForegroundColor Yellow
pnpm run check:unused
if ($LASTEXITCODE -ne 0) { $hasErrors = $true; Write-Host "❌ Unused code or dependencies found!" -ForegroundColor Red }

# 3. Architecture Boundaries
Write-Host "`n--- Checking Architecture Boundaries ---" -ForegroundColor Yellow
pnpm run check:architecture
if ($LASTEXITCODE -ne 0) { $hasErrors = $true; Write-Host "❌ Architectural boundary violations found!" -ForegroundColor Red }

if ($hasErrors) {
    Write-Host "`n⚠️  Hygiene checks failed. Please review the reports in the 'reports/' directory." -ForegroundColor DarkYellow
    exit 1
} else {
    Write-Host "`n✅ All hygiene checks passed!" -ForegroundColor Green
    exit 0
}

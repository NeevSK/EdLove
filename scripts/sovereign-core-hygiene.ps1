# Sovereign Core Hygiene Tool
# Automatically identifies God Files, Deprecated patterns, and potential circularities.

$CoreSrc = "packages/core/src"
$MaxLines = 350
$MaxExports = 15

Write-Host "`n>>> Polymath Sovereign Hygiene Audit <<<" -ForegroundColor Cyan

# 1. God File Detection
Write-Host "`n[1/3] Searching for God File candidates (Lines > $MaxLines)..." -ForegroundColor Yellow
$files = Get-ChildItem -Path $CoreSrc -Filter "*.ts" -Recurse
foreach ($file in $files) {
    $lines = (Get-Content $file.FullName).Count
    if ($lines -gt $MaxLines) {
        Write-Host "  [!] GOD FILE: $($file.FullName) ($lines lines)" -ForegroundColor Red
    }
}

# 2. High-Density Export Detection
Write-Host "`n[2/3] Searching for High-Density API orchestrators (Exports > $MaxExports)..." -ForegroundColor Yellow
foreach ($file in $files) {
    $exports = (Select-String -Path $file.FullName -Pattern "export (const|function|interface|type)").Count
    if ($exports -gt $MaxExports) {
        Write-Host "  [!] HIGH DENSITY: $($file.FullName) ($exports exports)" -ForegroundColor Magenta
    }
}

# 3. Import Loop Detection (Barrel Self-Reference)
Write-Host "`n[3/3] Checking for Barrel Self-References (Internal index imports)..." -ForegroundColor Yellow
$barrelRefs = Select-String -Path "$CoreSrc/api/**/*.ts" -Pattern "from '\./index'|from '\.'" 
foreach ($ref in $barrelRefs) {
    if ($ref.Filename -ne "index.ts") {
        Write-Host "  [!] CIRCULAR RISK: $($ref.Filename):$($ref.LineNumber) -> $($ref.Line)" -ForegroundColor DarkRed
    }
}

Write-Host "`n>>> Hygiene Audit Complete <<<" -ForegroundColor Green

param(
    [string]$StagedFiles = ""
)

if ([string]::IsNullOrWhiteSpace($StagedFiles)) {
    Write-Host "No staged files provided. Skipping surgical check." -ForegroundColor Gray
    exit 0
}

# Extract unique package directories from staged files
$packages = $StagedFiles.Split(" ") | ForEach-Object {
    if ($_ -match "packages/([^/]+)/" -or $_ -match "apps/([^/]+)/") {
        $matches[0].TrimEnd('/')
    }
} | Select-Object -Unique

if ($null -eq $packages -or $packages.Count -eq 0) {
    Write-Host "No package-level changes detected. Skipping surgical check." -ForegroundColor Gray
    exit 0
}

$Filters = $packages | ForEach-Object { "--filter=..../$_" }
$FilterCmd = $Filters -join " "

Write-Host ">>> Running Surgical Type Check for affected packages: $packages" -ForegroundColor Cyan

# Turbo filters can pull in a large dependency graph and fail commits due to unrelated packages.
# For surgical pre-commit checks, typecheck only the packages that were directly modified.
foreach ($pkg in $packages) {
    if (Test-Path $pkg) {
        Write-Host ">>> check-types: $pkg" -ForegroundColor Cyan
        Invoke-Expression "pnpm -C $pkg run check-types"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Surgical type check failed in $pkg" -ForegroundColor Red
            exit 1
        }
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Surgical type check failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Surgical checks passed!" -ForegroundColor Green
exit 0

param(
    [Parameter(Mandatory=$true)]
    [string]$Query,
    [string]$Target = ".",
    [switch]$IncludeNodeModules,
    [switch]$SummaryOnly,
    [switch]$Hybrid
)

Write-Host ">>> Discovering Documentation and Configs for: $Query" -ForegroundColor Green

# 1. Hybrid Check: If it looks like a code pattern and hybrid is on, use Biome
if ($Hybrid -or ($Query -match "[\(\)\{\}\.]")) {
    Write-Host ">>> Using Biome for Structural Search..." -ForegroundColor Gray
    try {
        npx biome search $Query $Target
    } catch {
        Write-Host "Biome search failed, falling back to text search." -ForegroundColor Yellow
    }
}

# 2. Sequential Discovery Strategy
$DocPaths = @(
    "docs",
    "packages/*/docs",
    "apps/*/docs",
    "README.md",
    "packages/*/README.md",
    "apps/*/README.md"
)

$ConfigPaths = @(
    "package.json",
    "packages/*/package.json",
    "apps/*/package.json",
    "app.json",
    "apps/*/app.json",
    "tsconfig.json",
    "*.yaml",
    "*.yml"
)

$excludeList = "dist,node_modules,.git,.turbo"
if ($IncludeNodeModules) { $excludeList = "dist,.git,.turbo" }
$exRegex = ($excludeList.Split(",") | ForEach-Object { [regex]::Escape($_) }) -join '|'

function Run-Discovery($paths, $query) {
    if ($paths.Count -eq 0) { return @() }
    
    $allFiles = @()
    foreach ($p in $paths) {
        # Handle wildcards manually if needed, but Get-ChildItem handles them in -Path
        $fullPath = Join-Path $Target $p
        Get-ChildItem -Path $fullPath -File -ErrorAction SilentlyContinue | ForEach-Object {
            if ($_.FullName -notmatch $exRegex) { $allFiles += $_ }
        }
        # If it's a directory, we might want to recurse (common for 'docs/' folders)
        if (Test-Path $fullPath) {
            if ((Get-Item $fullPath).PSIsContainer) {
                Get-ChildItem -Path $fullPath -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
                    if ($_.FullName -notmatch $exRegex) { $allFiles += $_ }
                }
            }
        }
    }

    if ($allFiles.Count -eq 0) { return $null }
    return $allFiles | Select-String -Pattern $query -CaseSensitive:$false
}

# Phase A: Search Docs
$results = Run-Discovery $DocPaths $Query

# Phase B: Auto-Escalation to Configs
if ($null -eq $results) {
    Write-Host "No direct matches in documentation. Escalating to configuration files..." -ForegroundColor Gray
    $results = Run-Discovery $ConfigPaths $Query
}

# Phase C: Deep Search (If still nothing)
if ($null -eq $results) {
    Write-Host "No matches in configs. Performing deep codebase search..." -ForegroundColor Gray
    $excludePatterns = $excludeList.Split(",")
    $excludeDeepRegex = ($excludePatterns | ForEach-Object { [regex]::Escape($_) }) -join '|'
    
    $results = Get-ChildItem -Path $Target -Recurse -File -ErrorAction SilentlyContinue | 
               Where-Object { $_.FullName -notmatch $excludeDeepRegex -and ($_.Extension -match "\.(ts|tsx|js|jsx|md|json|yaml|yml)$") } | 
               Select-String -Pattern $Query -CaseSensitive:$false
}

if ($null -eq $results) {
    Write-Host "No matches found across any documentation or source files."
    exit 0
}

# 3. Output and Summary
$uniqueFiles = $results | Select-Object -ExpandProperty Path -Unique
$matchCount = ($results | Measure-Object).Count
$fileCount = ($uniqueFiles | Measure-Object).Count

if (-not $SummaryOnly) {
    $results | ForEach-Object {
        $path = $_.Path.Replace((Get-Location).Path + "\", "")
        Write-Host "[MATCH] $path`:$($_.LineNumber) -> $($_.Line.Trim())"
    }
}

Write-Host "`n>>> Summary" -ForegroundColor Gray
$results | Group-Object -Property { 
    $rel = $_.Path.Replace((Get-Location).Path + "\", "")
    $dir = [System.IO.Path]::GetDirectoryName($rel)
    if ([string]::IsNullOrEmpty($dir)) { "." } else { $dir }
} | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize

Write-Host "Found $matchCount matches across $fileCount files." -ForegroundColor Green

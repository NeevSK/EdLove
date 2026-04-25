param(
    [Parameter(Mandatory=$true)]
    [string]$Query,
    [string]$Target = ".",
    [switch]$IncludeNodeModules,
    [switch]$SummaryOnly,
    [switch]$Hybrid
)

Write-Host ">>> Shiny Discovering documentation and Configs for: $Query" -ForegroundColor Green

# 1. Hybrid Check: If it looks like a code pattern and hybrid is on, use Biome
if ($Hybrid -or ($Query -match "[\(\)\{\}\.]")) {
    Write-Host ">>> Using Biome for Structural Search..." -ForegroundColor Gray
    try {
        npx biome search $Query $Target
    } catch {
        Write-Host "Biome search failed, falling back to text search." -ForegroundColor Yellow
    }
}

# 2. Sequential Discovery Strategy using ripgrep
function Run-ShinyDiscovery($paths, $query, $currentExclude) {
    if ($paths.Count -eq 0) { return $null }
    
    $RgArgs = @("--line-number", "--column", "--smart-case", "--color=never")
    
    # Add path globs
    foreach ($p in $paths) {
        $RgArgs += "-g"
        $RgArgs += "$p"
    }

    # Add exclusions
    $ExcludePatterns = $currentExclude.Split(",").Trim() | Where-Object { $_ -ne "" }
    foreach ($pattern in $ExcludePatterns) {
        $RgArgs += "-g"
        $RgArgs += "!$pattern"
    }

    try {
        $results = & rg $RgArgs "$query" "$Target" 2>$null
        return $results
    } catch {
        return $null
    }
}

$excludeList = "dist,node_modules,.git,.turbo"
if ($IncludeNodeModules) { $excludeList = "dist,.git,.turbo" }

# Phase A: Search Docs
$DocGlobs = @("**/docs/**", "**/README.md")
$results = Run-ShinyDiscovery $DocGlobs $Query $excludeList

# Phase B: Escalation to Configs
if ($null -eq $results -or $results.Count -eq 0) {
    Write-Host "No direct matches in documentation. Escalating to configuration files..." -ForegroundColor Gray
    $ConfigGlobs = @("package.json", "**/package.json", "app.json", "**/app.json", "tsconfig.json", "**.yaml", "**.yml")
    $results = Run-ShinyDiscovery $ConfigGlobs $Query $excludeList
}

# Phase C: Deep Search (Codebase)
if ($null -eq $results -or $results.Count -eq 0) {
    Write-Host "No matches in configs. Performing deep codebase search..." -ForegroundColor Gray
    $CodeGlobs = @("**.ts", "**.tsx", "**.js", "**.jsx", "**.md", "**.json", "**.yaml", "**.yml")
    $results = Run-ShinyDiscovery $CodeGlobs $Query $excludeList
}

if ($null -eq $results -or $results.Count -eq 0) {
    Write-Host "No matches found across any documentation or source files."
    exit 0
}

# 3. Output and Summary
# rg output: path:line:col:text
if (-not $SummaryOnly) {
    foreach ($line in $results) {
        Write-Host "[MATCH] $line"
    }
}

Write-Host "`n>>> Summary: Grouped by location" -ForegroundColor Gray
$stats = @{}
foreach ($line in $results) {
    $parts = $line.Split(":")
    if ($parts.Count -ge 1) {
        $path = $parts[0]
        $dir = [System.IO.Path]::GetDirectoryName($path)
        if ([string]::IsNullOrEmpty($dir)) { $dir = "." }
        $stats[$dir] = ($stats[$dir] || 0) + 1
    }
}

$stats.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
    [PSCustomObject]@{
        Name  = $_.Key
        Count = $_.Value
    }
} | Format-Table -AutoSize

$totalMatches = ($results | Measure-Object).Count
Write-Host "Found $totalMatches matches." -ForegroundColor Green

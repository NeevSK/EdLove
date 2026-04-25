param(
    [Parameter(Mandatory=$true)]
    [string]$Query,
    [string]$Target = ".",
    [switch]$IsRegex,
    [string]$Include = "*",
    [string]$Exclude = "node_modules,dist,.turbo,.git,*.tsbuildinfo,obj,bin,.geo_archive",
    [switch]$IncludeNodeModules,
    [switch]$SummaryOnly
)

# 1. Parameter Normalization for rg
$RgArgs = @("--line-number", "--column", "--smart-case", "--color=never")

if (-not $IsRegex) {
    $RgArgs += "--fixed-strings"
}

if ($IncludeNodeModules) {
    # rg excludes node_modules by default, so we don't need to do much unless we want to FORCE it
} else {
    $RgArgs += "--exclude-node-modules" # Custom alias or just default behavior
}

# Process Exclusions
$ExcludePatterns = $Exclude.Split(",").Trim() | Where-Object { $_ -ne "" }
foreach ($pattern in $ExcludePatterns) {
    $RgArgs += "-g"
    $RgArgs += "!$pattern"
}

# Process Inclusions
if ($Include -ne "*") {
    $IncludePatterns = $Include.Split(",").Trim()
    foreach ($pattern in $IncludePatterns) {
        $RgArgs += "-g"
        $RgArgs += "$pattern"
    }
}

Write-Host ">>> Shiny Searching for: $Query in $Target" -ForegroundColor Cyan

try {
    # 2. Execute ripgrep
    $results = & rg $RgArgs "$Query" "$Target" 2>$null

    if ([string]::IsNullOrEmpty($results)) {
        Write-Host "No matches found."
        exit 0
    }

    # 3. Output Processing
    if (-not $SummaryOnly) {
        foreach ($line in $results) {
            Write-Host $line
        }
    }

    # 4. Summary Heatmap
    # rg output format: path:line:col:text
    Write-Host "`n>>> Summary: Grouped by location" -ForegroundColor Gray
    
    $stats = @{}
    foreach ($line in $results) {
        $parts = $line.Split(":")
        if ($parts.Count -ge 1) {
            $path = $parts[0]
            $dir = [System.IO.Path]::GetDirectoryName($path)
            if ([string]::IsNullOrEmpty($dir)) { $dir = "." }
            $stats[$dir]++
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
} catch {
    Write-Host "Error executing rg: $($_.Exception.Message)" -ForegroundColor Red
}


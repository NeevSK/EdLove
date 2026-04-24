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

# 1. Scope Normalization
if ($IncludeNodeModules) {
    $Exclude = $Exclude.Replace("node_modules,", "").Replace(",node_modules", "").Replace("node_modules", "")
}

$ExcludePatterns = $Exclude.Split(",").Trim() | Where-Object { $_ -ne "" }
$IncludePatterns = $Include.Split(",").Trim()

Write-Host ">>> Searching for: $Query in $Target" -ForegroundColor Cyan

try {
    # 2. Faster Enumeration and Filtering
    $excludeRegex = ($ExcludePatterns | ForEach-Object { [regex]::Escape($_) }) -join '|'
    
    $results = Get-ChildItem -Path $Target -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch $excludeRegex
    } | Where-Object {
        if ($Include -eq "*") { return $true }
        foreach ($inc in $IncludePatterns) {
            if ($_.FullName -like "*$inc") { return $true }
        }
        return $false
    } | Select-String -Pattern $Query -CaseSensitive:$false

    # 3. Output Processing
    if ($null -eq $results) {
        Write-Host "No matches found."
        exit 0
    }

    $uniqueFiles = $results | Select-Object -ExpandProperty Path -Unique
    $matchCount = ($results | Measure-Object).Count
    $fileCount = ($uniqueFiles | Measure-Object).Count

    if (-not $SummaryOnly) {
        $results | ForEach-Object {
            $relPath = $_.Path.Replace((Get-Location).Path + "\", "")
            Write-Host "$relPath`:$($_.LineNumber)`:$($_.Line.Trim())"
        }
    }

    # 4. Summary Heatmap
    Write-Host "`n>>> Summary: Grouped by location" -ForegroundColor Gray
    $results | Group-Object -Property { 
        $rel = $_.Path.Replace((Get-Location).Path + "\", "")
        $dir = [System.IO.Path]::GetDirectoryName($rel)
        if ([string]::IsNullOrEmpty($dir)) { "." } else { $dir }
    } | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize

    Write-Host "Found $matchCount matches across $fileCount files." -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

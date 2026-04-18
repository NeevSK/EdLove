param(
    [Parameter(Mandatory=$false, Position=0)]
    [string]$Target = "core",
    
    [Parameter(Mandatory=$false)]
    [switch]$AllFiles = $false,

    [Parameter(Mandatory=$false)]
    [switch]$LocalOnly = $false
)

# Force UTF8 for the session
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = Get-Location
$targetPath = ""
$targetName = ""

# 1. Resolve Target Path
$cleanTarget = $Target -replace '^@repo/|^@app/', ''

if (Test-Path -Path $Target) {
    $targetPath = (Get-Item $Target).FullName
    $targetName = (Get-Item $Target).BaseName
} elseif (Test-Path -Path "packages/$cleanTarget") {
    $targetPath = (Get-Item "packages/$cleanTarget").FullName
    $targetName = $cleanTarget
} elseif (Test-Path -Path "apps/$cleanTarget") {
    $targetPath = (Get-Item "apps/$cleanTarget").FullName
    $targetName = $cleanTarget
} else {
    Write-Host ">>> Error: Could not find target '$Target' or '$cleanTarget'." -ForegroundColor Red
    exit 1
}

$logFile = Join-Path $rootDir "audit-$targetName.log"
$summaryFile = Join-Path $rootDir "audit-$targetName-summary.txt"

Write-Host ">>> Auditing errors in $targetName ($targetPath)..." -ForegroundColor Cyan
if ($LocalOnly) { Write-Host ">>> MODE: Local-Only (Filtering out shared/external errors)" -ForegroundColor Yellow }

if (Test-Path -Path $logFile) { Remove-Item -Path $logFile }

# 2. Run TSC
Set-Location -Path $targetPath
# Force UTF8 environment for the sub-command
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$tscCmd = "pnpm exec tsc --noEmit --pretty false"
Write-Host ">>> Running: $tscCmd" -ForegroundColor Gray

# Execute and capture
if ($IsWindows) {
    # Use powershell to ensure encoding is handled correctly during capture
    powershell -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $tscCmd" 2>&1 | Out-File -FilePath "$logFile" -Encoding utf8
} else {
    Invoke-Expression "$tscCmd 2>&1" | Out-File -FilePath "$logFile" -Encoding utf8
}
Set-Location -Path $rootDir

# 3. Parse log file
if (Test-Path -Path $logFile) {
    $content = Get-Content -Path $logFile -Encoding utf8
    $fileData = @{}
    $globalErrors = 0
    $filteredErrors = 0
    
    $currentError = $null
    
    foreach ($line in $content) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        
        $file = "Global"
        $lineN = "0"
        $code = ""
        $msg = ""
        $isMatch = $false

        # Pattern 1: File(L,C) or File:L:C
        if ($line -match "^(.*?)(?:\(|\:)(\d+)(?:[\, \:]+(\d+))?[\)\s\-\:]*\s+(error|warning)\s+TS(\d+):\s*(.*)$") {
            $file = $Matches[1].Trim()
            $lineN = $Matches[2]
            $code = $Matches[5]
            $msg = $Matches[6]
            $isMatch = $true
        } 
        # Pattern 2: Global errors (no line number)
        elseif ($line -match "^\s*(error|warning)\s+TS(\d+):\s*(.*)$") {
            $file = "Project Scope"
            $lineN = "0"
            $code = $Matches[2]
            $msg = $Matches[3]
            $isMatch = $true
        }

        if ($isMatch) {
            $isExcluded = $false
            $cleanFile = $file
            if ($file -ne "Project Scope") {
                # If path contains 'node_modules' or starts with '../' it's external
                if ($file -match "node_modules" -or $file -match "^\.\./") {
                    $isExcluded = $true
                }
                $cleanFile = $file.Replace($targetPath, "").TrimStart("\").TrimStart("/")
            }
            
            if ($LocalOnly -and $isExcluded) {
                $filteredErrors++
                $currentError = $null
                continue 
            }

            if (-not $fileData.ContainsKey($cleanFile)) {
                $fileData[$cleanFile] = @{ Errors = @(); Codes = @{} }
            }
            
            $currentError = @{
                Line = $lineN
                Col = if ($Matches[3]) { $Matches[3] } else { "0" }
                Code = $code
                Message = $msg
                Context = @()
            }
            $fileData[$cleanFile].Errors += $currentError
            if (-not $fileData[$cleanFile].Codes.ContainsKey($code)) { $fileData[$cleanFile].Codes[$code] = 0 }
            $fileData[$cleanFile].Codes[$code]++
            $globalErrors++
        } elseif ($line -match "^\s+(.*)$" -and $currentError) {
            $currentError.Context += $Matches[1].Trim()
        }
    }
    
    $report = @()
    $report += "========================================================"
    $report += "SURGICAL ERROR ANALYSIS: $targetName $(if($LocalOnly){'[LOCAL ONLY]'})"
    $report += "========================================================"
    $report += "Timestamp: $((Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))"
    $report += "Target:    $targetPath"
    if ($LocalOnly) {
        $report += "Filtered:  $filteredErrors errors in external packages hidden"
    }
    $report += "Total:     $globalErrors Errors $(if($LocalOnly){'in local scope'})"
    $report += "========================================================"
    $report += ""

    if ($globalErrors -eq 0) {
        $report += "✅ ZERO LOCAL ERRORS FOUND. Workspace is surgically clean."
    } else {
        $sortedFiles = $fileData.Keys | Sort-Object { $fileData[$_].Errors.Count } -Descending
        foreach ($f in $sortedFiles) {
            $data = $fileData[$f]
            $report += "FILE: $f"
            $report += "COUNT: $($data.Errors.Count) errors"
            
            $codes = @()
            foreach ($c in $data.Codes.Keys) { $codes += "TS$c ($($data.Codes[$c])x)" }
            $report += "CATEGORIES: $($codes -join ', ')"
            
            $report += "LOCATIONS:"
            foreach ($err in $data.Errors) {
                $location = "[Line $($err.Line), Col $($err.Col)]"
                $report += "  $($location.PadRight(20)) TS$($err.Code): $($err.Message)"
                foreach ($ctx in $err.Context) {
                    $report += "    > $ctx"
                }
            }
            $report += "--------------------------------------------------------"
            $report += ""
        }
    }

    # Determine optimal report location (Order vs convenience)
    $summaryFile = "audit-$targetName-summary.txt"
    $reportsDir = Join-Path $rootDir "reports"
    $summaryPath = if (Test-Path $reportsDir) { Join-Path $reportsDir $summaryFile } else { Join-Path $rootDir $summaryFile }

    $report | Out-File -FilePath $summaryPath -Encoding utf8 -Force
    Write-Host "`n>>> Full Surgical Analysis Complete." -ForegroundColor Cyan
    Write-Host ">>> Total Local Errors: $globalErrors" -ForegroundColor $(if($globalErrors -gt 0){'Red'}else{'Green'})
    if ($LocalOnly) { Write-Host ">>> Filtered Out: $filteredErrors Shared Errors" -ForegroundColor Gray }
    Write-Host ">>> Report saved: $summaryPath" -ForegroundColor Yellow
}

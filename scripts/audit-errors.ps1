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
$summaryFile = Join-Path $rootDir "audit-$targetName-summary.md"

Write-Host ">>> Auditing errors in $targetName ($targetPath)..." -ForegroundColor Cyan
if ($LocalOnly) { Write-Host ">>> MODE: Local-Only (Filtering out shared/external errors)" -ForegroundColor Yellow }

if (Test-Path -Path $logFile) { Remove-Item -Path $logFile }

# 2. Run TSC
Set-Location -Path $targetPath
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$tscCmd = "pnpm exec tsc --noEmit --pretty false"
Write-Host ">>> Running: $tscCmd" -ForegroundColor Gray

# Execute and capture
if ($IsWindows) {
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

        if ($line -match "^(.*?)(?:\(|\:)(\d+)(?:[\, \:]+(\d+))?[\)\s\-\:]*\s+(error|warning)\s+TS(\d+):\s*(.*)$") {
            $file = $Matches[1].Trim()
            $lineN = $Matches[2]
            $code = $Matches[5]
            $msg = $Matches[6]
            $isMatch = $true
        } 
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
    
    $Report = @()
    $Report += "# Sovereign Surgical Error Analysis: " + $targetName
    if ($LocalOnly) { $Report += "> **Mode:** Local Only Filtering" }
    $Report += ""
    $Report += "> **Timestamp:** " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    $Report += "> **Target:** " + $targetPath
    if ($LocalOnly) {
        $Report += "> **Filtered:** " + $filteredErrors + " external errors hidden"
    }
    $Report += "> **Total Errors:** " + $globalErrors
    $Report += ""

    if ($globalErrors -eq 0) {
        $Report += "## SUCCESS"
        $Report += "ZERO local errors found. The codebase is surgically clean."
    } else {
        $Report += "## Executive Summary"
        $Report += ""
        $Report += "| File Path | Errors | Common Codes |"
        $Report += "| :--- | :---: | :--- |"
        
        $sortedFiles = $fileData.Keys | Sort-Object { $fileData[$_].Errors.Count } -Descending
        foreach ($f in $sortedFiles) {
            $data = $fileData[$f]
            $codesList = @()
            foreach ($c in $data.Codes.Keys) { $codesList += "TS$c" }
            $codesStr = $codesList -join ', '
            $errCount = $data.Errors.Count
            $Report += "| $f | $errCount | $codesStr |"
        }
        $Report += ""

        $Report += "## Error Distribution"
        $Report += ""
        $allCodes = @{}
        foreach ($f in $fileData.Keys) {
            foreach ($c in $fileData[$f].Codes.Keys) {
                if (-not $allCodes.ContainsKey($c)) { $allCodes[$c] = 0 }
                $allCodes[$c] += $fileData[$f].Codes[$c]
            }
        }
        $Report += "| Code | Count | Description (Heuristic) |"
        $Report += "| :--- | :---: | :--- |"
        foreach ($c in ($allCodes.Keys | Sort-Object { $allCodes[$_] } -Descending)) {
            $exampleMsg = ""
            foreach($f in $fileData.Keys) {
                foreach($e in $fileData[$f].Errors) {
                    if($e.Code -eq $c) { $exampleMsg = $e.Message; break }
                }
                if($exampleMsg) { break }
            }
            $shortMsg = $exampleMsg
            if($exampleMsg.Length -gt 60) { $shortMsg = $exampleMsg.Substring(0, 57) + '...' }
            $cCount = $allCodes[$c]
            $Report += "| TS$c | $cCount | $shortMsg |"
        }
        $Report += ""

        $Report += "## Detailed Findings"
        $Report += ""
        foreach ($f in $sortedFiles) {
            $data = $fileData[$f]
            $Report += "### File: " + $f
            $Report += "Total errors in file: " + $data.Errors.Count
            $Report += ""
            foreach ($err in $data.Errors) {
                $Report += "- [ ] **Line " + $err.Line + ", Col " + $err.Col + "** | TS" + $err.Code
                $Report += "  > " + $err.Message
                foreach ($ctx in $err.Context) {
                    $Report += "  > * " + $ctx
                }
            }
            $Report += ""
            $Report += "---"
        }
    }

    $reportsDir = Join-Path $rootDir "reports"
    if (-not (Test-Path $reportsDir)) { New-Item -ItemType Directory -Path $reportsDir | Out-Null }
    $summaryPath = Join-Path $reportsDir ("audit-" + $targetName + "-summary.md")

    $Report | Out-File -FilePath "$summaryPath" -Encoding utf8 -Force
    Write-Host "`n>>> Full Surgical Analysis Complete." -ForegroundColor Cyan
    Write-Host (">>> Total Local Errors: " + $globalErrors) -ForegroundColor $(if($globalErrors -gt 0){'Red'}else{'Green'})
    if ($LocalOnly) { Write-Host (">>> Filtered Out: " + $filteredErrors + " Shared Errors") -ForegroundColor Gray }
    Write-Host (">>> Report saved: " + $summaryPath) -ForegroundColor Yellow
}

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Cmd,
    
    [Parameter(Mandatory=$false)]
    [string]$Name,
    
    [Parameter(Mandatory=$false)]
    [string]$Cwd = "."
)

# Force UTF8 for the session
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Continue'

# Resolve working directory
$originalLocation = Get-Location
$resolvedCwd = (Resolve-Path -Path $Cwd).Path
Set-Location -Path $resolvedCwd

# Generate clean name from command if not provided
if ([string]::IsNullOrWhiteSpace($Name)) {
    $Name = $Cmd -replace '[^a-zA-Z0-9_\-]', '_'
    if ($Name.Length -gt 50) {
        $Name = $Name.Substring(0, 50)
    }
    $Name = $Name.Trim('_')
}

$reportsDir = Join-Path $originalLocation.Path "reports"
if (-not (Test-Path -Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir -Force | Out-Null
}

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$logFile = Join-Path $reportsDir "run-$Name-$timestamp.log"
$reportFile = Join-Path $reportsDir "run-$Name-$timestamp-report.txt"

$StartTime = Get-Date
$Separator = '--------------------------------------------------------------------------------'

Write-Host ">>> Starting Process: $StartTime" -ForegroundColor Cyan
Write-Host ">>> Command: $Cmd" -ForegroundColor Cyan
Write-Host ">>> Working Dir: $resolvedCwd" -ForegroundColor Cyan
Write-Host ">>> Log output: $logFile" -ForegroundColor Cyan
Write-Host $Separator -ForegroundColor Gray

# Execute command and capture output while streaming to console
$ExitCode = 0
$RawLines = New-Object System.Collections.Generic.List[string]

# Increase node heap limit if running node commands
$env:NODE_OPTIONS = "--max-old-space-size=4096"

try {
    $sb = [scriptblock]::Create($Cmd)
    & $sb 2>&1 | ForEach-Object {
        $line = $_.ToString()
        Write-Host $line
        $RawLines.Add($line)
    }
    $ExitCode = $LASTEXITCODE
} catch {
    Write-Host "!!! Execution Error: $_" -ForegroundColor Red
    $ExitCode = 1
    $RawLines.Add("ERROR: $_")
}

# Write raw log immediately as UTF8
$RawLines | Out-File -FilePath $logFile -Encoding utf8 -Force

Write-Host $Separator -ForegroundColor Gray
Write-Host ">>> Capture complete. Exit Code: $ExitCode. Generating Report..." -ForegroundColor Cyan

# Parse logs for issues
$Findings = @()
$currentError = $null

foreach ($line in $RawLines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    $file = $null
    $lineN = "1"
    $col = "1"
    $code = ""
    $msg = ""
    $severity = "error"
    $isMatch = $false

    # 1. Match TypeScript standard format: path/to/file.ts(line,col): error TSXXXX: message
    if ($line -match "^(.*?)(?:\(|\:)(\d+)(?:[\, \:]+(\d+))?[\)\s\-\:]*\s+(error|warning)\s+TS(\d+):\s*(.*)$") {
        $file = $Matches[1].Trim()
        $lineN = $Matches[2]
        $col = if ($Matches[3]) { $Matches[3] } else { "1" }
        $severity = $Matches[4]
        $code = "TS" + $Matches[5]
        $msg = $Matches[6]
        $isMatch = $true
    }
    # 2. Match Biome/ESLint or common output (e.g. "path/to/file.ts:10:15 - error: message" or similar)
    elseif ($line -match "^(.*?\.[a-zA-Z0-9]+)[\:\s]+(\d+)[\:\s]+(\d+)[\s\-]+(error|warning|info)[\:\s]+(.*)$") {
        $file = $Matches[1].Trim()
        $lineN = $Matches[2]
        $col = $Matches[3]
        $severity = $Matches[4]
        $code = "LINT"
        $msg = $Matches[5]
        $isMatch = $true
    }
    # 3. Match generic "Error: message" or similar failure lines
    elseif ($line -match "(?i)(error|failed|exception|err_)\s*:\s*(.*)$") {
        $severity = "error"
        $code = "GENERIC"
        $msg = $Matches[2]
        $isMatch = $true
    }

    if ($isMatch) {
        $cleanFile = $file
        $fileUrl = $null
        
        if ($file) {
            # Try to resolve path
            $absPath = $null
            if (Test-Path -Path $file) {
                $absPath = (Get-Item $file).FullName
            } else {
                $checkPath = Join-Path $resolvedCwd $file
                if (Test-Path -Path $checkPath) {
                    $absPath = (Get-Item $checkPath).FullName
                }
            }
            if ($absPath) {
                $cleanFile = $absPath.Replace($originalLocation.Path, "").TrimStart("\").TrimStart("/")
                # Convert backslashes to forward slashes for URLs
                $normalizedAbsPath = $absPath.Replace('\', '/')
                $fileUrl = "file:///$normalizedAbsPath"
            }
        }

        $currentError = @{
            File = $cleanFile
            FileUrl = $fileUrl
            Line = $lineN
            Col = $col
            Code = $code
            Severity = $severity
            Message = $msg
            Context = @()
        }
        $Findings += $currentError
    } elseif ($line -match "^\s+(.*)$" -and $currentError) {
        $currentError.Context += $Matches[1].Trim()
    }
}

# Restore location
Set-Location -Path $originalLocation

# Build Token-Efficient Text Report
$Report = @()
$Report += "================================================================================"
$Report += "COMMAND EXECUTION REPORT: $Name"
$Report += "================================================================================"
$Report += ""

$EndTime = Get-Date
$Duration = $EndTime - $StartTime
$DurationSec = [Math]::Round($Duration.TotalSeconds, 1)

# Status header
if ($ExitCode -eq 0 -and $Findings.Count -eq 0) {
    $Report += "STATUS: SUCCESS"
} elseif ($ExitCode -eq 0) {
    $Report += "STATUS: COMPLETED WITH WARNINGS/ISSUES"
} else {
    $Report += "STATUS: FAILED (Exit Code: $ExitCode)"
}

$Report += "Command:  $Cmd"
$Report += "Dir:      $Cwd"
$Report += "Time:     $($StartTime.ToString('yyyy-MM-dd HH:mm:ss'))"
$Report += "Duration: $DurationSec s"
$Report += "Raw Log:  file:///$($logFile.Replace('\', '/'))"
$Report += ""

# Analytics & Insights
$errorsCount = ($Findings | Where-Object { $_.Severity -eq 'error' }).Count
$warningsCount = ($Findings | Where-Object { $_.Severity -ne 'error' }).Count

$Report += "--- METRICS ---"
$Report += "Total Findings: $($Findings.Count)"
$Report += "Errors:         $errorsCount"
$Report += "Warnings:       $warningsCount"
$Report += ""

if ($Findings.Count -gt 0) {
    # 1. Top offending files
    $fileGroups = @{}
    foreach ($item in $Findings) {
        if ($item.File) {
            if (-not $fileGroups.ContainsKey($item.File)) { $fileGroups[$item.File] = 0 }
            $fileGroups[$item.File]++
        }
    }
    
    if ($fileGroups.Count -gt 0) {
        $Report += "--- TOP OFFENDING FILES ---"
        $sortedFiles = $fileGroups.Keys | Sort-Object { $fileGroups[$_] } -Descending | Select-Object -First 5
        foreach ($f in $sortedFiles) {
            $item = $Findings | Where-Object { $_.File -eq $f } | Select-Object -First 1
            $link = if ($item.FileUrl) { "$($item.FileUrl)" } else { $f }
            $Report += "* $link : $($fileGroups[$f]) issues"
        }
        $Report += ""
    }

    # 2. Actionable Recommendations
    $Report += "--- RECOMMENDATIONS ---"
    if ($errorsCount -gt 0) {
        $Report += "* Action Required: Fix the $errorsCount errors shown below to unblock build."
    }
    
    $codes = @{}
    foreach ($item in $Findings) {
        if ($item.Code) {
            if (-not $codes.ContainsKey($item.Code)) { $codes[$item.Code] = 0 }
            $codes[$item.Code]++
        }
    }
    $topCode = $codes.Keys | Sort-Object { $codes[$_] } -Descending | Select-Object -First 1
    if ($topCode) {
        $Report += "* Focus Area: The most frequent issue code is $topCode ($($codes[$topCode]) times)."
    }
    $Report += "* Tip: Open the clickable file URLs below to jump directly to the code in your editor."
    $Report += ""
    
    # 3. Detailed Findings List
    $Report += "--- DETAILED FINDINGS ---"
    $index = 1
    foreach ($item in $Findings) {
        $locStr = ""
        if ($item.File) {
            if ($item.FileUrl) {
                $locStr = "$($item.FileUrl)#L$($item.Line)"
            } else {
                $locStr = "$($item.File) at line $($item.Line)"
            }
        }
        
        $sevStr = if ($item.Severity -eq 'error') { "[ERROR]" } else { "[WARN]" }
        $codeStr = if ($item.Code) { "($($item.Code))" } else { "" }
        
        $Report += "$sevStr $codeStr $locStr : $($item.Message)"
        foreach ($ctx in $item.Context) {
            $Report += "  | $ctx"
        }
        $index++
    }
} else {
    $Report += "--- RECOMMENDATIONS ---"
    $Report += "* No actions required: Code is clean."
}

$Report += ""
$Report += "================================================================================"

# Output report to file
$Report | Out-File -FilePath $reportFile -Encoding utf8 -Force

# Print simple summary
Write-Host ""
Write-Host $Separator -ForegroundColor Gray
Write-Host "REPORT SUMMARY" -ForegroundColor Yellow
Write-Host "Duration: $DurationSec seconds"
Write-Host "Findings: $($Findings.Count) (Errors: $errorsCount, Warnings: $warningsCount)"
Write-Host "Raw Log:  $logFile" -ForegroundColor Green
Write-Host "Report:   $reportFile" -ForegroundColor Yellow
Write-Host $Separator -ForegroundColor Gray

exit $ExitCode

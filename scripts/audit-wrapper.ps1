param(
    [Parameter(Mandatory=$true)]
    [string]$Cmd,
    
    [Parameter(Mandatory=$false)]
    [string]$Log = 'reports/audit-summary.md'
)

# Robust PowerShell Audit Wrapper
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$StartTime = Get-Date
$Separator = '--------------------------------------------------------------------------------'

Write-Host ">>> Starting Audit: $StartTime" -ForegroundColor Cyan
Write-Host ">>> Command: $Cmd" -ForegroundColor Cyan
Write-Host $Separator -ForegroundColor Gray

# Ensure log directory exists
$LogDir = Split-Path -Path $Log -Parent
if ($LogDir -and !(Test-Path -Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# Execute command and capture output while streaming to console
$ExitCode = 0
$RawLines = New-Object System.Collections.Generic.List[string]

try {
    # Execute and stream
    # Using scriptblock to handle complex commands better
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

# Categorization Logic
$Findings = @()
foreach ($line in $RawLines) {
    if ($line -match 'warn|error|TS\d+') {
        $Findings += $line
    }
}

$Groups = @{}
foreach ($item in $Findings) {
    $category = 'General'
    if ($item -match '((?:apps|packages)/[^/]+)') {
        $category = $Matches[1]
    }
    if (-not $Groups.ContainsKey($category)) { $Groups[$category] = @() }
    $Groups[$category] += $item
}

# Construct Report (Array of strings to avoid interpolation traps)
$Report = @()
$Report += '# Sovereign Monorepo Hygiene Audit Report'
$Report += ''
$Report += '> **Generated:** ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
$Report += '> **Command:** ' + $Cmd
$Report += ''
$Report += '## Executive Summary'
$Report += ''
$Report += '| Category | Findings |'
$Report += '| :--- | :---: |'

$SortedCategories = $Groups.Keys | Sort-Object
if ($SortedCategories.Count -gt 0) {
    foreach ($cat in $SortedCategories) {
        $count = $Groups[$cat].Count
        $Report += "| $cat | $count |"
    }
} else {
    $Report += '| All Categories | 0 Findings |'
}
$Report += ''

$Report += '## Detailed Findings'
$Report += ''
if ($SortedCategories.Count -gt 0) {
    foreach ($cat in $SortedCategories) {
        $Report += "### Category: $cat"
        foreach ($line in $Groups[$cat]) {
            $Report += "- $line"
        }
        $Report += ''
    }
} else {
    $Report += 'No findings identified.'
}

$Report += ''
$Report += '## Raw Output'
$Report += '```text'
foreach ($line in $RawLines) { $Report += $line }
$Report += '```'

# Finalizing
$Report | Out-File -FilePath $Log -Encoding utf8 -Force

$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-Host ''
Write-Host $Separator -ForegroundColor Gray
Write-Host 'AUDIT SUMMARY' -ForegroundColor Yellow
Write-Host ("Duration: {0}m {1}s" -f $Duration.Minutes, $Duration.Seconds)
Write-Host ("Findings: {0}" -f $Findings.Count)
Write-Host ("Log File: {0}" -f $Log)
Write-Host $Separator -ForegroundColor Gray

exit $ExitCode

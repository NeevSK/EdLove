param(
    [Parameter(Mandatory=$true)]
    [string]$Cmd,
    
    [Parameter(Mandatory=$false)]
    [string]$Log = "reports/audit-summary.txt",
    
    [Parameter(Mandatory=$false)]
    [string]$Cwd = "."
)

# Time stamping
$startTime = Get-Date
$logDir = [System.IO.Path]::GetDirectoryName($Log)
if (![string]::IsNullOrWhiteSpace($logDir) -and !(Test-Path -Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

Write-Host "`n>>> Starting Audit: $startTime" -ForegroundColor Cyan
Write-Host ">>> Command: $Cmd" -ForegroundColor Cyan

# Execute command and capture output
$exitCode = 0
$rawOutput = ""

try {
    # Execute in a script block to capture output reliably
    $rawOutput = Invoke-Expression $Cmd 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
} catch {
    Write-Host "Error executing command: $_" -ForegroundColor Red
    $exitCode = 1
    $rawOutput = "ERROR: $_"
}

# Advanced Categorization Logic
$lines = $rawOutput -split "`r?`n" | Where-Object { ![string]::IsNullOrWhiteSpace($_) }
$findings = $lines | Where-Object { $_ -match "warn|error|TS\d+|❌|⚠️" }

$summary = @{}
$groupedFindings = $findings | ForEach-Object {
    if ($_ -match "((?:apps|packages)/[^/]+)/(.*)") {
        $category = $matches[1]
        $file = $matches[2]
        [PSCustomObject]@{
            Category = $category
            File     = $file
            Line     = $_
        }
    } else {
        [PSCustomObject]@{
            Category = "General / Root"
            File     = "Global"
            Line     = $_
        }
    }
} 

if ($groupedFindings) {
    $groups = $groupedFindings | Group-Object Category
} else {
    $groups = @()
}

# Construct Report Header
$reportHeader = @"
================================================================================
MONOREPO HYGIENE AUDIT REPORT
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Command:   $Cmd
================================================================================

SUMMARY BY CATEGORY:
--------------------------------------------------------------------------------
"@

if ($groups.Count -gt 0) {
    foreach ($group in $groups | Sort-Object Name) {
        $reportHeader += "`n[$($group.Name)]: $($group.Count) findings"
    }
} else {
    $reportHeader += "`nNo critical findings identified."
}

$reportHeader += "`n--------------------------------------------------------------------------------`n"

# Final Output Construction
$finalContent = $reportHeader + "`nDETAILED FINDINGS:`n" + "--------------------------------------------------------------------------------`n" + $rawOutput

# Write to Log
$finalContent | Out-File -FilePath $Log -Encoding utf8 -Force

# Calculate Duration
$endTime = Get-Date
$duration = $endTime - $startTime

# Console Output (Summary)
Write-Host "`n----------------------------------------" -ForegroundColor Gray
Write-Host "AUDIT SUMMARY" -ForegroundColor Yellow
Write-Host "Duration: $($duration.Minutes)m $($duration.Seconds)s"
Write-Host "Status:   $(if($exitCode -eq 0 -and $findings.Count -eq 0){'SUCCESS'}else{'FAILED'})" -ForegroundColor $(if($exitCode -eq 0 -and $findings.Count -eq 0){'Green'}else{'Red'})
Write-Host "Findings: $($findings.Count)" -ForegroundColor $(if($findings.Count -gt 0){'Yellow'}else{'White'})
Write-Host "Log File: $Log"
Write-Host "----------------------------------------`n" -ForegroundColor Gray

exit $exitCode

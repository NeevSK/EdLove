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

# Execute command and capture output to log and console
# We use a script block to ensure we can capture the exit code of the ACTUAL command
$scriptBlock = {
    param($c, $l)
    # We use a subshell and redirect to ensure we can control encoding reliably
    # The default redirected output in many PS versions is UTF-16LE, we force UTF8
    Invoke-Expression $c 2>&1 | Out-File -FilePath $l -Encoding utf8 -Force
    return $LASTEXITCODE
}

$exitCode = & $scriptBlock $Cmd $Log

# Calculate Duration
$endTime = Get-Date
$duration = $endTime - $startTime

# Parse Statistics from Log
$errors = 0
$warnings = 0
if (Test-Path $Log) {
    $content = Get-Content $Log
    $errors = ($content | Select-String -Pattern "error TS|Error:|(line \d+, col \d+): error|❌|Found \d+ errors\." -AllMatches).Matches.Count
    $warnings = ($content | Select-String -Pattern "warning TS|Warning:|⚠️|Found \d+ warnings\." -AllMatches).Matches.Count
}

# Summary Report
Write-Host "`n----------------------------------------" -ForegroundColor Gray
Write-Host "AUDIT SUMMARY" -ForegroundColor Yellow
Write-Host "Duration: $($duration.Minutes)m $($duration.Seconds)s"
Write-Host "Status:   $(if($exitCode -eq 0){'SUCCESS'}else{'FAILED'})" -ForegroundColor $(if($exitCode -eq 0){'Green'}else{'Red'})
Write-Host "Errors:   $errors" -ForegroundColor $(if($errors -gt 0){'Red'}else{'White'})
Write-Host "Warnings: $warnings" -ForegroundColor $(if($warnings -gt 0){'Yellow'}else{'White'})
Write-Host "Finished: $endTime"
Write-Host "Log File: $Log"
Write-Host "----------------------------------------`n" -ForegroundColor Gray

exit $exitCode

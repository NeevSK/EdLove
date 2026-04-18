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
    # Ensure we use UTF-8 when reading the log
    $content = Get-Content -Path $Log -Encoding utf8
    
    # Filter out the "Found X errors." summary line to avoid double-counting
    $errorLines = $content | Where-Object { $_ -match "error TS|Error:|(line \d+, col \d+): error|❌" -and $_ -notmatch "Found \d+ errors" }
    $errors = ($errorLines | Measure-Object).Count
    
    $warningLines = $content | Where-Object { $_ -match "warning TS|Warning:|⚠️" -and $_ -notmatch "Found \d+ warnings" }
    $warnings = ($warningLines | Measure-Object).Count
}

# Summary Report
Write-Host "`n----------------------------------------" -ForegroundColor Gray
Write-Host "AUDIT SUMMARY" -ForegroundColor Yellow
Write-Host "Duration: $($duration.Minutes)m $($duration.Seconds)s"
Write-Host "Status:   $(if($exitCode -eq 0 -and $errors -eq 0){'SUCCESS'}else{'FAILED'})" -ForegroundColor $(if($exitCode -eq 0 -and $errors -eq 0){'Green'}else{'Red'})

if ($errors -gt 0) {
    Write-Host "Errors:   $errors" -ForegroundColor Red
    Write-Host "Top Errors:" -ForegroundColor Gray
    $errorLines | Select-Object -First 5 | ForEach-Object { Write-Host "  $($_.Trim())" -ForegroundColor White }
    if ($errors -gt 5) { Write-Host "  ... and $($errors - 5) more" -ForegroundColor Gray }
} else {
    Write-Host "Errors:   0" -ForegroundColor White
}

Write-Host "Warnings: $warnings" -ForegroundColor $(if($warnings -gt 0){'Yellow'}else{'White'})
Write-Host "Finished: $endTime"
Write-Host "Log File: $Log"
Write-Host "----------------------------------------`n" -ForegroundColor Gray

exit $exitCode

param(
    [Parameter(Mandatory=$false, Position=0)]
    [string]$Target = "core",
    
    [Parameter(Mandatory=$false)]
    [switch]$AllFiles = $false
)

# Force UTF8 for the session
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = Get-Location
$targetPath = ""
$targetName = ""

# 1. Resolve Target Path
if (Test-Path -Path $Target) {
    $targetPath = (Get-Item $Target).FullName
    $targetName = (Get-Item $Target).BaseName
} elseif (Test-Path -Path "packages/$Target") {
    $targetPath = (Get-Item "packages/$Target").FullName
    $targetName = $Target
} elseif (Test-Path -Path "apps/$Target") {
    $targetPath = (Get-Item "apps/$Target").FullName
    $targetName = $Target
} else {
    Write-Host ">>> Error: Could not find target '$Target'." -ForegroundColor Red
    exit 1
}

$logFile = Join-Path $rootDir "audit-$targetName.log"
$summaryFile = Join-Path $rootDir "audit-$targetName-summary.txt"

Write-Host ">>> Auditing errors in $targetName ($targetPath)..." -ForegroundColor Cyan

if (Test-Path -Path $logFile) { Remove-Item -Path $logFile }

# 2. Run TSC
Set-Location -Path $targetPath
pnpm exec tsc --noEmit --pretty false 2>&1 | Out-File -FilePath "$logFile" -Encoding utf8
Set-Location -Path $rootDir

# 3. Parse log file
if (Test-Path -Path $logFile) {
    $content = Get-Content -Path $logFile -Encoding utf8
    $fileData = @{}
    $globalErrors = 0
    
    $currentError = $null
    
    foreach ($line in $content) {
        # Flexible Regex: handles file(L,C) and file:L:C and varying delimiters
        if ($line -match "^(.*?)(?:\(|\:)(\d+)(?:[\, \:]+(\d+))?[\)\s\-\:]*\s*(error|warning)\s+TS(\d+):\s*(.*)$") {
            $file = $Matches[1].Trim()
            $lineN = $Matches[2]
            $code = $Matches[5]
            $msg = $Matches[6]
            
            $cleanFile = $file.Replace($targetPath, "").TrimStart("\").TrimStart("/")
            
            if (-not $fileData.ContainsKey($cleanFile)) {
                $fileData[$cleanFile] = @{ Errors = @(); Codes = @{} }
            }
            
            $currentError = @{
                Line = $lineN
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
    $report += ">>> Error Diagnostic Audit Summary for $targetName"
    $report += ">>> Target Path: $targetPath"
    $report += ">>> Generated at: $((Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))"
    $report += ">>> Stats: $globalErrors Errors found"
    $report += "--------------------------------------------------------"

    if ($globalErrors -eq 0) {
        $report += "No parseable issues found."
    } else {
        $sortedFiles = $fileData.Keys | Sort-Object { $fileData[$_].Errors.Count } -Descending
        foreach ($f in $sortedFiles) {
            $data = $fileData[$f]
            $report += "[$($data.Errors.Count) issues] $f"
            
            $codes = @()
            foreach ($c in $data.Codes.Keys) { $codes += "TS$c ($($data.Codes[$c])x)" }
            $report += "  > Codes: $($codes -join ', ')"
            
            # Show top diagnosis
            if ($data.Errors.Count -gt 0) {
                $err = $data.Errors[0]
                $report += "  > Diagnosis: $($err.Message)"
            }
            $report += ""
        }
    }

    $report | Out-File -FilePath $summaryFile -Encoding utf8 -Force
    Write-Host ">>> Final Audit Complete. $globalErrors issues found." -ForegroundColor Cyan
    Write-Host ">>> Summary saved to: $summaryFile" -ForegroundColor Yellow
}

# Sovereign Memory Sink Auditor (2026)
$ErrorActionPreference = "Continue" # Ignore path errors
$AuditReport = "reports/memory-sinks.txt"
if (!(Test-Path "reports")) { New-Item -ItemType Directory "reports" }

Write-Host ">>> Starting Sovereign Memory Sink Audit <<<"

$Findings = @()
$LeakyPatterns = @("setInterval", "setTimeout", "addEventListener", "subscribe", "onAuthStateChange")

# Get files but specifically avoid node_modules by not even descending into them
$Files = Get-ChildItem -Path "packages", "apps" -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach ($File in $Files) {
    try {
        $Content = [System.IO.File]::ReadAllText($File.FullName)
        $Matches = [regex]::Matches($Content, 'useEffect\(\(\) => \{([\s\S]*?)\},')
        
        foreach ($Match in $Matches) {
            $Body = $Match.Groups[1].Value
            foreach ($Pattern in $LeakyPatterns) {
                if ($Body.Contains($Pattern) -and -not $Body.Contains("return")) {
                    $LineNumber = ($Content.Substring(0, $Match.Index).Split("`n").Length)
                    $Findings += [PSCustomObject]@{
                        File    = $File.FullName.Replace($(Get-Location).Path, ".")
                        Line    = $LineNumber
                        Pattern = $Pattern
                    }
                    break
                }
            }
        }
    } catch {}
}

if ($Findings.Count -gt 0) {
    Write-Host "Found $($Findings.Count) potential leaks." -ForegroundColor Yellow
    $Findings | Format-Table
    $Findings | Out-File $AuditReport
} else {
    Write-Host "Zero memory sinks detected." -ForegroundColor Green
    "No findings." | Out-File $AuditReport
}

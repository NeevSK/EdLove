$ErrorActionPreference = 'Stop'
$envFile = 'C:\x\apps\gurudevi-mobile\.env.release'
$lines = Get-Content -LiteralPath $envFile
function Read-EnvValue([string]$name) {
  $line = $lines | Where-Object { $_ -match ("^\s*" + [regex]::Escape($name) + "\s*=") } | Select-Object -First 1
  if (-not $line) { throw "Required environment value missing: $name" }
  $value = ($line -replace ("^\s*" + [regex]::Escape($name) + "\s*=\s*"), '').Trim()
  return $value.Trim('"').Trim("'")
}
$env:NEXT_PUBLIC_SUPABASE_URL = Read-EnvValue 'EXPO_PUBLIC_SUPABASE_URL'
$env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = Read-EnvValue 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
$env:NEXT_PUBLIC_API_URL = 'http://localhost:3001'
Set-Location 'C:\x'
pnpm --filter gurudevi-web dev
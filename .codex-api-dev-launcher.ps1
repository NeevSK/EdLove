$ErrorActionPreference = 'Stop'
$poolerUrl = (Get-Content -Raw -LiteralPath 'C:\x\apps\gurudevi-mobile\supabase\.temp\pooler-url').Trim()
$directUrl = doppler secrets get POWERSYNC_DATABASE_URI --plain
$pooler = [uri]$poolerUrl
$direct = [uri]$directUrl
$username = $pooler.UserInfo.Split(':', 2)[0]
$password = $direct.UserInfo.Split(':', 2)[1]
$escapedUser = [uri]::EscapeDataString($username)
$escapedPassword = [uri]::EscapeDataString($password)
$builder = [System.UriBuilder]$pooler
$builder.UserName = $escapedUser
$builder.Password = $escapedPassword
$env:DATABASE_URL = $builder.Uri.AbsoluteUri
$env:SUPABASE_URL = doppler secrets get SUPABASE_URL --plain
$env:PORT = '3001'
Set-Location 'C:\x\apps\sanctuary-api'
node --import tsx src/entry-node.ts
# Discovery Script: List all Monorepo Targets (SHINY VERSION)
# Smart discovery with cross-platform fallback
$apps = @()
$packages = @()

if (Get-Command fd -ErrorAction SilentlyContinue) {
    # Preferred: Fast discovery with fd
    $fd = (Get-Command fd).Source
    $apps = & $fd -t d -d 1 . apps
    $packages = & $fd -t d -d 1 . packages
} else {
    # Fallback: Native PowerShell discovery
    $apps = Get-ChildItem -Path apps -Directory | ForEach-Object { "apps/$($_.Name)" }
    $packages = Get-ChildItem -Path packages -Directory | ForEach-Object { "packages/$($_.Name)" }
}

$results = foreach ($pkgPath in ($apps + $packages)) {
    $info = Get-Item $pkgPath
    [PSCustomObject]@{
        FullID    = if ($info.Parent.Name -eq "packages") { "@repo/$($info.Name)" } else { "@app/$($info.Name)" }
        ShortID   = $info.Name
        Path      = $info.FullName
        Directory = $info.Parent.Name
    }
}

$results | Sort-Object FullID | Format-Table -AutoSize

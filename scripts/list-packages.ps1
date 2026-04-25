# Discovery Script: List all Monorepo Targets (SHINY VERSION)
# Use fd for lightning-fast directory discovery
$apps = & fd -t d -d 1 . apps
$packages = & fd -t d -d 1 . packages

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

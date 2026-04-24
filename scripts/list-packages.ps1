# Discovery Script: List all Monorepo Targets
$packages = Get-ChildItem -Path "packages/*", "apps/*" -Directory 

$results = foreach ($pkg in $packages) {
    [PSCustomObject]@{
        FullID    = if ($pkg.Parent.Name -eq "packages") { "@repo/$($pkg.Name)" } else { "@app/$($pkg.Name)" }
        ShortID   = $pkg.Name
        Path      = $pkg.FullName
        Directory = $pkg.Parent.Name
    }
}

$results | Sort-Object FullID | Format-Table -AutoSize

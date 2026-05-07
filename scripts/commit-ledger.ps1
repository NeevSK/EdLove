param(
    [string]$CommitMsgFile
)

# 1. Get staged changes
$stagedFilesData = git diff --cached --name-status
if (-not $stagedFilesData) { exit 0 }
$stagedFiles = $stagedFilesData -split "`n"

# 2. Shiny Dynamic Sector Discovery (Sovereign Architecture)
# Smart discovery with cross-platform fallback
$apps = @()
$packages = @()

if (Get-Command fd -ErrorAction SilentlyContinue) {
    # Preferred: Fast discovery with fd
    $fd = (Get-Command fd).Source
    $apps = & $fd -t d -d 1 . apps | ForEach-Object { $_.TrimEnd('\/').Split('\/')[-1] }
    $packages = & $fd -t d -d 1 . packages | ForEach-Object { $_.TrimEnd('\/').Split('\/')[-1] }
} else {
    # Fallback: Native PowerShell discovery
    $apps = Get-ChildItem -Path apps -Directory | Select-Object -ExpandProperty Name
    $packages = Get-ChildItem -Path packages -Directory | Select-Object -ExpandProperty Name
}

$categorized = New-Object 'System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[string]]'
$otherFiles = New-Object 'System.Collections.Generic.List[string]'

# 3. Categorize changes by Monorepo Layer
foreach ($line in $stagedFiles) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $parts = $line -split "`t"
    if ($parts.Count -lt 2) { $path = $line.Trim(); $status = "M" }
    else { $status = $parts[0].Trim(); $path = $parts[1].Trim() }
    
    $found = $false

    # Layer: Apps
    foreach ($app in $apps) {
        if ($path -match "apps/$app") {
            $key = "[APP] $app"
            if (-not $categorized.ContainsKey($key)) { $categorized[$key] = New-Object 'System.Collections.Generic.List[string]' }
            $categorized[$key].Add("  $status $path")
            $found = $true; break
        }
    }
    if ($found) { continue }

    # Layer: Packages
    foreach ($pkg in $packages) {
        if ($path -match "packages/$pkg") {
            $key = "[PKG] $pkg"
            if (-not $categorized.ContainsKey($key)) { $categorized[$key] = New-Object 'System.Collections.Generic.List[string]' }
            $categorized[$key].Add("  $status $path")
            $found = $true; break
        }
    }
    if ($found) { continue }

    # Layer: Engineering / Tooling
    if ($path -match "scripts/|config/|\.husky/|\.size-limit|package\.json|pnpm-lock\.yaml|tsconfig\.json") {
        $key = "[TOOL] Engineering & Tooling"
        if (-not $categorized.ContainsKey($key)) { $categorized[$key] = New-Object 'System.Collections.Generic.List[string]' }
        $categorized[$key].Add("  $status $path")
        $found = $true
    }

    if (-not $found) { $otherFiles.Add("  $status $path") }
}

# 4. Build the Ledger (The Record of Truth)
$ledger = "`n`n[STAGED CHANGES SUMMARY]`n"
foreach ($key in ($categorized.Keys | Sort-Object)) {
    $ledger += "$key`n"
    foreach ($fileLine in $categorized[$key]) { $ledger += "$fileLine`n" }
    $ledger += "`n"
}

if ($otherFiles.Count -gt 0) {
    $ledger += "[MISC] Miscellaneous Files`n"
    foreach ($fileLine in $otherFiles) { $ledger += "$fileLine`n" }
}

# 5. Append to commit message
if (Test-Path $CommitMsgFile) {
    $currentMsg = Get-Content $CommitMsgFile -Raw
    if ($currentMsg -notmatch "\[STAGED CHANGES SUMMARY\]") {
        $ledger | Out-File -FilePath $CommitMsgFile -Append -Encoding utf8
    }
}

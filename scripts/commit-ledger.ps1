param(
    [string]$CommitMsgFile
)

# 1. Get staged changes
$stagedFilesData = git diff --cached --name-status
if (-not $stagedFilesData) {
    exit 0
}

# Convert to array of strings
$stagedFiles = $stagedFilesData -split "`n"

# 2. Define our "Sectors" (Architecture Layers)
$sectors = @{
    "Mobile App"     = "apps/gurudevi-mobile"
    "Shared UI"      = "packages/ui"
    "Core Logic"     = "packages/core"
    "Platform/API"   = "packages/api"
    "Engineering"    = "packages/eslint-config|packages/typescript-config|scripts|config|commitlint|\.size-limit|\.husky"
}

$categorized = New-Object 'System.Collections.Generic.Dictionary[string, System.Collections.Generic.List[string]]'
$otherFiles = New-Object 'System.Collections.Generic.List[string]'

# 3. Categorize files
foreach ($line in $stagedFiles) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    $parts = $line -split "`t"
    if ($parts.Count -lt 2) { continue }
    
    $status = $parts[0].Trim()
    $path = $parts[1].Trim()
    $found = $false

    foreach ($name in $sectors.Keys) {
        $pattern = $sectors[$name]
        if ($path -match $pattern) {
            if (-not $categorized.ContainsKey($name)) { 
                $categorized[$name] = New-Object 'System.Collections.Generic.List[string]'
            }
            $categorized[$name].Add("  $status $path")
            $found = $true
            break
        }
    }

    if (-not $found) {
        $otherFiles.Add("  $status $path")
    }
}

# 4. Build the Ledger
$ledger = "`n`n[STAGED CHANGES SUMMARY]`n"

# Add Categorized Sectors
$sortedKeys = $categorized.Keys | Sort-Object
foreach ($name in $sortedKeys) {
    $icon = "PACKAGE"
    if ($name -eq "Mobile App") { $icon = "MOBILE" }
    elseif ($name -eq "Shared UI") { $icon = "UI" }
    elseif ($name -eq "Core Logic") { $icon = "CORE" }
    elseif ($name -eq "Engineering") { $icon = "TOOL" }
    elseif ($name -eq "Platform/API") { $icon = "API" }
    
    $ledger += "[$icon] $name`n"
    foreach ($fileLine in $categorized[$name]) {
        $ledger += "$fileLine`n"
    }
}

# Add Miscellaneous
if ($otherFiles.Count -gt 0) {
    $ledger += "[MISC] Miscellaneous Files`n"
    foreach ($fileLine in $otherFiles) {
        $ledger += "$fileLine`n"
    }
}

# 5. Append to commit message if not already there
if (Test-Path $CommitMsgFile) {
    $currentMsg = Get-Content $CommitMsgFile -Raw
    if ($currentMsg -notmatch "\[STAGED CHANGES SUMMARY\]") {
        $ledger | Out-File -FilePath $CommitMsgFile -Append -Encoding utf8
    }
}

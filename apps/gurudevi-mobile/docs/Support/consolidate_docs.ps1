# Sovereign Incremental Archive Script
$Src = "C:/Users/Naween/.gemini/antigravity/brain"
$Dst = "c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/brain_archive"
$Prj = "c:/Users/Naween/projects/polymath-platform"
$Dsh = "$Dst/00_RECENT_DASHBOARD.md"

if (-not (Test-Path $Dst)) { New-Item -ItemType Directory -Path $Dst -Force }

$Map = @{
    "Tasks_and_Implementations" = @("*task*", "*implementation*", "*resolved*", "*build_order*", "*setup*")
    "Planning_and_Strategies"    = @("*plan*", "*strategy*", "*architecture*", "*design_system*", "*structure*", "*roadmap*")
    "Learning_and_Walkthrough"   = @("*walkthrough*", "*guide*", "*explained*", "*tutorial*", "*retrospective*", "*context*")
    "Visionary_and_Features"     = @("*north_star*", "*vision*", "*features*", "*philosophy*", "*master_document*")
}

# 1. Process Sessions (Descending order from Source to ensure most recent are processed/linked)
$Sess = Get-ChildItem -Path $Src -Directory | Sort-Object LastWriteTime -Descending
foreach ($S in $Sess) {
    $SP = $S.FullName
    $DT = $S.LastWriteTime.ToString("yyyy-MM-dd_HHmm")
    $BT = $S.Name
    $TF = "$SP/task.md"
    if (Test-Path $TF) {
        $TT = Get-Content $TF | Where-Object { $_ -match "^# " } | Select-Object -First 1
        if ($TT) { $BT = $TT -replace "# ", "" -replace '[\\\/\:\*\?\"<>\|]', "_" }
    }
    $SSN = "$DT`_$BT"

    $Files = Get-ChildItem -Path $SP -File
    foreach ($F in $Files) {
        $Cat = "Uncategorized"
        foreach ($K in $Map.Keys) {
            foreach ($P in $Map[$K]) {
                if ($F.Name -like $P) { $Cat = $K; break }
            }
            if ($Cat -ne "Uncategorized") { break }
        }

        $TP = "$Dst/$Cat/$SSN"
        if (-not (Test-Path $TP)) { New-Item -ItemType Directory -Path $TP -Force }

        # Use creation time for the file prefix to maintain absolute sequence
        $NF = "$($F.CreationTime.ToString('HHmm'))_$($F.Name)"
        $D = "$TP/$NF"
        
        # Incremental check: Only copy if the file doesn't exist
        if (-not (Test-Path $D)) { 
            Copy-Item -Path $F.FullName -Destination $D -Force 
        }
    }
}

# 2. Update Dashboard (Descending Order)
$Now = Get-Date -Format "yyyy-MM-dd HH:mm"
Set-Content -Path $Dsh -Value "# Recent Activity Dashboard" -Encoding utf8
Add-Content -Path $Dsh -Value "Last Updated: $Now"
Add-Content -Path $Dsh -Value ""

$Cats = Get-ChildItem -Path $Dst -Directory | Sort-Object Name
foreach ($CD in $Cats) {
    if ($CD.Name -eq "Uncategorized" -and (Get-ChildItem $CD.FullName).Count -eq 0) { continue }
    
    $CN = $CD.Name -replace "_", " "
    Add-Content -Path $Dsh -Value "## $CN"
    
    # Sort sessions within category descending by Name (which starts with YYYY-MM-DD)
    $Entries = Get-ChildItem -Path $CD.FullName -Directory | Sort-Object Name -Descending
    foreach ($E in $Entries) {
        $Clean = $E.Name -replace "^\d{4}-\d{2}-\d{2}_\d{4}_", ""
        $Rel = $E.FullName.Replace($Prj, "").Replace("\", "/")
        if ($Rel.StartsWith("/")) { $Rel = $Rel.Substring(1) }
        $Line = "- **[$Clean]** ($($E.Name.Substring(0,10))) - [View]($Rel)"
        Add-Content -Path $Dsh -Value $Line
    }
    Add-Content -Path $Dsh -Value ""
}

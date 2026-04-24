
$content = Get-Content -Path "reports/unused_code.txt" -Encoding utf8

$findings = $content | Where-Object { $_ -match "(warn|error)\s+([^:]+):\s+(.*)" }

$grouped = $findings | ForEach-Object {
    if ($_ -match "((?:apps|packages)/[^/]+)/(.*)") {
        $category = $matches[1]
        $file = $matches[2]
        [PSCustomObject]@{
            Category = $category
            File     = $file
            Line     = $_
        }
    } else {
        [PSCustomObject]@{
            Category = "Other"
            File     = "Mixed"
            Line     = $_
        }
    }
} | Group-Object Category

foreach ($group in $grouped) {
    Write-Host "Group: $($group.Name) ($($group.Count) items)"
}

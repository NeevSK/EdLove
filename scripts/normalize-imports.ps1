param(
    [string]$Target = "."
)

Write-Host ">>> Normalizing Monorepo Imports <<<" -ForegroundColor Cyan

# Define mapping of relative paths to workspace aliases
# This is a basic implementation that can be expanded
$mappings = @{
    "../../../packages/core" = "@repo/core";
    "../../packages/core" = "@repo/core";
    "../packages/core" = "@repo/core";
    "../../../packages/ui" = "@repo/ui";
    "../../packages/ui" = "@repo/ui";
    "../packages/ui" = "@repo/ui";
}

$files = Get-ChildItem -Path $Target -Include *.ts,*.tsx -Recurse | Where-Object { $_.FullName -notmatch "node_modules" }

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $changed = $false

    foreach ($rel in $mappings.Keys) {
        $alias = $mappings[$rel]
        # Match from 'path' or from "path"
        $pattern = "from\s+['""]" + [regex]::Escape($rel) + "(/[^'""\s]*)?['""]"
        $replacement = "from '$alias$1'"
        
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacement
            $changed = $true
        }
    }

    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Normalized: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`n✅ Import normalization complete." -ForegroundColor Green

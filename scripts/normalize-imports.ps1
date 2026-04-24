param(
    [string]$Target = ".",
    [switch]$VerboseOutput
)

Write-Host ">>> Normalizing Monorepo Imports <<<" -ForegroundColor Cyan
$startTime = Get-Date

# Define mapping of relative paths to workspace aliases
# Expanded to catch more deep nesting
$mappings = @{
    "../../../packages/core" = "@repo/core";
    "../../packages/core" = "@repo/core";
    "../packages/core" = "@repo/core";
    "../../../packages/ui" = "@repo/ui";
    "../../packages/ui" = "@repo/ui";
    "../packages/ui" = "@repo/ui";
    "../../../packages/classroom" = "@repo/classroom";
    "../../packages/classroom" = "@repo/classroom";
    "../packages/classroom" = "@repo/classroom";
}

try {
    $files = Get-ChildItem -Path $Target -Include *.ts,*.tsx -Recurse -ErrorAction Stop | Where-Object { $_.FullName -notmatch "node_modules" }
    $totalFiles = $files.Count
    $processedCount = 0
    $changedCount = 0

    Write-Host "Found $totalFiles files to scan in $Target." -ForegroundColor Gray

    foreach ($file in $files) {
        $processedCount++
        if ($processedCount % 50 -eq 0) {
            Write-Host "Progress: $processedCount/$totalFiles files..." -ForegroundColor Gray
        }

        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
            $changed = $false

            foreach ($rel in $mappings.Keys) {
                $alias = $mappings[$rel]
                # Match from 'path' or from "path"
                $pattern = "from\s+['""]" + [regex]::Escape($rel) + "(/[^'""\s]*)?['""]"
                $replacement = "from '$alias$1'"
                
                if ($content -match $pattern) {
                    $content = [Regex]::Replace($content, $pattern, $replacement)
                    $changed = $true
                }
            }

            if ($changed) {
                Set-Content -Path $file.FullName -Value $content -NoNewline -ErrorAction Stop
                $changedCount++
                if ($VerboseOutput) {
                    Write-Host "Normalized: $($file.FullName)" -ForegroundColor Green
                }
            }
        } catch {
            Write-Error "Failed to process file: $($file.FullName). Error: $($_.Exception.Message)"
        }
    }

    $duration = (Get-Date) - $startTime
    Write-Host "`n✅ Import normalization complete." -ForegroundColor Green
    Write-Host "Scanned: $totalFiles | Changed: $changedCount | Duration: $($duration.TotalSeconds)s" -ForegroundColor Cyan
} catch {
    Write-Error "Fatal error during normalization: $($_.Exception.Message)"
    exit 1
}

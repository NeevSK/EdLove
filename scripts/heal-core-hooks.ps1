# Process files passed as arguments
$options = [System.Text.RegularExpressions.RegexOptions]::Multiline

Write-Host ">>> Starting Core Hooks Healing..."

foreach ($f in $args) {
    if (-Not $f) { continue }
    $filePath = $f.Trim().Trim('"').Trim("'")
    if (-Not (Test-Path -Path $filePath)) {
        Write-Warning "File not found: $filePath"
        continue
    }

    Write-Host ">>> Healing Hooks: $filePath"
    try {
        $fullPath = (Get-Item -LiteralPath $filePath).FullName
        $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)

        # 1. Bracket Type Fix
        # Match: ['basicInfo']>
        # Replace: ['basicInfo']
        # Also handle cases with single/double quotes.
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?<=[\]])>', '', $options)

        # 2. Revisit Generic Param Fix (the general one from before but safer)
        # Match: <T,>U>
        # Replace: <T, U>
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?<=,\s*)>\s*(?=[A-Z])', ' ', $options)

        # 3. Arrow Function Fix
        # Match: ) = {
        # Replace: ) => {
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '\)\s*=\s{2,}(?=\{)', ') => ', $options)

        [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.Encoding]::UTF8)
    } catch {
        Write-Error "FAILED to heal Hooks $filePath : $_"
    }
}

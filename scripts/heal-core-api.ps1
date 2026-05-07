# Process files passed as arguments
$options = [System.Text.RegularExpressions.RegexOptions]::Multiline

Write-Host ">>> Starting Core API Healing..."

foreach ($f in $args) {
    if (-Not $f) { continue }
    $filePath = $f.Trim().Trim('"').Trim("'")
    if (-Not (Test-Path -Path $filePath)) {
        Write-Warning "File not found: $filePath"
        continue
    }

    Write-Host ">>> Healing API: $filePath"
    try {
        $fullPath = (Get-Item -LiteralPath $filePath).FullName
        $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)

        # Authority Fix with truncated words (e.g. delet, create, updat)
        # Match: (action: 'create' | ... | delet>
        # Replace: (action: 'create' | ... | 'delete') =>
        # We also need to add back the missing ' if it's missing.
        
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '\(action:\s*(([''"]\w+[''"]\s*\|\s*)*)([''"]?\w+)(?=\s*>\s+POAMetadataSchema)', {
            param($m)
            # Add missing quote if needed
            $word = $m.Groups[3].Value
            if ($word -like "delet*") { $word = "'delete'" }
            elseif ($word -like "creat*") { $word = "'create'" }
            elseif ($word -like "updat*") { $word = "'update'" }
            elseif ($word -like "read*") { $word = "'read'" }
            
            return "(action: " + $m.Groups[1].Value + $word + ") => "
        }, $options)

        [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.Encoding]::UTF8)
    } catch {
        Write-Error "FAILED to heal API $filePath : $_"
    }
}

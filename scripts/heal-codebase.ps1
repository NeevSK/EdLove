# Process files passed as arguments
$options = [System.Text.RegularExpressions.RegexOptions]::Multiline

Write-Host "Arguments passed: $($args.Count)"

foreach ($f in $args) {
    if (-Not $f) { continue }
    $filePath = $f.Trim().Trim('"').Trim("'")
    if (-Not (Test-Path -Path $filePath)) {
        Write-Warning "File not found: $filePath"
        continue
    }

    Write-Host ">>> Healing: $filePath"
    try {
        $fullPath = (Get-Item -LiteralPath $filePath).FullName
        $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)

        # 1. Simple but aggressive JSX restoration
        # Fix </p   <div  -> </p><div
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(</[a-zA-Z0-9.\$]+)\s{2,}(?=<)', '${1}>', $options)
        
        # Adjacent Tag Fix: <div attr="val"<section  -> <div attr="val"><section
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(<[a-zA-Z0-9.\$]+[^<>]*?"[^"]*")(?=<[a-zA-Z0-9.\$])', '${1}>', $options)

        # Fix <div ...   <button -> <div ...><button
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(<[a-zA-Z0-9.\$]+[^<>]*?)\s{2,}(?=<)', '${1}>', $options)

        # 2. Text-as-Attributes Repair & Large Gap Restoration (including Multi-line)
        # Match <p ...   Your account... OR <button ... \r\n   Sign Up
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(<[a-zA-Z0-9.\$]+[^<>]*?)\s*[\r\n]+\s{5,}(?=[A-Z{])', '${1}>', $options)
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(<[a-zA-Z0-9.\$]+[^<>]*?)\s{5,}(?=[A-Z{])', '${1}>', $options)
        
        # 3. Generic Type Fixes: Handle list<T> or Map<string, any> where > was stripped
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(<[A-Z][a-zA-Z0-9]*(\s*,\s*[A-Z][a-zA-Z0-9]*)*)(?=\s*[\[;\]\)\}])', '${1}>', $options)

        # 3. Fix Self-Closing Tags (e.g. <input ... /   )
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(<[a-zA-Z0-9.\$]+[^<>]*?/)\s{2,}', '${1}>', $options)
        
        # 4. Fix Closing Tags missing > at end of lines or before next tag
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(</[a-zA-Z0-9.\$]+)\s{2,}', '${1}>', $options)

        # 5. Fix Corrupted Conditional Markers
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '\{\s*(\w+)\s*&&\s*>\s*\(\s*<', '{$1 && ( <', $options)
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?<=&&)\s*>\s*\(', ' (', $options)

        # 6. Fix Arrow Functions (e.g. ") =    {")
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '\)\s*=\s{2,}', ') => ', $options)

        # 7. Final bracket cleanup
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '\s{2,}>', '>', $options)
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?<=="[^"]*")\s{2,}(?=[A-Z])', '>', $options)
        
        # 8. Service/API Specific Cleanup: Fix illegal Promise<T>[]> or T>[]> 
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '>\[\]>', '[]>', $options)
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '>\]>', ']>', $options)

        [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "SUCCESS: Healed $filePath"
    } catch {
        Write-Error "FAILED to heal $filePath : $_"
    }
}

# Process files passed as arguments
$options = [System.Text.RegularExpressions.RegexOptions]::Multiline

Write-Host ">>> Starting JSX Healing..."

foreach ($f in $args) {
    if (-Not $f) { continue }
    $filePath = $f.Trim().Trim('"').Trim("'")
    if (-Not (Test-Path -Path $filePath)) {
        Write-Warning "File not found: $filePath"
        continue
    }

    Write-Host ">>> Healing JSX: $filePath"
    try {
        $fullPath = (Get-Item -LiteralPath $filePath).FullName
        $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)

        # 1. Double closing brackets after self-closing or regular tags
        # Match: />> or > >
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?<=/)>|(?<=>)\s*>', '', $options)

        # 2. Broken self-closing tag with attributes following it
        # Match: <Image/> source=
        # Replace: <Image source=
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '<(\w+)\s*/>\s*(?=\w+=)', '<$1 ', $options)

        # 3. Extra bracket after closing brace or parenthesis in JSX props
        # Match: {content}> or )>
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?<=[})])>', '', $options)

        # 4. Extra bracket after closing tag
        # Match: </Text>>
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?<=</\w+)>', '', $options)

        # 5. Fix mangled ternary/conditional JSX
        # Match: />>:
        # Replace: /> :
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '/>>:', '/> :', $options)

        [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.Encoding]::UTF8)
    } catch {
        Write-Error "FAILED to heal JSX $filePath : $_"
    }
}

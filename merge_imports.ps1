$srcDir = 'c:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\src'
$files = Get-ChildItem -Path $srcDir -Recurse -Include '*.ts', '*.tsx' | Where-Object { $_.FullName -notmatch '__tests__' }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    # Find all @repo/core import lines and collect all named imports
    $pattern = "import \{([^}]+)\} from '@repo/core';"
    $matches = [regex]::Matches($content, $pattern)

    if ($matches.Count -gt 1) {
        # Collect all imported names
        $allImports = @()
        foreach ($m in $matches) {
            $names = $m.Groups[1].Value -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
            $allImports += $names
        }

        # Deduplicate
        $allImports = $allImports | Sort-Object -Unique

        # Build merged import line
        $mergedImport = "import { " + ($allImports -join ', ') + " } from '@repo/core';"

        # Remove all existing @repo/core import lines
        $content = [regex]::Replace($content, "import \{[^}]+\} from '@repo/core';\r?\n", '')

        # Find the first import line position and insert merged import after it
        # Actually, insert at the top of imports section
        # Find first import line
        $firstImportMatch = [regex]::Match($content, "^import ", [System.Text.RegularExpressions.RegexOptions]::Multiline)
        if ($firstImportMatch.Success) {
            $insertPos = $firstImportMatch.Index
            $content = $content.Substring(0, $insertPos) + $mergedImport + "`r`n" + $content.Substring($insertPos)
        }

        Write-Host "Merged imports in: $($file.FullName)"
    }

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
    }
}

Write-Host "Done merging."

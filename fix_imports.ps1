$srcDir = 'c:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\src'
$files = Get-ChildItem -Path $srcDir -Recurse -Include '*.ts', '*.tsx' | Where-Object { $_.FullName -notmatch '__tests__' }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    # Replace store/useStore imports
    $content = $content -replace "from '([./]+)store/useStore'", "from '@repo/core'"
    $content = $content -replace 'from "([./]+)store/useStore"', 'from "@repo/core"'

    # Replace lib/supabase imports
    $content = $content -replace "from '([./]+)lib/supabase'", "from '@repo/core'"
    $content = $content -replace 'from "([./]+)lib/supabase"', 'from "@repo/core"'

    # Replace types/User imports
    $content = $content -replace "from '([./]+)types/User'", "from '@repo/core'"
    $content = $content -replace 'from "([./]+)types/User"', 'from "@repo/core"'

    # Replace hooks/useUserRole imports
    $content = $content -replace "from '([./]+)hooks/useUserRole'", "from '@repo/core'"
    $content = $content -replace 'from "([./]+)hooks/useUserRole"', 'from "@repo/core"'

    # Replace lib/storageWrapper imports
    $content = $content -replace "from '([./]+)lib/storageWrapper'", "from '@repo/core'"
    $content = $content -replace 'from "([./]+)lib/storageWrapper"', 'from "@repo/core"'

    # Replace lib/storage imports
    $content = $content -replace "from '([./]+)lib/storage'", "from '@repo/core'"
    $content = $content -replace 'from "([./]+)lib/storage"', 'from "@repo/core"'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Done."

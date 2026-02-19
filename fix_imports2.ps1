$srcDir = 'c:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\src'
$files = Get-ChildItem -Path $srcDir -Recurse -Include '*.ts', '*.tsx' | Where-Object { $_.FullName -notmatch '__tests__' }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    # Match any relative import ending in /supabase, /storageWrapper, /storage, /useStore, /useUserRole
    # These are files that were deleted and moved to @repo/core
    # Pattern: from './supabase' or from '../supabase' or from '../../supabase' etc.
    $content = $content -replace "from '(\.\./)*supabase'", "from '@repo/core'"
    $content = $content -replace 'from "(\.\./)*supabase"', 'from "@repo/core"'

    $content = $content -replace "from '(\.\./)*storageWrapper'", "from '@repo/core'"
    $content = $content -replace 'from "(\.\./)*storageWrapper"', 'from "@repo/core"'

    $content = $content -replace "from '(\.\./)*storage'", "from '@repo/core'"
    $content = $content -replace 'from "(\.\./)*storage"', 'from "@repo/core"'

    $content = $content -replace "from '(\.\./)*useStore'", "from '@repo/core'"
    $content = $content -replace 'from "(\.\./)*useStore"', 'from "@repo/core"'

    $content = $content -replace "from '(\.\./)*useUserRole'", "from '@repo/core'"
    $content = $content -replace 'from "(\.\./)*useUserRole"', 'from "@repo/core"'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Done."

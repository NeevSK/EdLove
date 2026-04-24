param (
    [string]$Path = "packages/library/src"
)

$files = Get-ChildItem -Path $Path -Filter *.tsx -Recurse

foreach ($file in $files) {
    Write-Host "Healing JSX Tags: $($file.FullName)"
    $content = Get-Content -Raw -Path $file.FullName -Encoding UTF8

    # 1. Closing tag truncation: </Tag -> </Tag>
    $content = $content -replace '(</[a-zA-Z0-9.]+)(?![a-zA-Z0-9.>])', '$1>'

    # 2. Self-closing tag truncation at end of line: <Tag / -> <Tag />
    $content = $content -replace '(<[a-zA-Z0-9.]+[^>]*?/\s*)(?![a-zA-Z0-9.>])', '$1>'

    # 3. Opening tag truncation (followed by another tag): <Tag ... \n <Sibling -> <Tag ...>\n <Sibling
    $content = $content -replace '(?m)^(\s*<[a-zA-Z0-9.]+[^>]*?[^>{/])(\s*[\r\n]+\s*<)', '$1>$2'

    # 4. Mangled self-closers at start of line or before delimiter: /<Tag -> /> <Tag, /: -> /> :
    $content = $content -replace '(?m)^(\s*)(/)(\s*<[a-zA-Z0-9.]+)', '$1/> $3'
    $content = $content -replace '(/\s*)(?=[;:])', '/> '

    # 5. JSX Prop truncation (sx={{...}} followed by tag): sx={{...}} \n <Tag
    $content = $content -replace '(?m)(sx={{[^}]*?})(\s*[\r\n]+\s*<)', '$1>$2'

    # 6. Residual double closing brackets: />> -> />
    $content = $content -replace '/>>+', '/>'
    $content = $content -replace '(?<!/)> *>', '>'

    # 7. Truncated tags followed by bracket on same line: </Tag </Other -> </Tag> </Other
    $content = $content -replace '(</[a-zA-Z0-9.]+)(?=\s*</)', '$1>'
    
    # 8. Specific fix for <Image/ truncated next to /<Box
    $content = $content -replace '(<Image/[^>]*?)(?=\s*/<Box)', '$1>'

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

# Process files passed as arguments
$options = [System.Text.RegularExpressions.RegexOptions]::Multiline

Write-Host ">>> Starting Core Package Healing..."

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

        # 1. API Contract Authority Fix
        # Match: (action: 'create' | 'read' | 'update' | 'delete>    POAMetadataSchema.parse
        # Replace: (action: 'create' | 'read' | 'update' | 'delete') => POAMetadataSchema.parse
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '\(action: ([''"]\w+[''"]\s*\|\s*)*[''"]\w+[''"](?=>\s+POAMetadataSchema)', '${0}) => ', $options)

        # 2. Generic Type Parameter Fix
        # Match: <TSurfaceId extends string = string,>TCapabilityKey
        # Replace: <TSurfaceId extends string = string, TCapabilityKey
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?<=,\s*)>\s*(?=[A-Z])', ' ', $options)

        # 3. Extra Bracket Closing Fix
        # Match: ['basicInfo']>
        # Replace: ['basicInfo']
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?<=\s*[A-Z][a-zA-Z0-9\.]+[\]])>', '', $options)
        
        # 4. Arrow Function Fix
        # Match: ) =    {
        # Replace: ) => {
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '\)\s*=\s{2,}(?=\{)', ') => ', $options)

        # 5. Fix mangled interface closing tags in core canvas
        # Match: extends WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey> {
        # (Handling cases where the generic was broken)
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(\w+)\s+extends\s+(\w+)<([^>]+),\s+([^>]+)>\s*(?=\{)', '${0}', $options)

        # 6. Specific Map fix for canvas.ts line 188
        # Match: <WorkspaceZoneId, ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey[]>();
        # Replace: <WorkspaceZoneId, ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>[]>();
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?<=TCapabilityKey)(\[\])', '>$1', $options)

        [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.Encoding]::UTF8)
        # Write-Host "SUCCESS: Healed $filePath"
    } catch {
        Write-Error "FAILED to heal $filePath : $_"
    }
}

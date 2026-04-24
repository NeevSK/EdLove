
# Heal Package Script for @repo/self
# Purpose: Systematically fix recurring syntax, import, and styling patterns that cause build errors.

function Heal-File($filePath) {
    Write-Host "Healing: $filePath"
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8

    # 1. Fix Syntax Corruption (remove leading '>' from props)
    # Pattern: [space][>][propName]=
    $content = $content -replace '(\s)>([a-zA-Z]+)=', '$1$2='

    # 2. Fix Import Boundaries
    # Redirect Theme/useTheme/UI components from @repo/core to @repo/ui
    if ($content -match 'from ''@repo/core''') {
        # This is complex to do with regex perfectly, but let's target the most common ones
        $uiComponents = @('Theme', 'useTheme', 'Box', 'HStack', 'VStack', 'Text', 'Heading', 'Center', 'Pressable', 'Icon', 'ScrollView', 'ActivityIndicator')
        foreach ($comp in $uiComponents) {
             # If component is imported from core, move it (this is a bit naive but covers common cases)
             # Better approach: check for specific import blocks
        }
    }

    # 3. Simple Prop Mapping (Prop -> className)
    # Handle direct props that IHCStackProps/IVStackProps don't accept in V3
    # Note: This is an additive process to existing className
    
    # helper to append to className
    function Append-To-ClassName($text, $prop, $twClass) {
        # Find className="...", if exists append, if not add it
        # This is tricky with regex. Let's do simple replacements for common patterns.
        return $text
    }

    # Fix: alignItems="..." -> className="items-..."
    $content = $content -replace 'alignItems="center"', 'className="items-center"'
    $content = $content -replace 'alignItems="flex-start"', 'className="items-start"'
    $content = $content -replace 'alignItems="flex-end"', 'className="items-end"'
    
    # Fix: justifyContent="..." -> className="justify-..."
    $content = $content -replace 'justifyContent="center"', 'className="justify-center"'
    $content = $content -replace 'justifyContent="space-between"', 'className="justify-between"'
    $content = $content -replace 'justifyContent="flex-start"', 'className="justify-start"'

    # Fix: flex={1} (if it's a prop on HStack/VStack) -> className="flex-1"
    # Actually flex={1} might be supported depending on IHStackProps extending ViewProps.
    
    # Fix: space="..." -> className="gap-..." (HStack internal already handles space, so we might keep it if defined)

    Set-Content -Path $filePath -Value $content -Encoding UTF8
}

$files = Get-ChildItem -Path "src" -Include *.tsx,*.ts -Recurse
foreach ($file in $files) {
    Heal-File $file.FullName
}

param(
    [string]$Path = "packages apps",
    [switch]$JSON = $false
)

Write-Host "`n>>> Polymath Sovereign Deprecation Auditor (Ripgrep Engine) <<<" -ForegroundColor Cyan

$patterns = @(
    # React 19 Deprecations & Removals
    @{ Name = "React: forwardRef"; Pattern = 'forwardRef\('; Severity = "MEDIUM"; Message = "Deprecated in React 19. Pass ref as a standard prop instead." },
    @{ Name = "React: propTypes"; Pattern = '\.propTypes\s*='; Severity = "HIGH"; Message = "Removed in React 19. Use TypeScript types instead." },
    @{ Name = "React: defaultProps"; Pattern = '\.defaultProps\s*='; Severity = "HIGH"; Message = "Removed for function components in React 19. Use ES6 default parameters." },
    @{ Name = "React: useFormState"; Pattern = 'useFormState\('; Severity = "HIGH"; Message = "Removed in React 19. Use useActionState instead." },
    
    # Legacy React Methods
    @{ Name = "React: componentWillMount"; Pattern = 'componentWillMount'; Severity = "HIGH"; Message = "Use componentDidMount or constructor." },
    @{ Name = "React: componentWillReceiveProps"; Pattern = 'componentWillReceiveProps'; Severity = "HIGH"; Message = "Use getDerivedStateFromProps or componentDidUpdate." },
    @{ Name = "React: componentWillUpdate"; Pattern = 'componentWillUpdate'; Severity = "HIGH"; Message = "Use getSnapshotBeforeUpdate or componentDidUpdate." },
    @{ Name = "React: ReactDOM.render"; Pattern = 'ReactDOM\.render'; Severity = "MEDIUM"; Message = "Use createRoot from react-dom/client (React 18+)." },
    
    # React Native 0.83+ Deprecations
    @{ Name = "RN: sendRequestInternal"; Pattern = 'sendRequestInternal'; Severity = "MEDIUM"; Message = "Deprecated in RN 0.83 (Android)." },
    @{ Name = "RN: ViewPropTypes"; Pattern = 'ViewPropTypes'; Severity = "CRITICAL"; Message = "Removed in RN 0.70. Use React.ComponentProps<typeof View>." },
    @{ Name = "RN: ColorPropType"; Pattern = 'ColorPropType'; Severity = "CRITICAL"; Message = "Removed in RN 0.70." },
    @{ Name = "RN: ListView"; Pattern = 'ListView'; Severity = "CRITICAL"; Message = "Removed. Use FlatList or SectionList." },
    @{ Name = "RN: Picker"; Pattern = "import.*Picker.*from ['""]react-native['""]"; Severity = "MEDIUM"; Message = "Use @react-native-picker/picker." },
    
    # Expo SDK 58 Deprecations
    @{ Name = "Expo: newArchEnabled"; Pattern = '"newArchEnabled":'; Severity = "HIGH"; Message = "New Architecture is mandatory and default in Expo SDK 58. Flag is obsolete." },
    @{ Name = "Expo: expo-permissions"; Pattern = "from ['""]expo-permissions['""]"; Severity = "HIGH"; Message = "Use module-specific permission methods (e.g. expo-location)." },
    @{ Name = "Expo: expo-ads-admob"; Pattern = "from ['""]expo-ads-admob['""]"; Severity = "CRITICAL"; Message = "This package is deprecated and no longer supported." },
    
    # PowerSync JS v2 Dialect
    @{ Name = "PowerSync: AbstractPowerSyncDatabase"; Pattern = 'AbstractPowerSyncDatabase'; Severity = "MEDIUM"; Message = "Legacy PowerSync v1 class. Use CommonPowerSyncDatabase in PowerSync JS v2." },

    # Gluestack / UI
    @{ Name = "UI: Legacy Deprecation Tag"; Pattern = '@deprecated'; Severity = "REVIEW"; Message = "Symbol is explicitly marked as deprecated in JSDoc." },
    @{ Name = "RN: useNativeDriver: false"; Pattern = 'useNativeDriver:\s*false'; Severity = "LOW"; Message = "Avoid disabling native driver unless animating layout properties." }
)

$results = @()
$targetPaths = $Path -split " "

foreach ($target in $targetPaths) {
    if (-not (Test-Path $target)) { continue }
    
    foreach ($p in $patterns) {
        $rgOutput = rg $p.Pattern $target -g '*.{ts,tsx,js,jsx}' -g 'app.json' --line-number --json --glob '!node_modules' --glob '!.expo' --glob '!.next' --glob '!dist' | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        foreach ($item in $rgOutput) {
            if ($item.type -eq "match") {
                $results += [PSCustomObject]@{
                    Rule     = $p.Name
                    File     = $item.data.path.text
                    Line     = $item.data.line_number
                    Content  = $item.data.lines.text.Trim()
                    Severity = $p.Severity
                    Advice   = $p.Message
                }
            }
        }
    }
}

if ($JSON) {
    $results | ConvertTo-Json
} else {
    if ($results.Count -eq 0) {
        Write-Host "`n[PASS] No deprecated patterns found in scanned paths." -ForegroundColor Green
    } else {
        $grouped = $results | Group-Object Rule
        foreach ($group in $grouped) {
            $count = $group.Count
            Write-Host "`n[!] $($group.Name) ($count occurrences)" -ForegroundColor Yellow
            $group.Group | ForEach-Object {
                Write-Host "  $($_.Severity): $($_.File):$($_.Line)" -ForegroundColor Gray
                Write-Host "  > $($_.Content)" -ForegroundColor White
                Write-Host "  Advice: $($_.Advice)" -ForegroundColor Cyan
            }
        }
        $totalCount = $results.Count
        Write-Host "`n[FAIL] Found $totalCount deprecation violations." -ForegroundColor Red
    }
}

Write-Host "`n>>> Audit Complete <<<" -ForegroundColor Cyan

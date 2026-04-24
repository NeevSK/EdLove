param(
    [string]$Target = "."
)

Write-Host ">>> Running Accessibility Audit for: $Target" -ForegroundColor Yellow

# Use turbo or direct eslint if it's a specific file
if ($Target -like "*.ts" -or $Target -like "*.tsx") {
    pnpm exec eslint $Target --rule "react-native-a11y/all: error" --no-inline-config
} else {
    # If it's a package, use turbo but with a filter if possible, or just direct eslint
    pnpm exec eslint "$Target" --rule "react-native-a11y/all: error" --no-inline-config
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Accessibility check passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Accessibility violations found." -ForegroundColor Red
}

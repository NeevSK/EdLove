# EAS Build Quick Reference

## Prerequisites
```bash
# Install EAS CLI globally (if not already installed)
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure project (first time only)
eas build:configure
```

## Build Commands

### Development Build (Fast iteration)
```bash
# Android APK with dev client
pnpm build:dev

# iOS Simulator build
pnpm build:dev:ios
```
**Use when**: Testing new features, debugging
**Build time**: ~8-12 minutes (first build), ~5-8 minutes (cached)

### Preview Build (Stakeholder testing)
```bash
# Android APK
pnpm build:preview

# iOS Ad-hoc
pnpm build:preview:ios
```
**Use when**: Sharing with testers, QA validation
**Build time**: ~10-15 minutes

### Production Build (Store submission)
```bash
# Both platforms
pnpm build:prod
```
**Use when**: Ready for App Store/Play Store
**Build time**: ~15-20 minutes

## Environment Variables

Set secrets in EAS (not in code):
```bash
eas secret:create --scope project --name SUPABASE_URL --value "your-url"
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "your-key"
```

## Troubleshooting

### Build fails with dependency errors
- Check `.npmrc` has `shamefully-hoist=true`
- Verify `pnpm-lock.yaml` is committed
- Try: `pnpm install --force` locally first

### Build takes too long
- First build is always slower (no cache)
- Subsequent builds use cache (~50% faster)
- `.easignore` excludes unnecessary files

### "Module not found" errors
- Ensure all dependencies are in `package.json`
- Check monorepo workspace links are correct
- Verify `node_modules` is in `.easignore`

## Monitoring Builds

View build status:
```bash
eas build:list
```

View build logs:
```bash
eas build:view [BUILD_ID]
```

## Next Steps After Build

1. **Development**: Install on device via QR code or download link
2. **Preview**: Share download link with testers
3. **Production**: Submit to stores with `pnpm submit:android` or `pnpm submit:ios`

# Expo File System Migration Plan

## Overview
Migrate from `expo-file-system/legacy` API to the modern object-based API introduced in SDK 54 and stable in SDK 57.

## Why Migrate?

### Benefits
- **Object-based API**: `File` and `Directory` classes instead of string manipulation
- **Synchronous operations**: `textSync()`, `writeSync()` for simple operations
- **Better type safety**: IDE autocomplete and context-aware methods
- **Blob interface**: Files work directly with `fetch` and other APIs
- **Future-proof**: Legacy API may eventually be deprecated
- **Performance**: Built for New Architecture with JSI-based access

### Timeline
- **SDK 52 (Nov 2024)**: Beta `expo-file-system/next` released
- **SDK 54 (Sep 2025)**: Modern API became stable, old API moved to `expo-file-system/legacy`
- **SDK 57 (Current)**: Both APIs available, modern is default

## Current Usage Analysis

### Files Using Legacy API
1. **packages/scanner-kit/src/ocr/providers/GoogleVisionProvider.ts**
   - Uses: `readAsStringAsync` with Base64 encoding
   - Purpose: Convert image URI to base64 for OCR API

2. **packages/scanner-kit/src/ocr/providers/OpenAIVisionProvider.ts**
   - Uses: `readAsStringAsync` with Base64 encoding
   - Purpose: Convert image URI to base64 for OCR API

3. **packages/profile/src/components/AvatarDisplay.tsx**
   - Uses: `cacheDirectory`, `getInfoAsync`, `copyAsync`
   - Purpose: Cache avatar images locally

### Files Using Modern API (Already)
1. **packages/core/src/hooks/useMediaDownloader.ts**
   - Uses: Default import from `expo-file-system`
   - Purpose: Download and cache media files
   - Status: ✅ Already using modern API

### Web Shim
- **apps/gurudevi-mobile/src/shims/expo-file-system-web.js**
  - Current: Legacy API stubs
  - Action: Update to modern API stubs

## Migration Strategy

### Phase 1: Update Web Shim
Update `apps/gurudevi-mobile/src/shims/expo-file-system-web.js` to provide modern API stubs:
- Export `File`, `Directory`, `Paths` classes
- Implement no-op methods for modern API
- Keep legacy compatibility if needed

### Phase 2: Migrate OCR Providers
Both `GoogleVisionProvider` and `OpenAIVisionProvider` use the same pattern:
- **Before**: `FileSystem.readFileSync(uri, { encoding: EncodingType.Base64 })`
- **After**: `new File(uri).base64Sync()`

### Phase 3: Migrate AvatarDisplay
Update `AvatarDisplay.tsx`:
- Replace `FileSystem.cacheDirectory` with `Paths.cache`
- Replace `getInfoAsync` with `file.exists` property
- Replace `copyAsync` with `file.copy()` or `file.copySync()`

### Phase 4: Verify useMediaDownloader
Confirm `useMediaDownloader.ts` is correctly using modern API patterns.

### Phase 5: Testing
- Test OCR functionality with both providers
- Test avatar caching and display
- Test media download functionality
- Verify web builds still work with updated shim

## API Mapping Reference

| Legacy API | Modern API |
|------------|-------------|
| `FileSystem.documentDirectory` | `Paths.document` |
| `FileSystem.cacheDirectory` | `Paths.cache` |
| `readAsStringAsync(uri)` | `file.text()` or `file.textSync()` |
| `readAsStringAsync(uri, { encoding: Base64 })` | `file.base64()` or `file.base64Sync()` |
| `writeAsStringAsync(uri, content)` | `file.write(content)` or `file.writeSync(content)` |
| `getInfoAsync(uri)` | `file.exists`, `file.size`, `file.modificationTime` |
| `copyAsync({ from, to })` | `file.copy(destination)` or `file.copySync(destination)` |
| `moveAsync({ from, to })` | `file.move(destination)` or `file.moveSync(destination)` |
| `deleteAsync(uri)` | `file.delete()` or `file.deleteSync()` |
| `makeDirectoryAsync(uri)` | `directory.create()` or `directory.createSync()` |
| `readDirectoryAsync(uri)` | `directory.read()` or `directory.readSync()` |

## Implementation Steps

1. ✅ Analyze current usage
2. ✅ Update web shim for modern API
3. ✅ Migrate GoogleVisionProvider
4. ✅ Migrate OpenAIVisionProvider
5. ✅ Migrate AvatarDisplay
6. ✅ Verify useMediaDownloader
7. ✅ Test all functionality
8. ✅ Update documentation

## Migration Summary

### Completed Changes

1. **Web Shim** (`apps/gurudevi-mobile/src/shims/expo-file-system-web.js`)
   - Added modern API stubs: `File`, `Directory`, `Paths` classes
   - Maintained legacy API compatibility for gradual migration
   - All methods return safe no-op values for web

2. **GoogleVisionProvider** (`packages/scanner-kit/src/ocr/providers/GoogleVisionProvider.ts`)
   - Migrated from `FileSystem.readFileSync(uri, { encoding: EncodingType.Base64 })`
   - To: `new File(uri).base64Sync()`
   - Cleaner, more readable code

3. **OpenAIVisionProvider** (`packages/scanner-kit/src/ocr/providers/OpenAIVisionProvider.ts`)
   - Same migration as GoogleVisionProvider
   - Consistent pattern across OCR providers

4. **AvatarDisplay** (`packages/profile/src/components/AvatarDisplay.tsx`)
   - Replaced `FileSystem.cacheDirectory` with `Paths.cache`
   - Replaced `getInfoAsync` with `file.exists` property
   - Replaced `copyAsync` with `file.copy()`
   - More object-oriented, type-safe approach

5. **useMediaDownloader** (`packages/core/src/hooks/useMediaDownloader.ts`)
   - Migrated to `Paths.cache` for path construction
   - Migrated to `File.exists` for cache checking
   - **Kept legacy API for downloads** - modern API doesn't support progress callbacks in the same way
   - Hybrid approach: modern for file operations, legacy for downloads with progress

### Type Checking Results
- ✅ `@repo/core`: No errors
- ✅ `@repo/scanner-kit`: No errors
- ✅ `@repo/profile`: No errors

### Benefits Achieved
- **Type safety**: Object-based API with IDE autocomplete
- **Readability**: Clearer code with `File` and `Directory` classes
- **Future-proof**: Using modern API where possible
- **Web compatibility**: Updated shim supports both APIs
- **Backward compatibility**: Legacy API still available where needed

## Rollback Plan
If issues arise:
1. Revert individual file changes
2. Legacy API remains available as `expo-file-system/legacy`
3. No breaking changes to package.json dependencies

## Notes
- Modern API is default in SDK 57, so `import * as FileSystem from 'expo-file-system'` already uses it
- Legacy API remains available for gradual migration
- Web shim is critical for web builds to work

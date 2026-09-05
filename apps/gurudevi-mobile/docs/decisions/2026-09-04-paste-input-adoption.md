---
title: "ADR: expo-paste-input adoption"
status: "accepted"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [adr, expo, native, paste-input, composer]
---

# ADR: expo-paste-input adoption (accepted — 2026-09-04)

## Status

**Decision: PROCEED.** Expo Go incompatibility is NOT a decision criterion — standard loop is dev build (`expo-dev-client` ~57.0.18) + EAS preview + Doppler release APK, which fully supports custom native modules.

## Context

`expo-paste-input` (`github.com/arunabhverma/expo-paste-input`, MIT, third-party — not Expo SDK core) wraps an existing `TextInput` in `TextInputWrapper` and fires `onPaste: { type: "text"; value } | { type: "images"; uris: string[] } | { type: "unsupported" }`. iOS uses `paste(_:)` + `UIPasteboard` + sticker hooks; Android uses `OnReceiveContentListener` + ActionMode. Temp `file://` URIs; web no-op; requires dev build (custom native module — expected, our standard loop).

## Options

1. **Adopt behind flag (chosen).** Install + `ComposerPasteWrapper` → copy temp URIs to attachment store → purge originals; first-paste PDPA consent; per-school allowlist. Dev-build only (standard loop).
2. **Defer (rejected).** Prior defer rested partly on Expo Go — invalid criterion since we ship dev build.
3. **Rebuild own native module.** Rejected — duplicates a maintained MIT module for zero gain.

## Gates (all must pass before merge)

- **Prebuild gate:** `npx expo prebuild --no-install` (NEVER `--clean`); verify package Expo plugin or add via `app.json` (never hand-edit `android/`/`ios/`); NEVER `expo install --fix`; sacred pins untouched.
- **EAS gate:** feature-flagged dev build → preview channel (`eas.json` preview profile) smoke test on iOS + Android (text paste inserts; image paste emits URIs + suppresses default; GIF/sticker path; web no-op).
- **Device-test gate:** standalone Release APK built with `doppler run --no-fallback -- ./gradlew :app:assembleRelease` per AGENTS.md §5; physical-device pass incl. temp-file purge verification + Android vitals bitmap check (Feb-2027 thresholds).

## Rollback

Uninstall package, remove wrapper + flag, `prebuild --no-install` to regenerate, delete temp dir on next foreground sweep. No data migration (attachments already copied to app store or purged).

## Implementation Evidence (2026-09-04)

- **Files created:** `apps/gurudevi-mobile/src/components/ComposerPasteWrapper.tsx`
- **Feature flag:** `isComposerPasteEnabled` (`gurudevi.editorial.composer-paste`) added to manifest + store
- **Dependency:** `react-native-nitro-fetch@1.6.3` (hoisted to root workspace, also provides native fetch upgrade path)
- **TypeScript:** ✅ passes
- **Style-stack gate:** ✅ verify:style-stack passes

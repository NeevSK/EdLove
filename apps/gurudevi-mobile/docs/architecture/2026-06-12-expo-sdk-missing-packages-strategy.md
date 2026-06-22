---
title: "Expo SDK 56 Missing Packages Strategy"
status: "active"
created: 2026-06-12
updated: 2026-06-12
author: "Naween"
tags: [mobile, architecture, expo, audit]
---

# Expo SDK 56 Missing Packages Strategy

This document captures the Expo SDK 56 packages that are not currently installed in `apps/gurudevi-mobile`, based on the Expo SDK 56 package catalog from Expo's own docs, and sorts them into implementation priority buckets.

Reference points:
- Official Expo SDK 56 documentation bundle: `https://docs.expo.dev/llms-sdk.txt`
- Current app manifest: `apps/gurudevi-mobile/package.json`

## Summary

Current comparison baseline:
- Expo SDK 56 catalog packages found in the official docs bundle: `87`
- Expo SDK catalog packages currently installed in `gurudevi-mobile`: `39`
- Expo SDK catalog packages currently missing from `gurudevi-mobile`: `48`

## Buckets

The buckets below are intentionally opinionated and conservative:

- `need now`: clear, immediate product value for Gurudevi Mobile
- `good`: strong candidate for near-term work, but not as urgent as the top bucket
- `okay`: plausible future fit, useful if the product direction expands
- `not now`: technically valid, but no near-term product requirement
- `never`: should not be added in the current app direction, or should be removed because it is deprecated / the wrong abstraction

## Final Install Policy

Install all missing Expo SDK 56 packages except the explicitly excluded items below.

Explicit exclusions:
- `expo-speech`
- `expo-tracking-transparency`
- `expo-background-fetch`
- `expo-barcode-scanner`

Why:
- `expo-speech` and `expo-tracking-transparency` are intentionally deferred for now.
- `expo-background-fetch` is deprecated in Expo SDK 56, and `expo-background-task` is already the correct background primitive.
- `expo-barcode-scanner` is deprecated and already replaced by `expo-camera` plus ML Kit barcode scanning.

## Need Now

These are the packages I would prioritize first because they have direct value for the current product surface.

- `expo-local-authentication`
  - Biometric app lock / step-up auth for sensitive actions.
  - Strong fit for student/admin data and any payment or profile security surface.

- `expo-store-review`
  - In-app rating prompt after successful user moments.
  - Direct retention and growth value with minimal implementation cost.

- `expo-media-library`
  - Save scanner output and captured media into the device gallery.
  - Strong fit for `scanner-kit` and offline backup/export flows.

- `expo-background-task`
  - Already installed, but important enough to call out here because this is the right module for deferred background work.
  - Use it for sync, refresh, and periodic maintenance tasks rather than `expo-background-fetch`.

## Good

These are high-quality candidates that make sense soon, but they are not as urgent as the top bucket.

- `expo-video-thumbnails`
  - Helpful for video libraries, preview cards, or chat attachments.
  - Good if any video-heavy surface needs better previews.

- `expo-keep-awake`
  - Useful for long-running study, scan, or media sessions where the screen should stay on.
  - Good for dedicated task flows, but not universally needed.

- `expo-screen-orientation`
  - Useful when a specific flow should lock orientation or react to rotation.
  - Good for media-heavy or scanning experiences.

- `expo-system-ui`
  - Useful if we want stronger control over navigation/status bar appearance.
  - Good for deeper polish on native UI surfaces.

- `expo-splash-screen`
  - Usually part of a polished app setup and useful for controlling startup experience.
  - Good baseline if we want to tighten launch UX beyond default Expo behavior.

- `expo-network`
  - Useful for offline-aware flows, retry logic, and connection state.
  - Good fit for a local-first or sync-heavy app.

## Install Now

Under the current product direction, all missing Expo SDK 56 packages below should be installed now, with the explicit exclusions above kept out for the moment.

- `@expo/app-integrity`
- `@expo/fingerprint`
- `@expo/ui`
- `@react-native-community/datetimepicker`
- `@react-native-masked-view/masked-view`
- `@react-native-picker/picker`
- `@react-native-segmented-control/segmented-control`
- `@stripe/stripe-react-native`
- `expo-age-range`
- `expo-apple-authentication`
- `expo-background-task`
- `expo-battery`
- `expo-blob`
- `expo-brightness`
- `expo-brownfield`
- `expo-build-properties`
- `expo-calendar`
- `expo-cellular`
- `expo-checkbox`
- `expo-contacts`
- `expo-dev-menu`
- `expo-gl`
- `expo-glass-effect`
- `expo-intent-launcher`
- `expo-keep-awake`
- `expo-live-photo`
- `expo-local-authentication`
- `expo-mail-composer`
- `expo-manifests`
- `expo-maps`
- `expo-media-library`
- `expo-mesh-gradient`
- `expo-navigation-bar`
- `expo-network`
- `expo-print`
- `expo-screen-capture`
- `expo-screen-orientation`
- `expo-sensors`
- `expo-server`
- `expo-splash-screen`
- `expo-store-review`
- `expo-symbols`
- `expo-system-ui`
- `expo-video-thumbnails`
- `expo-widgets`

## Okay

These are legitimate Expo SDK modules, but they should be added only when a concrete feature needs them.

- `expo-battery`
- `expo-cellular`
- `expo-sensors`
- `expo-calendar`
- `expo-contacts`
- `expo-brightness`
- `expo-navigation-bar`
- `expo-print`
- `expo-checkbox`
- `expo-age-range`
- `expo-apple-authentication`
- `expo-maps`
- `expo-gl`
- `expo-mail-composer`
- `expo-sms`
- `expo-symbols`
- `expo-mesh-gradient`
- `expo-speech`
- `expo-tracking-transparency`
- `@react-native-community/datetimepicker`
- `@react-native-picker/picker`
- `@react-native-segmented-control/segmented-control`
- `@react-native-masked-view/masked-view`

Typical reasons these stay in `okay`:
- they only help a narrow interaction pattern
- the current app already has another path or abstraction
- they are platform-specific or feature-specific
- they should be introduced only when a screen explicitly needs them

## Not Now

These are valid packages, but the current Gurudevi Mobile product direction does not justify adding them yet.

- `@expo/ui`
- `@expo/fingerprint`
- `@expo/app-integrity`
- `expo-blob`
- `expo-brownfield`
- `expo-dev-menu`
- `expo-glass-effect`
- `expo-intent-launcher`
- `expo-live-photo`
- `expo-manifests`
- `expo-server`
- `expo-widgets`
- `expo-screen-capture`
- `expo-build-properties`

Why these sit here:
- some are advanced platform integrations we do not currently need
- some are product-extension features, not core learning / classroom / scanner primitives
- some are more useful in specialized Apple/Android-native scenarios

## Never

These should not be added as part of this Expo 56 cleanup pass.

- `expo-barcode-scanner`
  - Deprecated in favor of `expo-camera` and the existing ML Kit barcode scanning path.
  - This should be removed rather than added.

## Background Strategy

- `expo-background-task` is the primary background-work primitive for Gurudevi Mobile and is already installed.
- `expo-background-fetch` is deprecated in Expo SDK 56 and should not be the basis for new work.
- If we need periodic background sync, offline refresh, or deferred maintenance, we should extend the existing `expo-background-task` setup rather than add `expo-background-fetch`.

## Missing Package Inventory

For completeness, here is the full missing set from the official Expo SDK 56 catalog:

- `@expo/app-integrity`
- `@expo/fingerprint`
- `@expo/ui`
- `@react-native-community/datetimepicker`
- `@react-native-masked-view/masked-view`
- `@react-native-picker/picker`
- `@react-native-segmented-control/segmented-control`
- `@stripe/stripe-react-native`
- `expo-age-range`
- `expo-apple-authentication`
- `expo-background-fetch`
- `expo-battery`
- `expo-blob`
- `expo-brightness`
- `expo-brownfield`
- `expo-build-properties`
- `expo-calendar`
- `expo-cellular`
- `expo-checkbox`
- `expo-contacts`
- `expo-dev-menu`
- `expo-gl`
- `expo-glass-effect`
- `expo-intent-launcher`
- `expo-keep-awake`
- `expo-live-photo`
- `expo-local-authentication`
- `expo-mail-composer`
- `expo-manifests`
- `expo-maps`
- `expo-media-library`
- `expo-mesh-gradient`
- `expo-navigation-bar`
- `expo-network`
- `expo-print`
- `expo-screen-capture`
- `expo-screen-orientation`
- `expo-sensors`
- `expo-server`
- `expo-sms`
- `expo-speech`
- `expo-splash-screen`
- `expo-store-review`
- `expo-symbols`
- `expo-system-ui`
- `expo-tracking-transparency`
- `expo-video-thumbnails`
- `expo-widgets`

## Suggested Next Step

The best next step is to turn this into an implementation matrix with these columns:
- package
- bucket
- current feature owner
- install command
- files to touch
- dependency / config notes

That will let us move from inventory to execution without losing the baseline.

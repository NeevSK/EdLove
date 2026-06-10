---
title: "Expo Router React Navigation Migration Guidance"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naveen"
scribe: "Antigravity"
tags: [expo-router, react-navigation, migration, codemod]
---

# Expo Router React Navigation Migration Guidance

This note captures the official Expo guidance that applies to the current `gurudevi-mobile` migration.

## Official Expo Guidance

Expo's SDK 56+ migration docs say:

- application-code imports from `@react-navigation/*` are no longer the preferred path inside Expo Router app code
- the SDK 56 migration step rewrites those imports to the matching `expo-router/*` entry points
- Expo provides a codemod for the import rewrite:
  - `npx expo-codemod sdk-56-expo-router-react-navigation-replace src`
- if the codemod cannot be used, the migration can be completed manually file by file

## What This Means For This Repo

- keep archived React Navigation files as references
- do not delete archived files that still document behavior
- remove or rewrite stale placeholder text from live source files
- prefer file-based Expo Router routes and layout shells for new runtime code
- continue to sweep for old app-code references to `@react-navigation/*` where they are still part of the live app

## Practical Migration Use

Use the codemod guidance as a verification pass, not as a blind rewrite:

- run the codemod only against live application code when necessary
- review the diff for any import paths that should remain in archived or test-only files
- keep legacy navigation helpers quarantined if they are still needed for non-runtime support code
- document any intentional exceptions instead of leaving ambiguous placeholder text in source


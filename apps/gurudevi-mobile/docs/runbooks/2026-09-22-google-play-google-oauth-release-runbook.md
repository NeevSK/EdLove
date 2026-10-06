---
title: "Google Play Verification, Signing, and Google OAuth Runbook"
status: "active"
created: 2026-09-22
author: "Naveen"
scribe: "Codex"
tags: [google-play, android, signing, oauth, release, sanctuary]
---

# Google Play Verification, Signing, and Google OAuth Runbook

## Scope

This runbook prepares the new Gurudevi Sanctuary Android application for
internal Play testing and Google sign-in. It does not alter the separate Edlove
product or publish a production release.

## Non-negotiable identity check

The Play Console package name, Expo `android.package`, Android signing records,
Google OAuth Android client, `assetlinks.json`, Sentry release name, and AAB
must use **the exact same package string**. Package names cannot be changed for
an already-created Play app.

The source candidate is `app.gurudevi.sanctuary`. Before signing or building,
visually confirm the exact package name in Play Console. In particular,
`sanctuary` and `sanctaury` are distinct, permanent package names.

## Why this matters now

- From September 30, 2026, Play packages must be registered for Android
  developer verification. Verify the registration card/status in Play Console.
- New Play submissions must target Android API 36 or higher from August 31,
  2026. Verify this in the generated release artifact before upload.
- The first release scope is web plus Android; native iOS remains deferred.

## Step 1 — Play Console account and app

1. Complete identity/contact verification for the Play developer account.
2. Create the new app using the confirmed package ID and record its Play Console
   URL; do not reuse the historical Gurudevi app listing.
3. On the Android developer verification page, confirm the new package is
   registered. A newly created Play app is normally registered automatically,
   but the status is the evidence.
4. Enroll in Play App Signing. Keep the upload key and the Play app-signing key
   distinct; neither private key belongs in the repository.
5. Save the **Play app-signing certificate SHA-256** in the secure release
   record. It is needed for production Android App Links and Google OAuth.

## Step 2 — EAS and Android build credentials

1. The Expo project is `@neevsk/gurudevi-sanctuary`; use its EAS build profiles.
2. Let EAS manage or securely reference the Android upload credential for this
   new package. Never reuse the former app's signing identity by assumption.
3. Build a debug APK first; verify its package with `aapt dump badging` before
   installing it.
4. Build a production AAB only after debug/device evidence and only when a
   Play internal-test upload is requested.
5. Keep build ID, version code, upload-certificate SHA-256, and Play
   app-signing SHA-256 in the release evidence packet.

## Step 2a — Android 16 / 2026 compatibility gate

Do this before an internal-track AAB, without changing native dependencies just
to satisfy a checklist:

1. Confirm the generated manifest/artifact has `targetSdkVersion=36`. New Play
   submissions require API 36 or higher as of August 31, 2026.
2. Run the Layer-1 journey on an Android 16 device or emulator. In particular,
   inspect authentication return, QR/App Link entry, keyboard/insets, modal
   layout, sign-out, relaunch, and back navigation. API 36 makes edge-to-edge
   mandatory and enables predictive back by default.
3. Exercise the same screens in split-screen and a tablet/foldable-sized
   window. On large screens, orientation, aspect-ratio, and resizability
   restrictions no longer control the resulting layout for API 36 apps.
4. Inspect the final AAB's 64-bit native libraries for 16 KB page-size
   alignment and test on a 16 KB Android emulator if native dependencies are
   included. Google Play will require this for relevant updates from February
   1, 2027; test now rather than discovering it during the next release.
5. Treat failed behavior as a product or dependency issue to fix. Do not add a
   permanent Android compatibility opt-out merely to make the release gate
   green.

## Step 3 — Android App Links

Publish `https://sanctuary.gurudevi.app/.well-known/assetlinks.json` with:

- package name equal to the confirmed Play package;
- production Play app-signing SHA-256 fingerprint; and
- the `/qr` route supported by the app manifest.

Verify anonymous HTTPS delivery, JSON content type/body, and an installed
Android device opening the intended route. Do not add a debug fingerprint to a
production file unless a deliberate development-app-link policy is approved.

## Step 4 — Google sign-in and Supabase

1. Create a Google OAuth Android client for the confirmed package plus the
   relevant signing SHA-256. Debug and Play-signed production builds need their
   own certificate registrations where applicable.
2. Create/use the Google web OAuth client required by Supabase and the existing
   native One-Tap setup. Store its client ID as
   `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` through the approved environment/secret
   workflow; a client ID is public, but credentials and client secrets are not.
3. Configure the Google provider in Supabase with the approved client
   credentials. The provider redirect endpoint is Supabase's OAuth callback;
   Sanctuary's final return is
   `https://sanctuary.gurudevi.app/auth/complete` and must be allowlisted in
   Supabase.
4. Do not enable iOS-specific Google values while native iOS is deferred.
5. Test: new Google account, existing Google account, provider cancellation,
   denied network, replayed callback, sign-out, and relaunch.

## Step 5 — Play listing and policy packet

Before internal testing, prepare:

- privacy-policy URL at `gurudevi.app`;
- Data safety declaration based on the actual build and every included SDK;
- account deletion in-app path and public deletion URL/process;
- content rating, app access/reviewer credentials, contact details, and
  screenshots; and
- AI disclosure/review for any AI-generated store assets or user-facing
  generative features.

The Data safety form must reflect what the released app actually collects or
shares—not what source code intends to use later. Payments are deferred for
this release and must not be represented as an available checkout capability.

## Step 6 — internal track and promotion

1. Upload the signed AAB to Play internal testing.
2. Add only named testers; collect crash, ANR, login, app-link, and recovery
   evidence.
3. Fix release-blocking findings, then use closed testing/staged rollout only
   after the Layer-1 evidence packet and fresh review.
4. Use Play Developer Publishing API automation only after the first listing is
   stable. It is optional; EAS/Play Console are sufficient for the first
   release.

## Required evidence

- Play developer verification and package-registration status;
- exact application ID and both signing-fingerprint records;
- resolved Expo config and generated Android manifest;
- AAB package/version/target API verification;
- deployed `assetlinks.json` retrieval and installed-device result;
- Google/Supabase configured-flow results and failure/recovery results;
- Play Data safety/deletion/reviewer-access completion; and
- G4 browser plus G5 Android evidence under the running-app plan.

## Sources

- Google Play package registration and developer verification, accessed
  2026-09-22: https://support.google.com/googleplay/android-developer/answer/16984799
- Android developer verification timeline, accessed 2026-09-22:
  https://developer.android.com/developer-verification
- Google Play target API requirements, accessed 2026-09-22:
  https://support.google.com/googleplay/android-developer/answer/11926878
- Google Play account deletion requirements, accessed 2026-09-22:
  https://support.google.com/googleplay/android-developer/answer/13327111
- Android 16 behavior changes, accessed 2026-09-22:
  https://developer.android.com/about/versions/16/behavior-changes-16
- Android 16KB page-size support, accessed 2026-09-22:
  https://developer.android.com/guide/practices/page-sizes

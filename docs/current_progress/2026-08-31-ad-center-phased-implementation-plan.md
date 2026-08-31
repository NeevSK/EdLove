---
title: "Phased Implementation Plan: Negentropy Ad Center & Rewarded Economy"
status: "active"
created: 2026-08-31
updated: 2026-08-31
author: "Naveen"
scribe: "Antigravity"
tags: [implementation, plan, monetization, ads, profile, gurudevi-mobile, sanctuary-api]
---

# Phased Implementation Plan: Negentropy Ad Center & Rewarded Economy

## Overview & Objective

This plan details the engineering execution for introducing the **Opt-In Rewarded Ad Center** ("Negentropy Reservoir") across `sanctuary-api`, `@repo/profile`, `@repo/payments`, and `apps/gurudevi-mobile`.

---

## 1. Phased Architecture Breakdown

```
Phase 1: Backend SSV & Ledger ──► Phase 2: Native Ad SDK & Plugins
                │                                 │
                ▼                                 ▼
Phase 3: Domain Hooks & Balance ──► Phase 4: UI/UX Profile Integration
                │                                 │
                ▼                                 ▼
       Phase 5: Anti-Abuse, Rate-Limiting & Verification Testing
```

---

### Phase 1: Database Schema & Server-Side Verification (SSV) Backend
* **Target Package:** `apps/sanctuary-api` / `packages/database` / `packages/schema`
* **Deliverables:**
  1. **Postgres / ZenStack Schema Additions:**
     ```prisma
     model UserEnergyBalance {
       userId      String   @id
       balance     Int      @default(0)
       totalEarned Int      @default(0)
       totalSpent  Int      @default(0)
       dailyCount  Int      @default(0)
       lastResetAt DateTime @default(now())
       updatedAt   DateTime @updatedAt
     }

     model AdRewardTransaction {
       id             String   @id @default(uuid())
       userId         String
       provider       String   // "admob", "ironsource"
       transactionId  String   @unique
       rewardAmount   Int
       verified       Boolean  @default(false)
       createdAt      DateTime @default(now())
     }
     ```
  2. **AdMob SSV Webhook Route (`/api/v1/rewards/admob-ssv`):**
     * Fetches and caches AdMob public verification keys (`gstatic.com/admob/reward/verifier-keys.json`).
     * Verifies ECDSA signature over incoming query parameters.
     * Enforces daily pacing limit (max 10 rewarded events per 24h).
     * Atomically credits `UserEnergyBalance` and registers `AdRewardTransaction`.

---

### Phase 2: Native Ad SDK Configuration & Expo 57 Plugin
* **Target Package:** `apps/gurudevi-mobile`
* **Deliverables:**
  1. **Add `react-native-google-mobile-ads`** to `apps/gurudevi-mobile/package.json` ensuring no conflicts with sacred versions in `AGENTS.md`.
  2. **Configure `apps/gurudevi-mobile/app.json`:**
     * Register `react-native-google-mobile-ads` with App IDs for iOS and Android.
     * Add `NSUserTrackingUsageDescription` for iOS App Tracking Transparency.
     * Verify prebuild compatibility (`npx expo prebuild --no-install`).
  3. **Ad Unit ID Environment Management:**
     * Manage test Ad Unit IDs vs. production Ad Unit IDs via Doppler environment variables.

---

### Phase 3: Domain Hooks & Client State Management
* **Target Package:** `@repo/profile` / `@repo/payments` / `@repo/core`
* **Deliverables:**
  1. **Type Definitions (`packages/profile/src/types/negentropy.ts`):**
     * `EnergyBalanceState`, `AdRewardEvent`, `EnergyTransactionHistory`.
  2. **Custom Hook `useRewardedAdHub` (`packages/profile/src/hooks/useRewardedAdHub.ts`):**
     * Controls native ad lifecycle: `RewardedAd.createForAdRequest(...)`.
     * Preloads ad instance on profile mount for instant playback.
     * Exposes reactive state: `isAdReady`, `isLoadingAd`, `dailyQuotaRemaining`, `cooldownSeconds`.
     * Integrates with `usePermissions()` to ensure child/minor profiles receive non-targeted, age-appropriate ads.
  3. **Local Cache Layer:**
     * Fast reads via Nitro MMKV with optimistic balance updates synced to backend API.

---

### Phase 4: UI/UX Componentry & Profile Screen Integration
* **Target Package:** `packages/profile`, `@repo/ui`
* **Deliverables:**
  1. **Profile List Item / Energy Widget:**
     * Embedded in `ProfileScreen.tsx` (`packages/profile/src/screens/ProfileScreen.tsx`).
     * Displays current energy balance with an animated glowing battery/flame icon.
  2. **Energy Reservoir Bottom Sheet Modal (`NegentropyHubModal.tsx`):**
     * Designed with rich Sanctuary glassmorphism, responsive tokens, and dark mode support.
     * Displays daily harvest quota (e.g. `4 / 10 completed`).
     * "Contribute Attention" action button with `BrandPulse` loading animation.
     * Audio/haptic confirmation on reward receipt (`hapticSuccess()`).
  3. **Cross-Platform Graceful Degradation (`.web.tsx`):**
     * On web platforms, renders a tailored fallback explaining mobile app ad rewards or web partner links.

---

### Phase 5: Verification, Anti-Abuse & End-to-End Testing
* **Deliverables:**
  1. **Unit & Hook Tests:**
     * Mock AdMob SDK lifecycle states in Vitest (`useRewardedAdHub.test.ts`).
  2. **SSV Webhook Cryptographic Verification Tests:**
     * Test valid signatures, invalid signatures, expired keys, and duplicate transaction replay attempts.
  3. **End-to-End Mobile Verification:**
     * Test ad loading, ATT permission handling, test video playback, and energy balance credit on Android & iOS test builds.

---

## Blast Radius & Guardrail Checklist

- [ ] `AGENTS.md` sacred dependency versions untouched.
- [ ] No direct manual edits to `android/` or `ios/` folders.
- [ ] Zero intrusive banner or interstitial ads in main application views.
- [ ] Strictly virtual in-app utilities (no cash-out or real money payouts).
- [ ] Automated rate limits (10 ads/day cap) enforced at both client and server layers.

---
title: "ADR: Rewarded Ad Center Compliance, App Store Policies & Security Governance"
status: "active"
created: 2026-08-31
updated: 2026-08-31
author: "Naveen"
scribe: "Antigravity"
tags: [monetization, ads, compliance, security, ssv, apple, google-play, ad-center]
---

# ADR: Rewarded Ad Center Compliance, App Store Policies & Security Governance

## Context & Motivation

To sustain the platform against operational and infrastructural entropy (server costs, LLM token costs, media streaming bandwidth), we require a monetization mechanism that generates revenue without contaminating the sacred, calm Sanctuary user experience with disruptive interstitial or banner advertisements.

An **Opt-in Rewarded Ad Center** ("Negentropy Hub" / "Energy Reservoir") allows users to voluntarily view sponsor media in exchange for in-app credits, AI execution fuel and profile achievements.

This document formalizes the regulatory compliance, app store policies, anti-fraud standards, and cryptographic verification specifications required to launch this system.

---

## 1. App Store & Platform Compliance Policies

### 1.1 Apple App Store (App Review Guidelines)
* **Guideline 3.2.2 (Unacceptable Business Models):**
  * *Rule:* Apps may not offer cash incentives or cash payouts for viewing ads, nor can they require users to download unrelated applications.
  * *Compliance Rule:* In-app rewards are strictly **virtual utility tokens** (e.g., *Sanctuary Energy*, *AI Tokens*, *Badges*, *Storage Unlocks*). No real-world currency conversions, fiat cash-outs, or third-party gift card redemptions are permitted.
* **Guideline 5.1.2 (Data Use & Sharing / App Tracking Transparency):**
  * *Rule:* Any collection of data for advertising tracking across third-party apps/websites requires explicit user opt-in via the `AppTrackingTransparency` (ATT) framework.
  * *Compliance Rule:* Gurudevi Mobile will prompt for ATT permissions transparently. If the user denies ATT tracking, the Ad SDK will strictly request **Non-Personalized Ads (NPA)** without breaking reward availability.
* **Guideline 1.3 (Kids Category / Educational Safety & COPPA):**
  * *Rule:* If the user is flagged as a student/minor under the age of 13/16 (or in classroom contexts), behavioral advertising and adult-targeted ad categories are legally prohibited.
  * *Compliance Rule:* Ad requests must pass `maxAdContentRating: G` and `tagForChildDirectedTreatment: true` when a user account represents a minor or when within school/classroom scopes.

### 1.2 Google Play Developer Policies
* **Rewarded Ads Policy:**
  * Users must have an explicit choice to view the ad before playback begins.
  * The specific reward must be clearly disclosed in the UI before user interaction.
  * Users must be able to close the ad at any time (though closing early forfeits the reward).
* **Deceptive Traffic Policy:**
  * No artificial encouragement of automated clicks or repeated invalid impressions.
  * Native ad rate-limiting and daily pacing caps are enforced on the client and server.

---

## 2. Security & Anti-Fraud Architecture: Server-Side Verification (SSV)

### 2.1 The Vulnerability of Client-Side Callbacks
In mobile ad implementations, relying solely on client-side reward completion callbacks (`onRewardedAdUserEarnedReward`) is vulnerable to decompilation, hook injection, or MITM API replay attacks where an attacker simulates reward events to generate infinite free credits.

### 2.2 Server-Side Verification (SSV) Standard
All rewarded ad credits must be validated through Google AdMob / Ad Network Server-Side Verification:

```
[User Device] ------------ Requests Rewarded Ad -----------> [AdMob SDK]
      |                                                             |
      | User finishes watching 30s ad                               |
      v                                                             v
[AdMob Network] -- Server-to-Server Webhook with ECDSA Signature -> [sanctuary-api]
                                                                    |
                                                          1. Verify Public Key
                                                          2. Check Trans ID (Replay Guard)
                                                          3. Rate Limit / Daily Cap
                                                          4. Increment User Balance
                                                                    |
[User Device] <--------- Push Sync / Live Query State ------------+
```

### 2.3 SSV Cryptographic Verification Protocol
1. **AdMob Webhook Parameters:** AdMob passes `ad_network`, `ad_unit`, `reward_amount`, `reward_item`, `timestamp`, `transaction_id`, `user_id`, and `signature` (SHA256withECDSA).
2. **Public Key Fetching:** `sanctuary-api` fetches Google's public keys from `https://gstatic.com/admob/reward/verifier-keys.json` with a 24-hour cache.
3. **Signature Verification:** Verify the signature against the query string.
4. **Idempotency & Replay Prevention:** `transaction_id` is indexed with a `UNIQUE` constraint in Postgres. Duplicate webhooks are rejected with `HTTP 200 OK` (idempotent ack) without re-crediting points.

---

## 3. Rate Limiting & User Privacy Guardrails

| Guardrail | Threshold | Action on Breach |
| :--- | :--- | :--- |
| **Daily Energy Cap** | 10 rewarded ads per 24h rolling window | UI transitions to "Reservoir Full (Recharging)" state |
| **Cooldown Period** | Minimum 45 seconds between consecutive ads | CTA button disabled with countdown timer |
| **IP / Geolocation Abuse** | >30 requests/hour from same subnet | Flagged for automated fraud review |
| **ATT Consent Refusal** | User denies iOS tracking | Request Non-Personalized Ads (`npa: '1'`) |

---

## Decision Outcome

* **Approved:** Implement an Opt-In Rewarded Ad Center in Gurudevi Mobile under the profile ecosystem.
* **Approved:** Use `react-native-google-mobile-ads` with native Expo 57 config plugins.
* **Enforced:** Virtual-only rewards, Server-Side Verification (SSV) with ECDSA validation, and child-safe content gating.

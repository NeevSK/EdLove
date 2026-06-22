---
title: "Web-Only Payments & Hexagonal Entitlements"
status: "active"
created: 2026-06-12
updated: 2026-06-12
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, architecture, payments, entitlement, security]
---

# Web-Only Payments & Hexagonal Entitlements

## Context & Problem Statement

Gurudevi Mobile requires a subscription model to support premium features (such as the AI Assistant). Traditionally, mobile subscriptions utilize Apple App Store In-App Purchases (IAP) and Google Play Billing, both of which enforce a **15%–30% platform transaction fee**. 

Additionally, integrating local payment methods specific to Sri Lanka (such as **PayHere** or direct bank transfers) natively within App Store and Play Store packages violates mobile store guidelines for digital goods, risking app rejection.

---

## Decision

To avoid platform fees and support local billing methods, we decided to implement the **Multi-Platform Service / Account-Only** subscription model.

1. **Web-Only Checkout**: Personal and Thuthimal (තුතිමල්) subscriptions are purchased exclusively on the web version of the application using **PayHere** or Stripe.
2. **Database Entitlements**: User subscription states are mapped directly to database attributes on the `User` table (`pricing_tier`, `is_thuthimal`, `thuthimal_gifter`, `thuthimal_gifted_at`).
3. **PowerSync Propagation**: The mobile client synchronizes these fields in real time via PowerSync.
4. **Hexagonal Implementation**: Instead of introducing vendor-specific SDKs (like RevenueCat), we implemented the clean hexagonal `IEntitlementPort` contract using `SupabaseEntitlementAdapter`.

---

## Technical Architecture & Nuances

### 1. Security & Signature Handshake
To prevent price tampering or fake checkout calls, the web payment flow uses a cryptographic signature check:
* The backend computes an MD5 signature derived from the merchant ID, unique order ID, amount, currency, and private merchant secret:
  $$\text{MD5}(\text{merchant\_id} + \text{order\_id} + \text{payhere\_amount} + \text{payhere\_currency} + \text{status\_code} + \text{MD5}(\text{merchant\_secret}))$$
* The Hono API endpoint `/payments/payhere-webhook` validates the signature before updating user tables.

### 2. App Store Compliance ("Anti-Steering")
Apple and Google guidelines strictly prohibit "steering" users to external payment sites. To remain fully compliant:
* The mobile app contains **no checkout links, upgrade buttons, or price labels**.
* Non-premium users attempting to access features like the AI Assistant are stopped by a `PremiumGuard` that states: *"This feature is available to PRO members. Please contact your school administrator or log in to a pre-activated account."*

### 3. Hexagonal Abstraction
We created `SupabaseEntitlementAdapter` inside `@repo/core` implementing `IEntitlementPort`. This adapter connects the UI logic to the state of the user's Zustand auth store, which is hydrated from the offline-first database. This design isolates the UI from how the billing actually occurs.

---
name: nitro-google-signin
description: "Master director for Nitro Google Sign-In in React Native/Expo. Use when implementing Google Sign-In, One Tap, Credential Manager, SHA-1 OAuth setup, or native config plugins."
---

# Nitro Universal Google Sign-In Director

Hierarchical entry point for high-performance Google Sign-In powered by `react-native-nitro-google-signin` and Nitro Modules.

## Progressive Disclosure Router

All deep specifications are quarantined in `vendor/nitro-google-signin/` to preserve context budget. Consult on-demand:

| Task Intent | Target Specification | Key Invariants & Rules |
| :--- | :--- | :--- |
| **API Reference & Hooks** | [`../vendor/nitro-google-signin/reference.md`](../vendor/nitro-google-signin/reference.md) | `useGoogleSignIn()`, `GoogleOneTapSignIn`, credential recovery |
| **Code Examples & Flows** | [`../vendor/nitro-google-signin/examples.md`](../vendor/nitro-google-signin/examples.md) | Standard Sign-In, One Tap modal, silent auth refresh |
| **Native Setup & Config** | [`../vendor/nitro-google-signin/SKILL.md`](../vendor/nitro-google-signin/SKILL.md) | SHA-1 finger-printing, `google-services.json`, iOS URL schemes |

## Invariants
1. Prefer Credential Manager One Tap over legacy webview auth.
2. Ground all native JSI bindings in `react-native-nitro-modules`.


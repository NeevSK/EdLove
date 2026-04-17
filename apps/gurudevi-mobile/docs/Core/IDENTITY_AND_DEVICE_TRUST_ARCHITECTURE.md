# Gurudevi sanctuary: Identity, Device Trust, & Phased Local Protection

This document explains the security direction for shared-device account support in Gurudevi, with the current implementation explicitly separated from the stronger long-term target.

## 1. April 2026 decision

We are keeping the overall direction, but shipping it in two phases.

### Phase 1: shared-device multi-account with prototype local protection
This is the phase we are actively implementing now.

* Multiple real user accounts can live on one phone, tablet, or browser.
* One account is active at a time.
* Sessions, persisted stores, and device-local state are scoped per account.
* A simple local **App PIN** can be attached to an account on a device.
* The PIN protects switching into a protected account and re-opening the app on that device.
* This phase does **not** claim full cryptographic local vault protection.

### Phase 2: hardened zero-trust local vaults
This remains the target architecture after the base shared-device model is stable.

* Physical per-account storage partitions.
* Real KEK/DEK envelope encryption.
* Recovery and escrow flows with a true server trust boundary.
* Stronger remote device trust enforcement and wipe/revoke orchestration.

**Decision:** continue implementation, but describe the current system honestly as Phase 1.

## 2. Journey of the identity architecture

### Generation 1: the monolith
Initially, the application assumed a simple `Device -> User` mapping.

* Zustand persisted data globally through one shared storage space.
* This was easy to build, but unsafe for family devices.
* A child using a parent’s device could inherit the wrong local context and act on another person’s account.

### Generation 2: logical tenant prefixing
The platform evolved into a shared-device architecture.

* Storage keys became account-aware.
* A local device account registry tracked multiple remembered accounts.
* This solved the most obvious single-user assumptions, but local isolation was still mostly logical rather than physically enforced.

### Generation 3: zero-trust local vaults
This is still the architectural target, not the current guarantee.

* The app stops assuming that an unlocked device is automatically safe for every remembered account.
* Local account access becomes a separate trust boundary from cloud authentication.

## 3. Why Phase 1 is still the right move

For the real Sri Lankan family/shared-device scenario, the immediate risks are:

* two or more learners sharing one family phone,
* internet connectivity being unstable,
* accidental access to the wrong sibling’s local state,
* stale offline state leaking between accounts,
* and account switching without a second consent step.

Phase 1 addresses those product and privacy problems first, while keeping the system extensible toward stronger hardening later.

It now also includes a minimal backend contract:

* device installs register themselves in `device_registry`,
* current accounts link into that install through `device_accounts`,
* the app can read a simple trusted/untrusted flag for the linked device,
* and security-sensitive account/device events can be written to `security_audit_logs`.

That contract is intentionally modest. In Phase 1 it supports coordination, auditability, and future enforcement, but it does not yet claim full remote lock or remote wipe authority over every local artifact on the device.

## 4. Phase 1 security model

Phase 1 is intentionally simple and honest.

### What Phase 1 protects well

* Multiple independent Gurudevi accounts can stay on one device.
* Local persisted state is scoped per account, reducing cross-account leakage.
* A per-account **App PIN** creates a second local consent step for protected accounts.
* Account switching and PIN verification work even during poor connectivity because they happen on-device.

### What Phase 1 does not claim

* Full offline-at-rest cryptographic secrecy.
* Recovery-grade encrypted vaults.
* Strong server-side escrow guarantees.
* Secure enclave-backed encrypted account partitions.

### Why the PIN still matters in Phase 1

The App PIN is not pretending to be enterprise crypto. It is a practical prototype protection layer:

* it slows down casual sibling or family-member access on a shared device,
* it gives each remembered account a lightweight local boundary,
* and it lets us validate real usage before investing in more complex vault cryptography.

## 5. Phase 2 target model: KEK / DEK envelope

Phase 2 introduces a stronger local vault model.

### Master DEK

When a physical `Account_ID` is first mapped to a `Device_ID`, the client generates a random per-install `Master DEK`.

* That DEK becomes the true local vault key.
* Physical account storage can then be mounted with that DEK.

### Key wrappers

The `Master DEK` should be unlockable through multiple wrappers:

1. **App PIN**
   A PIN-derived KEK wraps the `Master DEK`.

2. **Offline recovery path**
   A recovery secret or answer can wrap the same `Master DEK`.

3. **Biometric override**
   The device enclave/keystore can store a recovery-friendly wrapper for trusted local access.

### Why not use the PIN directly as the vault key

If the raw PIN were the actual database key, changing the PIN would require mass decryption and re-encryption of the whole local vault. Wrapping a stable `Master DEK` avoids that.

## 6. Cloud recovery and escrow

True local encryption introduces a painful tradeoff: if local recovery material is lost while the device stays offline, local encrypted work can become unreadable.

The target recovery approach is:

* keep the local vault per device install,
* escrow recovery material in the cloud,
* and only restore it through a real server-side trust boundary.

This is a Phase 2 concern. Phase 1 does not promise recovery-grade cryptographic escrow.

## 7. Platform compatibility

The design must work across Android, iOS, and web/laptop usage.

* **Android** should eventually use Android Keystore-backed protection where appropriate.
* **iOS** should eventually use Keychain / Secure Enclave-backed protection where appropriate.
* **Web/Desktop** relies more heavily on account scoping, browser-local storage discipline, and cloud identity controls.
* A user with multiple devices should still have distinct local account protection per physical install.

## 8. Passkeys vs. Gurudevi local protection

Passkeys and local account protection solve different problems.

| Feature | Passkeys | Gurudevi local account protection |
| :--- | :--- | :--- |
| Primary goal | Authenticate to the server | Protect remembered accounts on a shared device |
| Shared-device behavior | Good for login | Better for local family-device separation |
| Offline usefulness | Limited | Important for shared-device local switching |
| Current phase | Optional future auth enhancement | Active Phase 1 implementation |

**Verdict:** Passkeys can eventually help with the front door. Shared-device local protection is about the room inside the house.

## 9. Architectural harmony

This was designed to fit the patterns already in the codebase rather than forcing a rewrite.

* Device accounts plug into the existing auth/session flow.
* Persisted stores are scoped per account.
* Shared-device UI entry points live where users already expect them: mobile profile and web app settings.
* Account logout, removal, and switching stay aligned with the current navigation model.

## 10. Phase 1 checklist

These are the non-negotiable pieces for Phase 1:

* Per-account auth session storage on device.
* Per-account persisted Zustand scope.
* Safe account switch that resets and rehydrates local state.
* Add-account UI on mobile and web.
* Simple local PIN set/change/remove flow per account.
* PIN verification on switch and app re-open for protected accounts.
* Device registration, account-device linking, trust lookup, and audit logging APIs.

These remain Phase 2:

* Real KEK/DEK envelope encryption.
* Physically encrypted local vault guarantees.
* Recovery escrow with a real server-side key boundary.
* Strong device-trust APIs enforcing remote revoke / wipe behavior.

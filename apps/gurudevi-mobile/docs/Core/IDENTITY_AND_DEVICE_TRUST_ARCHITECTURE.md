# Gurudevi Sanctuary: Identity, Devices, Trust, Sessions, and Phased Local Protection

This document is the source-of-truth for how Gurudevi should think about devices, shared-device account access, device trust, session visibility, local protection, and future institutional device management.

It is intentionally written in two voices at once:

* **honest present-state**: what is actually implemented now,
* **clear future direction**: what we are designing toward, without pretending it already exists.

The goal is to reduce architecture drift, prevent memory loss between implementation sessions, and give future contributors a stable map of what is short-term, what is long-term, and what is explicitly deferred.

---

## 1. April-May 2026 positioning

We are not building "just login."

We are building a platform that must eventually support:

* one learner on one personal device,
* one adult sharing a family phone with multiple children,
* one user using mobile + tablet + laptop/browser,
* one school distributing officially authorized devices,
* one institution needing audit, trust, and revocation controls,
* and offline or unstable-network realities.

That means the correct domain is larger than authentication alone.

The architecture must treat the following as separate but related concerns:

* **identity**: who the person/account is,
* **device**: what physical install/browser/app instance is being used,
* **session**: what authenticated presence is currently active or recently active,
* **trust**: how much the platform trusts that device/session for that account or institution,
* **local protection**: what prevents casual access on a shared device,
* **audit**: what security-sensitive events happened and when,
* **enrollment**: how institutions officially authorize devices.

---

## 2. Current delivery posture

We are shipping this architecture in phases.

### Phase 1: shared-device multi-account with prototype local protection

This is the phase we are actively implementing now.

* Multiple real user accounts can live on one phone, tablet, or browser.
* One account is active at a time.
* Sessions, persisted stores, and device-local state are scoped per account.
* A simple local **App PIN** can be attached to an account on a device.
* The PIN protects switching into a protected account and re-opening the app on that device.
* The backend can register a device install, link an account to a device, read simple trust state, and write security audit events.
* This phase does **not** claim full cryptographic vault protection.
* This phase does **not** yet provide a proper user-facing "trusted devices and login history" experience.

### Phase 2: hardened zero-trust local vaults and stronger remote control

This remains the target architecture after the base shared-device model is stable.

* Physical per-account local vaults.
* Real KEK/DEK envelope encryption.
* Stronger trust posture than a binary trusted/untrusted flag.
* Recovery and escrow flows with a true server trust boundary.
* Real session inventory and session revocation UX.
* Remote revoke / lock / wipe orchestration where technically enforceable.
* School-managed or institution-managed device enrollment and policy.

**Decision:** continue implementation, but describe the current system honestly as Phase 1.

---

## 3. What is actually implemented today

The present system already contains important foundation pieces.

### Client-side foundation

The current code already includes:

* device-local multi-account registry,
* per-account stored auth session tokens,
* account-scoped persisted state,
* account switching with reset + rehydrate behavior,
* local per-account App PIN flows,
* a shared-device account UI surface in profile/settings,
* device trust API client calls,
* audit event writes for account/device actions.

### Backend foundation

The current schema direction already includes:

* `device_registry`
* `device_accounts`
* `security_audit_logs`

and Phase 1 RPC/API support for:

* device registration,
* account-device linking,
* trust lookup,
* trust touch/update,
* audit logging.

### Important honesty clause

What is **not** yet implemented end-to-end:

* a user-visible trusted devices screen,
* a user-visible login/logout/session history screen,
* a revoke-device experience,
* a sign-out-other-sessions experience,
* school device enrollment and management,
* cryptographic local vault protection,
* remote wipe/revoke enforcement,
* strong anomaly detection.

The current UI is primarily **"shared device accounts on this device"**, not **"all my trusted devices and security history everywhere."**

---

## 4. Journey of the architecture

### Generation 1: the monolith

Initially, the application assumed a simple `Device -> User` mapping.

* Zustand persisted data globally through one shared storage space.
* This was easy to build, but unsafe for family devices.
* A child using a parent's device could inherit the wrong local context and act on another person's account.

### Generation 2: logical account scoping

The platform evolved into a shared-device architecture.

* Storage keys became account-aware.
* A local device account registry tracked multiple remembered accounts.
* This solved the most obvious single-user assumptions.
* However, local isolation remained mostly logical rather than physically enforced.

### Generation 3: zero-trust local vaults

This is still the architectural target, not the current guarantee.

* The app stops assuming that an unlocked device is automatically safe for every remembered account.
* Local account access becomes a separate trust boundary from cloud authentication.
* The local device becomes a security domain that can be individually trusted, challenged, restricted, or revoked.

---

## 5. Why Phase 1 is still the right move

For the real Sri Lankan family/shared-device scenario, the immediate risks are:

* two or more learners sharing one family phone,
* internet connectivity being unstable,
* accidental access to the wrong sibling's local state,
* stale offline state leaking between accounts,
* and account switching without a second consent step.

Phase 1 addresses those product and privacy problems first, while keeping the system extensible toward stronger hardening later.

It now also includes a minimal backend contract:

* device installs register themselves in `device_registry`,
* current accounts link into that install through `device_accounts`,
* the app can read a simple trusted/untrusted flag for the linked device,
* and security-sensitive account/device events can be written to `security_audit_logs`.

That contract is intentionally modest. In Phase 1 it supports coordination, auditability, and future enforcement, but it does not yet claim full remote lock or remote wipe authority over every local artifact on the device.

---

## 6. The six-domain model

To keep this architecture clean, devices should not be treated as just a random auth feature. The system should be modeled across six related domains.

### 6.1 Identity domain

This answers: **who is the person/account?**

Examples:

* student,
* teacher,
* parent,
* school admin,
* founder/admin,
* guest/anonymous user.

Identity is the human/account boundary, not the device boundary.

### 6.2 Device domain

This answers: **what install or physical/browser endpoint is this?**

Examples:

* a family Android phone,
* an iPad used by a teacher,
* a student Chromebook browser install,
* a school-owned lab tablet,
* a personal laptop browser.

The device domain should eventually hold:

* install ID,
* server device ID,
* platform,
* model/browser family,
* app version,
* ownership/management class,
* trust posture,
* last seen / last accessed,
* enrollment source.

### 6.3 Account-device relationship domain

This answers: **which accounts are remembered or linked on which device?**

Examples:

* two siblings on one mother's phone,
* one teacher on mobile + tablet + browser,
* a temporary student login on a school kiosk,
* a delegated parent/guardian flow.

This is not the same thing as identity and not the same thing as session.

### 6.4 Session domain

This answers: **what authenticated presence is currently or recently active?**

Examples:

* active mobile session,
* stale browser session,
* just-signed-in Chrome session,
* revoked refresh token session,
* short-lived kiosk session.

Session inventory is what eventually powers "recent sign-ins," "active sessions," and "sign out other devices."

### 6.5 Trust domain

This answers: **how much should the system trust this device or session?**

Examples:

* new device,
* low-confidence browser,
* personal trusted phone,
* school-managed trusted tablet,
* revoked or suspicious device.

### 6.6 Audit domain

This answers: **what happened, when, for whom, and from where?**

Examples:

* device registered,
* account linked,
* account switched,
* PIN changed,
* QR login approved,
* session revoked,
* device marked lost,
* sign-in from new browser,
* admin changed device trust state.

---

## 7. Phase 1 security model

Phase 1 is intentionally simple and honest.

### What Phase 1 protects well

* Multiple independent Gurudevi accounts can stay on one device.
* Local persisted state is scoped per account, reducing cross-account leakage.
* A per-account **App PIN** creates a second local consent step for protected accounts.
* Account switching and PIN verification work even during poor connectivity because they happen on-device.
* The backend starts building an auditable account-device graph.

### What Phase 1 does not claim

* Full offline-at-rest cryptographic secrecy.
* Recovery-grade encrypted local vaults.
* Strong server-side escrow guarantees.
* Secure enclave-backed encrypted account partitions.
* Strong device revocation enforcement.
* Institution-grade device policy enforcement.

### Why the PIN still matters in Phase 1

The App PIN is not pretending to be enterprise crypto. It is a practical prototype protection layer:

* it slows down casual sibling or family-member access on a shared device,
* it gives each remembered account a lightweight local boundary,
* it validates real usage patterns,
* and it buys product safety now while the deeper cryptographic path remains future work.

---

## 8. Why "trusted devices" should not stay binary forever

In Phase 1, `is_trusted` is acceptable as a minimal contract.

In the longer run, that is too shallow.

The future system should likely move toward a richer trust posture such as:

* `unknown`
* `new`
* `normal`
* `elevated`
* `managed`
* `restricted`
* `revoked`

and pair that with policy metadata such as:

* personal vs family-shared vs school-managed,
* passkey-backed vs password-only,
* allowed offline access,
* allowed to retain local data,
* step-up auth required for sensitive actions,
* allowed to switch multiple local accounts,
* institutionally approved vs self-registered.

This is closer to modern industry direction than a simple yes/no device trust flag.

---

## 9. Sessions are a separate domain from remembered accounts

This distinction is important and easy to blur.

### Remembered account on device

This means:

* the device knows about the account,
* the device may have locally stored session material,
* the user may be able to switch into that account,
* the local device may show that account in shared-device UI.

### Active or recent session

This means:

* the account authenticated recently,
* a valid server-side or refreshable auth presence exists,
* the system can reason about recent sign-in activity,
* the user may need to revoke that session independently.

These must not be conflated.

A future proper session UX should distinguish:

* **remembered on this device**
* **currently active**
* **recently active**
* **revoked**
* **expired**

---

## 10. Shared-device scenarios we must support

### Family-shared device

Examples:

* siblings sharing a mother's phone,
* parent and child both using the same tablet.

Needs:

* multiple remembered accounts,
* local PIN per account,
* very clear account-switch UX,
* safe state reset when switching,
* offline-capable switching.

### Multi-device single user

Examples:

* same user on phone + tablet + laptop/browser.

Needs:

* session inventory,
* trusted device list,
* revoke specific device/session,
* consistent naming of devices,
* visibility into recent activity.

### School-managed devices

Examples:

* classroom tablets,
* library/shared student terminals,
* teacher devices,
* office/admin terminals.

Needs:

* institutional enrollment,
* device ownership class,
* school-level authorization,
* restricted policy profiles,
* audit visibility for admins,
* temporary vs persistent session rules.

### Semi-public or supervised access points

Examples:

* front desk kiosk,
* admissions kiosk,
* classroom sign-in station.

Needs:

* temporary sessions,
* minimal local data retention,
* strong timeout/logout behavior,
* clear revocation behavior,
* optional QR approval flows.

---

## 11. QR login and device-linking flows

QR should be treated as a family of flows, not one vague feature.

### Flow A: add this account to this shared device

Use case:

* user is already authenticated on a trusted device,
* wants to add the same account to a family/shared device,
* avoids typing passwords in difficult contexts.

Pattern:

* new/shared device creates a short-lived challenge,
* trusted device scans/approves,
* server issues a one-time link,
* shared device receives a valid account link/session.

### Flow B: temporary login to school device

Use case:

* learner or teacher needs temporary access on a school-owned device.

Pattern:

* school device displays QR challenge,
* personal trusted device approves it,
* school device gets a short-lived restricted session,
* no long-term remembering unless policy allows.

### Flow C: approve a sensitive action

Use case:

* approve sign-in from a new browser,
* approve trust escalation,
* approve device enrollment.

Pattern:

* challenge displayed or initiated,
* trusted device confirms,
* server records audit + issues step-up approval.

### Security rule for QR

QR should not be a raw bearer token if we can avoid it.

Prefer:

* short-lived challenge IDs,
* one-time use,
* audience/device-bound approval,
* strict expiry,
* audit trail,
* optional step-up confirmation.

---

## 12. Passkeys, biometrics, and local protection

These solve different layers of the problem.

| Capability | Primary purpose | Where it helps |
| :--- | :--- | :--- |
| Passkeys | authenticate to backend | sign-in, phishing resistance, strong auth |
| Biometrics | local unlock or step-up | faster trusted local access on owned devices |
| App PIN | lightweight local boundary | shared-device family protection |
| Device trust | policy/risk context | decide what this device is allowed to do |
| Session inventory | visibility/revocation | manage active and past access |

**Verdict:** passkeys help the front door. Local device protection helps the rooms inside the house. Both matter, but they are not substitutes for each other.

---

## 13. Can ZKP help here?

Potentially yes, but with careful restraint.

### Where ZKP-style techniques may eventually be useful

Possible future uses:

* proving possession of a recovery secret without revealing it directly,
* privacy-preserving approval or credential presentation,
* institution-issued attestations where the verifier should not learn unnecessary user details,
* higher-trust device or guardian authorization flows,
* selective disclosure identity credentials in a school or compliance-heavy context.

### Where ZKP is probably unnecessary in the short term

It is **not** the first thing we need for:

* shared-device account switching,
* trusted-device list UI,
* session inventory,
* audit logs,
* account removal from device,
* simple QR account-linking,
* institution-managed device enrollment basics.

### Guidance

Do not reach for ZKP to compensate for missing foundations.

First build:

* explicit device identity,
* explicit session inventory,
* explicit trust policy,
* explicit auditability,
* and strong local vault boundaries where required.

Then, if a real privacy-preserving proof problem appears, evaluate ZKP as a targeted capability rather than a blanket architecture theme.

**Recommendation:** treat ZKP as a future specialized enhancement, not a Phase 1 or short-term dependency.

---

## 14. Package and boundary direction

### Short-term recommendation

Do **not** split this into a fully separate package immediately.

Instead:

* keep shared device logic in `@repo/core`,
* make the device/security/session area a clearer domain inside `packages/core/src/device/` or an equivalent focused structure,
* keep UI rendering in `packages/ui`, `packages/profile`, or future admin packages,
* keep authoritative trust and audit behavior in backend infrastructure.

### Why this is the right near-term move

This respects the existing project pattern:

* `@repo/core` already contains device account and trust logic,
* UI packages are already thin surfaces,
* backend trust/audit state already lives in database and RPCs.

### Longer-term split trigger

Create a dedicated package such as `@repo/device` or `@repo/security-device` when the domain becomes broad enough to justify it, for example when it includes:

* QR device-linking flows,
* session inventory,
* managed-device enrollment,
* admin policy models,
* passkey/device approval orchestration,
* remote revoke or wipe orchestration,
* multiple clients with substantial shared device-domain logic.

---

## 15. Recommended module shape

Within the shared domain, the architecture should gradually stabilize toward:

### Client shared domain

Possible structure:

* `device/registry`
* `device/trust`
* `device/audit`
* `device/sessionBroker`
* `device/qrLinking`
* `device/localProtection`
* `device/enrollment`

### UI surfaces

User-facing:

* Shared Device Accounts
* Trusted Devices
* Recent Sign-ins
* Security Activity

Admin-facing:

* Institution Devices
* Device Enrollment
* Managed Device Audit
* Device Policy Exceptions

### Backend authority

Eventually:

* RPCs or service endpoints for list/revoke actions,
* policy-aware trust evaluation,
* institution device ownership,
* session inventory and revocation,
* event stream or auditable security ledger behavior.

---

## 16. Data model direction

This is directional, not a final schema contract.

### Already present foundation

* `device_registry`
* `device_accounts`
* `security_audit_logs`

### Likely future additions

#### `auth_sessions` or equivalent session inventory

Purpose:

* show active/recent sessions,
* revoke specific sessions,
* distinguish browser vs mobile vs temporary sessions.

Likely fields:

* `session_id`
* `account_id`
* `device_id`
* `session_type`
* `created_at`
* `last_seen_at`
* `revoked_at`
* `revocation_reason`
* `auth_strength`
* `ip_hash` or region metadata if appropriate

#### `device_enrollments`

Purpose:

* capture institution/school authorization state.

Possible fields:

* `device_id`
* `institution_id`
* `enrollment_type`
* `enrolled_by`
* `enrolled_at`
* `status`
* `policy_profile`

#### `device_policies`

Purpose:

* attach allowed behaviors to trust posture or institutional management.

Possible fields:

* `allow_offline_access`
* `allow_multiple_accounts`
* `allow_local_persistence`
* `requires_step_up_for_sensitive_actions`
* `session_ttl_policy`
* `managed_mode`

---

## 17. User-facing UX direction

### Short-term stable user UX

Users should eventually be able to see:

* accounts remembered on this device,
* whether this current device is trusted,
* last activity for this device/account link,
* recent sign-ins or recent sessions,
* warning when a new device or browser is detected,
* option to sign out this device,
* option to sign out all other sessions,
* option to remove a remembered account from this device.

### School/admin UX

Admins should eventually be able to see:

* devices enrolled to their school,
* current trust or management state,
* recent device-related security events,
* temporary vs permanent device assignments,
* revoke or restrict actions,
* suspicious access events.

---

## 18. Industry standards and direction

The design should stay compatible with where the industry is going:

* passkeys for strong primary authentication,
* explicit session inventories,
* device-bound or revocable refresh/session material,
* risk-based trust rather than only binary trust,
* auditability for institutional environments,
* step-up approval for sensitive actions,
* selective disclosure or ZKP only where a real privacy-preserving proof problem exists,
* zero-trust assumptions for shared or semi-managed devices.

We should follow standards where possible without blindly cargo-culting enterprise patterns that do not match our user reality.

---

## 19. Platform compatibility

The design must work across Android, iOS, and web/laptop usage.

### Android

Long-term direction:

* Android Keystore-backed wrappers where appropriate,
* stronger local secret storage,
* optional biometric unlock support,
* better enforcement for managed device policies where feasible.

### iOS

Long-term direction:

* Keychain / Secure Enclave-backed wrappers where appropriate,
* biometric unlock support,
* stronger OS-backed storage guarantees.

### Web / browser / laptop

Web has a different trust model.

* browser-local storage is weaker than native secure stores,
* multi-browser and incognito patterns behave differently,
* session inventory and risk-based trust matter more,
* device trust on web is often "install/browser confidence" rather than true hardware identity.

### Cross-device reality

A user with multiple devices should still have distinct local protection and distinct trust/sessions per install.

---

## 20. Phase 2 target model: KEK / DEK envelope

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

---

## 21. Cloud recovery and escrow

True local encryption introduces a painful tradeoff: if local recovery material is lost while the device stays offline, local encrypted work can become unreadable.

The target recovery approach is:

* keep the local vault per device install,
* escrow recovery material in the cloud,
* and only restore it through a real server-side trust boundary.

This is a Phase 2 concern. Phase 1 does not promise recovery-grade cryptographic escrow.

---

## 22. What we are explicitly not doing yet

To avoid architecture confusion, the following are intentionally deferred unless priorities change:

* full enterprise MDM-style remote device control,
* guaranteed remote wipe of all offline local artifacts,
* fully cryptographic local vault separation,
* cross-institution trust federation,
* ZKP-heavy identity stack,
* rich anomaly/risk engine,
* complex browser fingerprint trust scoring,
* advanced delegated device ownership workflows,
* institution-wide device compliance dashboards.

These are valid future areas, but they should not be smuggled into Phase 1 through vague language.

---

## 23. Short-term stable version: end-to-end implementation task list

This section is the actionable delivery plan for the next stable version.

### A. Domain consolidation

* Create or normalize a clearer device domain structure inside `packages/core`.
* Separate client responsibilities into device registry, trust, audit, session, QR, and local protection modules where possible.
* Remove accidental spreading of device concerns across unrelated auth/UI files.

### B. Read APIs we still need

* Add API to list devices linked to the current account.
* Add API to list recent security audit events for the current account.
* Add API to list active/recent sessions for the current account.
* Add API to revoke/remove a linked device or session.
* Add API to mark a device as trusted/untrusted where policy allows.

### C. User-facing UI we still need

* Build a **Trusted Devices** screen.
* Build a **Recent Sign-ins / Security Activity** screen.
* Show current device trust status and last activity.
* Show recent device/account/session events in understandable language.
* Add "Sign out other sessions" UX.
* Add "Remove this remembered account from this device" UX where it is still missing or fragmented.

### D. Shared-device UX hardening

* Ensure account switching always resets and rehydrates all scoped state correctly.
* Ensure PIN-protected accounts consistently challenge on switch and app reopen.
* Ensure anonymous/guest behavior cannot leak into remembered real-user account context.
* Verify offline switching behavior carefully.

### E. Audit and observability

* Define canonical device/security event names.
* Ensure all sensitive device/account/session actions write audit events.
* Add test coverage that verifies expected audit events are emitted.
* Make event payload shapes consistent and documented.

### F. Session model stabilization

* Decide how much session inventory lives in Supabase auth vs platform-owned tables.
* Introduce explicit session read models if current auth infrastructure is insufficient for UX needs.
* Define semantics for active, recent, expired, revoked, and remembered.

### G. QR foundation

* Design QR challenge/approval flow for account add-on-shared-device.
* Design short-lived kiosk/school-device QR login separately.
* Ensure one-time, expiring, auditable challenge semantics.
* Do not ship QR as a raw long-lived bearer token shortcut.

### H. School/institution readiness

* Add device ownership/management classification in schema direction.
* Define institution enrollment concept even if UI ships later.
* Define which device policies matter first for schools.
* Design admin audit visibility requirements.

### I. Documentation and governance

* Keep this document current when device scope changes.
* Add references from auth and platform architecture docs back to this file.
* Document any new schema/API/event contracts as part of implementation, not after the fact.

---

## 24. Suggested order of implementation

If we want the shortest path to a stable, credible version:

1. consolidate the device domain in `@repo/core`
2. add read APIs for devices, sessions, and audit events
3. build user-facing trusted devices + security activity screens
4. add revoke/sign-out-other-sessions actions
5. harden account switch and PIN reopen flows
6. design QR flows properly
7. prepare school-managed device concepts
8. only then deepen into vault cryptography or advanced trust posture

---

## 25. Final principle

Passkeys, QR, device trust, session history, local PINs, and possible future ZKP enhancements are not isolated gimmicks.

They are all parts of one deeper question:

**How does Gurudevi let the right human access the right account, from the right device, with the right amount of trust, while protecting family privacy, institutional safety, and offline usability?**

Phase 1 answers that imperfectly but honestly.

That honesty is a strength.

The correct next move is not to pretend we already have a full trusted-device platform. The correct next move is to keep the architecture explicit, stable, and incrementally build the missing end-to-end surfaces on top of the foundation already in place.

---

## 26. Offline, idempotency, and soft-deletion posture

Sri Lankan connectivity realities matter here. Device-security flows cannot assume perfect internet, and we should not treat "sign out", "revoke", or "unlink" as online-only luxuries.

### Local-first rule

For shared-device safety, the local device outcome is authoritative first.

Examples:

* if a user signs out on a weak or missing connection, the account must disappear locally immediately,
* if a PIN-protected sibling account is removed from the device, it must stop being locally available immediately,
* if the current device is no longer trusted for a current account, local access should respect the local policy immediately.

The server should catch up. It must not be the gate that decides whether the shared device is safe right now.

### Durable security intent rule

Every security-sensitive mutation that matters beyond local storage should be representable as a durable replayable intent.

Examples:

* unlink device from account,
* revoke one security session,
* revoke other security sessions,
* revoke current-install sessions after local sign-out,
* append a security audit event.

If the request cannot reach the backend immediately, it should move into a persistent outbox and retry later with the same semantic meaning.

### Replay-safe server rule

The backend should assume retries and duplicate delivery will happen.

That means:

* revoking an already revoked session should be safe,
* unlinking an already unlinked device should be safe,
* audit writes should support deduplication through an idempotency key,
* no security mutation should rely on exactly-once delivery from the client.

### Soft-state over destructive delete

For device links and session state, we prefer state transitions over immediate destructive deletion.

Examples:

* `device_accounts.link_status = 'active' | 'unlinked'`
* `unlinked_at`, `unlink_reason`, `unlinked_by`
* `account_security_sessions.status = 'active' | 'revoked'`
* `revoked_at`, `revoke_reason`

This preserves auditability, improves replay safety, and gives admin/institution features a better future base.

### Append-only audit rule

Security history should be append-only in normal operation.

Audit rows should:

* survive retries without duplication when an `idempotency_key` is provided,
* describe what happened even if the local mutation occurred earlier while offline,
* remain separate from UI-only local pending state.

### Honest UX rule

The UI should distinguish:

* local action completed,
* server sync pending,
* server sync complete,
* and server sync needs attention.

That is more trustworthy than pretending every security action finished globally the moment the user tapped it.

---

## 27. Short-term stable offline hardening plan

The short-term stable version should now include the following hardening work in addition to the earlier feature list.

### A. Queue-backed security intents

* Route device unlink, session revoke, and current-install revoke through the persistent mutation outbox.
* Use deterministic idempotency keys for those intents.
* Surface pending security sync state in the UI.

### B. Soft-state device links

* Stop hard-deleting `device_accounts` during normal unlink flows.
* Mark links as unlinked and filter read models to active links only.
* Allow re-link flows to reactivate an unlinked record cleanly.

### C. Replay-safe audit and revoke APIs

* Deduplicate audit writes using an `idempotency_key`.
* Make revoke/unlink RPCs safe to replay.
* Add an install-scoped revoke path so local sign-out can reconcile server session state later.

### D. Local sign-out semantics

* Signing out while offline should still clear the local account immediately.
* The app should queue the matching server-side security reconciliation.
* Current-account remote reconciliation is short-term priority.
* Cross-account reconciliation for non-active remembered accounts is a later enhancement and should not be faked.

### E. Visibility

* Show "security sync pending" in the device security center.
* Keep device/session lists scoped to the current account.
* Keep remembered accounts on this device visibly separate because they may belong to completely different people.

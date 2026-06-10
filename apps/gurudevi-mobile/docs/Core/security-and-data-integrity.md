---
title: "Security and Data Integrity"
status: "active"
created: 2026-06-09
updated: 2026-06-10
author: "Naveen"
scribe: "Antigravity"
tags: [technical, security, rls, crypto]
---

# Security and Data Integrity

This document outlines the cryptographic boundaries, local verification systems, and database tenant isolation policies implemented to protect user and institutional data.

---

## 1. Multi-Tenant Database Isolation (PostgreSQL RLS)

All tenant institutions share a single PostgreSQL database on Supabase. Separation is enforced strictly at the database engine level.

* **Tenant Key (`school_id`)**: Every operational table MUST include a `school_id` column.
* **RLS Policies**: Row-Level Security policies on Supabase prevent cross-tenant leakage. Queries fail-closed unless the session user is validated as having an active bond matching the targeted `school_id`.

---

## 2. Explicit Sovereignty Grants (ADR-002)

To protect the data privacy of students and teachers, we reject automatic vertical data surveillance (e.g., district admins or school principals automatically viewing granular student wellbeing files).

* **Explicit Grant Records**: Access to sensitive child or personal records must be justified by an active, time-bound relational entry in `student_record_access_grants` (or equivalent domain permission tables).
* **Auditing**: Every upward or horizontal data request requires linking to a valid grant record, ensuring all access is traceable and revocable.

---

## 3. Local Cryptographic Protections

Offline-first client databases (SQLite/PowerSync) on native devices are vulnerable to local storage tampering (e.g., on rooted Android/iOS devices). We mitigate this with local cryptographic checks:

### A. Snapshot Signature Verification
Before applying permissions synced from the server, we verify their authenticity using **SubtleCrypto HMAC SHA-256** signatures via the `isomorphic-webcrypto` library.
* **Payload Reconstruction**: The client reconstructs the JSON payload (generatedAt, expiresAt, userId, schoolId, permissions payload) matching the exact key-order signed by the server.
* **Signature Verification**:
  ```typescript
  const messageData = enc.encode(JSON.stringify(payload));
  const importedKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign', 'verify']
  );
  const generatedSigBuffer = await crypto.subtle.sign('HMAC', importedKey, messageData);
  ```
  If the generated hex signature does not match `snapshot.signature`, the client denies session bootstrap.

### B. Policy Set Signature Verification
* **`verifyLocalPolicySignature(policySet, signatureHex)`**: Validates the signature of the compiled Cedar policies stored in the SQLite `cedar_policies` table. If local database tampering modifies a policy entry to grant permissions, the signature check fails and disables evaluation.

---

## 4. Defensive Fail-Secure Design

We enforce strict fail-secure constraints to guarantee security under unexpected conditions:
* **Default-Deny**: The local permission evaluator (`checkLocalPermission()`) defaults to `false` (Deny) if local policies are missing, WASM modules fail to load, or cryptographic signature checks fail.
* **Hermes Engine Memory Guard**: To protect low-end devices (2GB RAM bounds) from Hermes WASM heap exhaustion, we limit local compiled policy payloads to `MAX_LOCAL_POLICY_SIZE_BYTES = 100KB`. Policies exceeding this size fail-securely and deny access.

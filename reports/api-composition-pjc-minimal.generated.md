---
title: "API composition minimal projection"
status: active
created: 2026-10-30
updated: 2026-10-30
author: Codex
tags: [pjc, generated]
---

Generated from packages/core/src/flows/pjc/api.foundation.json; regenerate through the PJC CLI.

# Product and Journey Catalog

- **id:** journey:api.compose
- **kind:** journey
- **title:** Compile and validate API contracts
- **parent:** intent:api.compose
- **references**
  - binding:api.contract\_conversion
  - binding:api.contract\_test
  - binding:api.guide
  - requirement:api.contract\_composition
  - step:api.compose\_source
- **situation:** A maintainer assembles existing legacy declarations and native SDK contracts before API admission.
- **outcome:** A composed native contract tree or an explicit composition error.
- **context:** setup
- **intent**
  - **id:** intent:api.compose
  - **kind:** intent
  - **title:** Reject invalid API composition before serving operations
  - **parent:** feature:api.foundation
  - **references**
    - (none)
  - **actor:** API maintainer or deployment agent
  - **outcome:** Build SDK-compatible contracts from valid declarations and receive explicit composition failures for invalid ones.
- **steps**
  -
    - **id:** step:api.compose\_source
    - **title:** Assemble declarations
    - **interaction:** Supply the existing source declarations and native contracts.
    - **terminal:** false
  -
    - **id:** step:api.compose\_ready
    - **title:** Receive SDK contracts
    - **interaction:** Pass the compiled contracts to SDK implementation.
    - **terminal:** true
  -
    - **id:** step:api.compose\_rejected
    - **title:** Correct an invalid declaration
    - **interaction:** Inspect the composition error, correct its source and recompile.
    - **terminal:** true
- **transitions**
  -
    - **id:** transition:api.compose\_valid
    - **from:** step:api.compose\_source
    - **to:** step:api.compose\_ready
    - **action:** Validate every legacy leaf and compile native procedure objects while retaining native leaves.
    - **feedback:** Return a stable SDK-compatible router tree.
  -
    - **id:** transition:api.compose\_invalid
    - **from:** step:api.compose\_source
    - **to:** step:api.compose\_rejected
    - **action:** Reject invalid routes before returning a compiled router, even if no caller accesses that route.
    - **feedback:** Throw an explicit composition error instead of constructing a schema-less procedure.
- **scenarios**
  -
    - **id:** scenario:api.compose\_valid
    - **title:** Valid native contract composition
    - **transitions**
      - transition:api.compose\_valid
    - **expected:** Retain schema identity/refinements/errors, native contract support, stable procedure instances and declared primary OpenAPI success status.
  -
    - **id:** scenario:api.compose\_invalid
    - **title:** Invalid declaration stops composition
    - **transitions**
      - transition:api.compose\_invalid
    - **expected:** Malformed nested members, missing/invalid request or response schemas, unsupported method/channel/scope and obsolete error fields throw without deferred property access.
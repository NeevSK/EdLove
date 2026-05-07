# Pull Request - Gurudevi Platform

## 🏗 Summary
[Describe the changes and the architectural "Hat" they address]

## 🛠 Type of Change
- [ ] 🔴 Critical Foundation (Infrastructure/DB)
- [ ] 🟡 Feature Implementation
- [ ] 🟢 Optimization / A11y / UI Hardening
- [ ] 🛠 Bug Fix

## 🛡️ Security & Sovereignty (MANDATORY)
- [ ] **RLS Compliance**: Does this touch the DB? Does it have an RLS policy?
- [ ] **Grants**: Does this flow data upward/sideward? Is there a Sovereignty Grant?
- [ ] **Input Validation**: Are all inputs validated via Zod?
- [ ] **Privacy**: Is PII handled according to the "No Surveillance" principle?

## 🚀 Performance
- [ ] **2GB Boundary**: Tested on/Optimized for low-end Android (FlashList, no heavy blurs).
- [ ] **Memory**: Checked for excessive re-renders or leaks in hooks.

## 🧪 Testing
- [ ] `pnpm check-types` passes.
- [ ] `pnpm test:logic` passes.
- [ ] Unit tests added for new logic.

---
*Reference: docs/security-checklist.md*

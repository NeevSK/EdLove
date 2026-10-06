---
title: "Pull Request - Gurudevi Platform"
status: "active"
created: 2026-04-23
updated: 2026-10-02
author: "Naveen"
scribe: "opencode"
tags: [.github, pull_request_template.md]
---

# Pull Request - Gurudevi Platform

## 🏗 Summary
[Describe the changes and the architectural "Hat" they address]

## 🛠 Type of Change
- [ ] 🔴 Critical Foundation (Infrastructure/DB)
- [ ] 🟡 Feature Implementation
- [ ] 🟢 Optimization / A11y / UI Hardening
- [ ] 🛠 Bug Fix
- [ ] 📝 Documentation

## 🛡️ Security & Sovereignty (MANDATORY)
- [ ] **RLS Compliance**: Does this touch the DB? Does it have an RLS policy?
- [ ] **Grants**: Does this flow data upward/sideward? Is there a Sovereignty Grant?
- [ ] **Input Validation**: Are all inputs validated via Zod?
- [ ] **Privacy**: Is PII handled according to the "No Surveillance" principle?
- [ ] **Secrets**: No new secrets committed (verified with `pnpm audit:secrets`)

## 🚀 Performance
- [ ] **2GB Boundary**: Tested on/Optimized for low-end Android (FlashList, no heavy blurs).
- [ ] **Memory**: Checked for excessive re-renders or leaks in hooks.

## 🧪 Testing
- [ ] `pnpm check-types` passes.
- [ ] `pnpm test:logic` passes.
- [ ] Unit tests added for new logic.
- [ ] Evidence level declared in test command (G0-G5/R1 per AGENTS.md)

## ✅ Quality Gates
- [ ] `pnpm lint` passes
- [ ] `pnpm run check:anti-slop` passes (aislop + fallow)
- [ ] No sacred version changes without approval (see AGENTS.md table)

## 📚 Documentation
- [ ] Updated relevant docs/ADRs
- [ ] Added inline comments where needed
- [ ] Updated README/CONTRIBUTING if user-facing

---
*Reference: docs/security-checklist.md, AGENTS.md*

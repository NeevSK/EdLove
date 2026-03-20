# Openness / Licensing Decision (Pending)

This repo currently contains **foundation/mission websites** and **product code**. The openness model affects licensing, governance, and how contributions are accepted.

This document keeps the decision explicit without blocking development.

## Option A — Mostly open-source (recommended if you want a Linux Foundation vibe)

Default: most code in this repo is public under a permissive license (e.g., Apache-2.0/MIT).

Pros:
- Maximum trust and community contribution potential (especially for EdLove).
- Easier ecosystem adoption (schools, NGOs, volunteers).

Cons:
- Harder to monetize proprietary IP directly (monetize services/support/hosting instead).

## Option B — Open-core

Default: a clearly-defined core is open; some modules/features remain proprietary under Intuitui Labs.

Pros:
- Still builds trust and community momentum.
- Keeps some commercial differentiation.

Cons:
- Must be very clear on boundaries to avoid community confusion.
- Requires disciplined repo structure and licensing separation.

## Option C — Mostly closed (content/mission open, product code private)

Default: public-facing philosophy/content is open; product code remains private.

Pros:
- Maximum control over product + IP.
- Simplifies compliance and commercial execution early.

Cons:
- Lower community collaboration energy; trust may rely more on outcomes than transparency.

## Pending decision

Current status: not decided.

When you decide, capture here:

- Target model: A / B / C
- Licenses:
  - EdLove content/docs:
  - Gurudevi code:
  - Branding/trademarks policy:
- Contribution policy:
  - Who can contribute (anyone / invited / employees only):
  - CLA required (yes/no):
  - Decision maker (initially: Neevsk):

If you choose **open-core**, also define:

- What “core” means (which folders/packages are open).
- What remains proprietary (which folders/packages are closed).
- How closed components integrate (runtime boundary, build-time boundary, separate repo, etc.).


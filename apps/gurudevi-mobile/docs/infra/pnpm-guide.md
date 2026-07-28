---
title: "pnpm: The "Strict Parent" of Package Managers"
status: "active"
created: 2026-02-02
updated: 2026-02-11
author: "Naween"
tags: [reorganized]
---

# pnpm: The "Strict Parent" of Package Managers

You mentioned: *"pnpm seems more troubling that not having explored it."*

This is a very common feeling. Here is why it feels "troubling" and why we still use it (or how to leave it).

## 1. Why does it feel "Troubling"? (The Strictness)
**NPM** (The standard one) is like a "Lazy Parent":
*   If you ask for `React`, it installs `React` AND `Lodash` AND `Moment` silently in a flat folder.
*   Your code can accidentally use `Moment` even if you never installed it.
*   This leads to **"Phantom Dependencies"** that break things later.

**PNPM** (The strict one) is like a "Strict Parent":
*   It puts every package in a jail cell (symlink).
*   Your code can **ONLY** see exactly what you installed in `package.json`.
*   If you try to import something you didn't explicitly install, **it crashes immediately**.

**The "Trouble"**: You probably tried to import something, and pnpm yelled: *"Unmet Peer Dependency"* or *"Module not found"*. It forces you to be honest.

## 2. Why do we keep it? (The Speed & Space)
1.  **Disk Space**: It saves gigabytes. If you have 10 projects using `React`, NPM copies `React` 10 times. PNPM saves it **once** on your hard drive and links to it.
2.  **Monorepo Speed**: We are building a **Polymath Platform** (Web + Mobile + Server).
    *   TurboRepo (our build system) is designed to work perfectly with pnpm.
    *   It treats the `apps/` folders efficiently.

## 3. How to Navigate It (Cheat Sheet)

| Task | NPM Command | PNPM Command | Why? |
| :--- | :--- | :--- | :--- |
| **Install Everything** | `npm install` | `pnpm install` | Sets up the strict links. |
| **Add a Package** | `npm install three` | `pnpm add three` | **Must run inside the specific app folder**. |
| **Run Dev Server** | `npm run dev` | `pnpm dev` | Runs the script. |
| **Run from Root** | N/A | `pnpm --filter edlove-web dev` | Runs a command in a specific sub-folder from the root. |
| **Nuke it (Reset)** | `rm -rf node_modules` | `pnpm store prune` | Clears the global cache. |

## 4. "I hate it, let's switch."
If the strictness is too annoying for our creative flow, we **can** switch back to `npm` or `yarn`.

**To Switch to NPM:**
1.  Variable: Delete `pnpm-lock.yaml`.
2.  Run: `npm install`.
3.  Update: Change `turbo.json` settings slightly.

**Recommendation**: Give `pnpm` one more week. The initial friction usually disappears once all dependencies are properly declared. If it breaks again, we switch.

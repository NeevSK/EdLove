---
title: "Technology Radar"
status: "active"
created: 2026-08-05
updated: 2026-08-24
author: "NeevSK"
tags: [radar, dependencies, research]
---

# Technology Radar

This is the intake and memory system for packages, tools, screenshots, articles,
and architecture ideas. It prevents technology FOMO from becoming dependency
sprawl.

> **Tooling note:** the `rn:radar` CLI moved to [NeevSK/rn-terrain](https://github.com/NeevSK/rn-terrain)
> during the 2026-08-24 extraction. Records under `records/` remain tracked
> platform knowledge; create new records manually following the same schema or by
> running that repo's radar CLI against this folder.

## Verdicts

| Verdict | Meaning | Installation policy |
|---|---|---|
| `ADOPT` | Proven fit for the current platform and an active need exists | May be installed with a normal dependency-change review |
| `TRIAL` | Promising, but needs a bounded spike | Keep outside production until the spike passes |
| `ASSESS` | Captured but not enough evidence | Do not install |
| `HOLD` | Known mismatch, duplicate, or unnecessary now | Do not install; revisit only when the stated condition changes |

The radar verdict is not the same as package quality. A great package can still
be `HOLD` for Gurudevi because it duplicates an existing system or does not fit
Expo 57, React Native 0.86, web, offline-first, or low-end-device constraints.

## Intake commands (historical)

From the repository root, prior to extraction:

```powershell
pnpm rn:radar:add "@legendapp/state" `
  --category state `
  --use-case "reactive local state" `
  --problem "Candidate captured from a screenshot; compare with Zustand and PowerSync" `
  --current-stack "zustand,@tanstack/react-query,PowerSync,Drizzle" `
  --evidence "C:\path\to\screenshot.png"

pnpm rn:radar
pnpm rn:radar:show "@legendapp/state"
pnpm rn:radar:decide "@legendapp/state" --verdict HOLD --decision "Duplicates Zustand, TanStack Query, and PowerSync."
```

The command saves a review record under `radar/records/`. Records are committed
knowledge, not installed dependencies. A screenshot can be stored as evidence
without adding the package.

## Review protocol

Every candidate must answer:

1. What exact problem does it solve?
2. Which current system would it replace or complement?
3. Does it support Expo 57, React Native 0.86, New Architecture, web, and low-end devices?
4. What native, bundle, maintenance, security, and migration cost does it add?
5. What happens if it is removed later?
6. What small test would prove it is useful?
7. What condition would justify changing the verdict?

The assistant should create the record first, then investigate and update the
verdict. No screenshot or social-media recommendation should directly modify a
package manifest.

## Relationship to the generated dependency catalog

`landscape/dependency-catalog.md` answers: “What do we already use?”

This radar answers: “What have we considered, why did we reject or defer it,
and when should we revisit it?”

After an `ADOPT` decision and dependency change, follow the normal stack-map
process:

```powershell
pnpm run stack-map:bootstrap
pnpm run stack-map:deps
pnpm run stack-map
```

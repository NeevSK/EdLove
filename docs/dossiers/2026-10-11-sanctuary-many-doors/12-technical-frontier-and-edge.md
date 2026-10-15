---
title: "Technical Frontier: Device, Browser, Edge, Hubs, and Emerging Capability"
status: "draft"
created: 2026-10-11
updated: 2026-10-11
author: "Naveen"
scribe: "Codex"
tags: [frontier, edge-computing, on-device-ai, maturity, future]
---

# Technical Frontier: Device, Browser, Edge, Hubs, and Emerging Capability

## Possibility first

Imagine a Sanctuary that can place work where it makes sense: deterministic tools on an inexpensive phone, richer inference on capable devices, a school library served nearby, regional services close to participants, and optional cloud reasoning for harder tasks. A person can choose privacy, speed, cost, or convenience without losing the meaning of the task. New hardware and interfaces can enrich the experience as they emerge.

Possibilities include on-device speech-to-draft, handwriting/OCR for paper bridges, multilingual local search, school Wi-Fi resource packs, a portable classroom server, regional institutional cells, an assistant that prepares work while disconnected, and permissioned institutional agents collaborating across boundaries. Some of these are available ingredients; others are maturation or research paths. None automatically composes into a reliable educational service.

## Edge is several different locations

| Location | What it could perform | What it still depends on |
| --- | --- | --- |
| Person's device | Drafts, selected cached reads, deterministic calculation, optional local inference | Compatible device, storage, battery, initial installation/model provisioning, custody |
| Browser runtime | Forms, selected persistence/downloads, accessible interaction, optional supported ML | Browser support, storage eviction/private mode, initial origin access, feature restrictions |
| School/local hub | Resource caching, LAN access, staged sync, carefully bounded local service | Hardware, power, local network, named maintainer, keys, backup and reconciliation |
| Regional institution cell | Bounded tenant operation and failure scope | Hosting/operator, routing, replication/restore, identity and contract versions |
| Provider network edge | Static content, ingress filtering, lightweight routing and some computation | User still reaches provider network; runtime/service limits; downstream DB location |
| Central/cloud compute | Shared protected commits, large inference, cross-institution coordination | Connectivity, credential/configuration, cost, provider availability and stewardship |

Moving code to a provider edge does not make it offline on the person's phone. Moving inference to the device does not make first provisioning free. A school hub is locally reachable only if participants have a usable local connection. These distinctions determine which failure each placement can cover.

## Maturity inventory, dated 2026-10-11

Maturity refers separately to ecosystem ingredients and Gurudevi's evidence. Available means an ingredient exists; it does not mean available on every participant's device. This table is an exploration radar rather than an implementation commitment.

| Capability family | Ecosystem position | Gurudevi ground | Possible next experiment |
| --- | --- | --- | --- |
| Local deterministic calculation/forms | Established patterns | Native storage and domain logic exist | Small useful task with restart and account-isolation proof |
| Local SQLite and scoped sync | Established ingredients; app integration is substantive | PowerSync/op-sqlite dependencies, queues/receipts and tests exist | Real physical-device capture/reconnect/conflict path |
| Browser persistence/downloaded resources | Established but behavior varies by runtime | Browser storage/exploration code exists; account offline parity unproven | Reload offline, eviction, account switch, export and stale-data handling |
| Static content/network-edge caching | Established deployment option | Cloudflare workflow exists; actual deployed coverage unknown | Low-byte Library shell/resource test under throttled network |
| Provider edge execution | Available bounded runtime | API has Node/runtime assumptions; gateway is stdio engineering runtime | Audit a narrowly owned ingress path against deployed runtime limits |
| School resource hub | Established class of solution; operating fit unproven | No demonstrated school hub installation in this review | Read-only resource pilot with power/network/operator inventory |
| LAN/proximity transport | Available OS/network primitives; cross-platform behavior needs proof | Current E15 transport methods simulate counts | Actual two-device transfer, interruption, membership and malicious-peer test |
| Delay-tolerant relay/physical exchange | Feasible patterns; governance/security are substantial | Mesh/QR ingredients exist; live end-to-end relay evidence absent | Encrypted selected document, explicit receipt and key lifecycle |
| Local speech/OCR/translation | Available for selected platforms/languages/models | No validated Sinhala/Tamil offline pipeline found here | Evaluate representative samples, storage/energy/correction burden |
| On-device language models | Available on selected hardware; expanding ecosystem | No dedicated local inference runtime found in inspected client manifests | Optional read/draft only, compare with manual and remote path |
| Browser built-in AI/WebNN | Available or emerging in subsets; compatibility varies | No verified browser AI integration found here | Capability detection and no-model/no-download behavior |
| Siri/Gemini/device agent invocation | Platform-specific and evolving | App links exist; no reviewed assistant action contract | One authorized read/draft on actual target OS/device |
| Product MCP/WebMCP | Evolving interoperability surface | Engineering MCP exists; product surface absent | Narrow isolated consented read tool; version-specific interoperability |
| Institutional cells/federation | Known architecture families; local governance unproven | No demonstrated independent operator exchange | Two institutions export/import with provenance and scoped consent |
| Ambient/wearable/adaptive interfaces | Mixed current capabilities and speculation | No implementation claim | Participant-led accessibility/usefulness experiment |

## Primary-source precision and limits

Installed substrate inspected: native app declares op-sqlite ^17.2.0, PowerSync React Native ^2.3.1, MMKV 4.3.2, Nitro modules 0.37.1; the web app declares Next 16.3.8. These declarations do not establish device compatibility or actual performance. No package additions or API replacements are prescribed.

The current [Chrome built-in AI guide](https://developer.chrome.com/docs/ai/get-started) documents hardware/model availability conditions and provisioning. Its presence is not evidence of general mobile or Sinhala/Tamil coverage. [Apple Foundation Models](https://developer.apple.com/documentation/FoundationModels/generating-content-and-performing-tasks-with-foundation-models) makes availability conditional on supported device/region and Apple Intelligence. Neither is a universal minimum access path.

[WebNN implementation status](https://webmachinelearning.github.io/webnn-status/) is a compatibility research source, not proof that all browsers accelerate all models. [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/) documents bounded CPU/memory/runtime operation; an ordinary Node process, native module, long-running model, and stateless edge function are different execution targets. Exact version/OS/browser/plan tests are needed before implementation choices.

Support changes rapidly. Every experiment must record observed device/OS/browser/model/runtime versions and source access date. Targeted release/declaration research must precede actual SDK code. Do not fill gaps with ecosystem marketing or assume an API's language support from its name.

## Placement decisions and tradeoffs

Prefer local deterministic work when it is understandable and fits resources. Local inference may reduce network disclosure and per-call billing but adds model download/storage, energy, thermal, update, and quality costs. Cloud inference may be more capable but introduces connectivity, price, data disclosure and latency. Local hubs can amortize resources across a school but transfer custody and operational work to people.

A hybrid scheduler is a future option, not a mandatory new subsystem. Initially expose a clear user choice or one bounded fallback. A provider outage should not trigger undisclosed upload to another model/vendor. Placement must preserve privacy and domain authority even when the device can technically compute the answer.

Resource adaptation can select text over video, smaller downloads, delayed uploads, or a manual form over inference. Avoid auto-detecting poverty or paternalistically hiding useful options. Ask for preference when it matters and make enriched capability discoverable.

## Hostile frontier review

“Free on-device AI” spends battery, storage and hardware. “Edge everywhere” can still cross one regional network and one cloud account. “Mesh is zero-cost” omits radio energy, setup, operator labor, key custody, and hardware. “Future devices will solve access” overlooks replacement costs and uneven adoption. “Supported SDK” does not mean supported input language, institutional policy, or usable error recovery.

## Integration round R11

Extend R10 with a placement/maturity dimension per capability. Preserve all frontier paths while choosing experiments that identify prerequisite, available users, privacy boundary, budget, and recovery. A technical ingredient graduates through installed contract → real runtime → actual device/network → useful participant outcome. Material reality must now decide who can reach it and who absorbs its costs.

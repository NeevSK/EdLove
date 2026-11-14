---
title: "Sovereign Mesh & Sanctuary Shield Architecture"
status: "active"
created: 2026-10-10
updated: 2026-10-10
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, networking, p2p, mesh, bitchat, ble, qr-airgap, doh, sanctuary-shield, cloudflare, zero-cost]
---

# Sovereign Mesh & Sanctuary Shield Architecture

> **Prime Architectural Covenant:**  
> Educational institutions, teachers, and students must never be forced to purchase commercial VPN subscriptions, configure complex network hardware, or depend on centralized corporate tollbooths to achieve secure, private, and child-safe computing. All core synchronization executes off-grid over physical radios (Wi-Fi, BLE, and Light) for zero dollars (\$0 / 0 LKR), while WAN privacy and child protection leverage open, zero-penny public utilities.

---

## 1. Executive Overview

This specification documents the networking and security substrate implemented across the Polymath Platform. It is divided into two cooperative systems:

1. **The Multi-Bearer Sovereign Mesh**: An offline-first, physical-layer peer-to-peer data synchronization engine designed for resource-constrained schools, disaster zones, and power-grid outages.
2. **The Sanctuary Shield**: A zero-dollar, zero-battery-drain in-app security layer that leverages **Cloudflare DNS-over-HTTPS (DoH)** to automatically filter adult content, block malware/phishing, and prevent telecom/ISP tracking of educational queries.

---

## 2. Part I: The Multi-Bearer Sovereign Mesh

### 2.1 The Four Transport Bearers

Rather than relying on a fragile single radio, the system adapts across four distinct physical and delay-tolerant bearers:

```
                               ┌──────────────────────────────────────────────────┐
                               │           LocalMeshSyncEngine (@repo/core)       │
                               │    (Idempotency, Lamport Clock, AES-GCM Envelope)│
                               └────────────────────────┬─────────────────────────┘
                                                        │
          ┌───────────────────────────┬─────────────────┴─────────┬───────────────────────────┐
          │                           │                           │                           │
          ▼                           ▼                           ▼                           ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│     TIER 1:       │       │     TIER 2:       │       │     TIER 3:       │       │     TIER 4:       │
│  LAN mDNS HOTSPOT │       │  BITCHAT BLE MESH │       │ OPTICAL SNEAKERNET│       │ NOSTR STORE-FWD   │
├───────────────────┤       ├───────────────────┤       ├───────────────────┤       ├───────────────────┤
│ • 20 – 100 MB/s   │       │ • 1 – 4 KB/s      │       │ • 20 – 50 KB/s    │       │ • Asynchronous    │
│ • Wi-Fi Hotspot   │       │ • BLE Multi-Hop   │       │ • Animated QR     │       │ • Public Relays   │
│ • Zero Data Used  │       │ • 32B State Hash  │       │ • Radio-Silent    │       │ • Town Signal     │
│ • Full ERP Sync   │       │ • Presence Beacon │       │ • Camera to Screen│       │ • Free & Open     │
└───────────────────┘       └───────────────────┘       └───────────────────┘       └───────────────────┘
```

#### 1. Tier 1: Local Wi-Fi / Hotspot mDNS (`lan_mdns`)
* **Transport**: Multicast DNS (RFC 6762 / 6763) discovery (`_sanctuary-mesh._tcp.local`) + local HTTP/WebSocket data exchange.
* **Physics & Throughput**: Operates at 20–100 MB/s over standard 802.11ac/ax Wi-Fi.
* **School Context**: A teacher taps "Personal Hotspot" on their Android or iPhone named `EdLove-Sanctuary`. All staff room devices connect with **zero mobile cellular data used**. Syncs 5,000+ attendance records and kitchen meal vouchers in under 400 milliseconds.

#### 2. Tier 2: BitChat-Style BLE Gossip (`ble_gossip`)
* **Transport**: Bluetooth Low Energy (BLE) multi-hop epidemic gossip relay (up to 7 hops).
* **Physics & Throughput**: Tiny 1–4 KB/s throughput.
* **Strict Discipline**: BLE is **never** used for bulk database dumps. It is strictly used to broadcast **32-byte cryptographic state digests** (`MeshStateDigest`), emergency school roll-call hashes, and proximity presence notices.

#### 3. Tier 3: Air-Gapped Optical Sneakernet (`qr_airgap`)
* **Transport**: Animated high-density QR code streaming via `@repo/scanner-kit` (`AnimatedMeshQrDecoder` & `computeAdaptiveStreamRate`).
* **Physics & Throughput**: Cycles base64-encoded mutation chunks at 10–20 frames per second directly from screen to camera.
* **School Context**: 100% radio-silent and immune to RF interference, Bluetooth OS bugs, or background service throttling.

#### 4. Tier 4: Nostr Delay-Tolerant Bridge (`nostr_relay`)
* **Transport**: NIP-44 encrypted WebSocket publication to public open relays (`wss://relay.damus.io`, `wss://nos.lol`).
* **School Context**: When a teacher leaves an off-grid village and boards a bus with 3G/4G coverage, outbox mutations upload asynchronously to public relays and download onto zonal office devices.

---

## 3. Part II: The Sanctuary Shield

### 3.1 What It Solves
Public school Wi-Fi and student mobile hotspots in developing regions are typically completely unprotected. Students and teachers face:
* Exposure to phishing, predatory gambling, and adult domains.
* Surveillance and traffic logging by domestic telecom ISPs.
* Deep Packet Inspection (DPI) throttling of educational resources.

### 3.2 The Zero-Penny Solution: Cloudflare DNS-over-HTTPS (DoH)
The `SanctuaryShieldService` in `@repo/core` wraps standard `fetch` queries using RFC 8427 DNS-over-HTTPS with `Accept: application/dns-json`:

* **`family` Mode (Default)**: Connects to Cloudflare's public `1.1.1.3` resolver (`https://family.cloudflare-dns.com/dns-query`). Automatically blocks malware and adult content. Prohibited domains resolve to `0.0.0.0` or NXDOMAIN.
* **`security` Mode**: Connects to `1.1.1.2` (`https://security.cloudflare-dns.com/dns-query`), blocking malware while allowing standard web traffic.
* **`privacy` Mode**: Connects to `1.1.1.1` (`https://cloudflare-dns.com/dns-query`) for encrypted DNS without categorization.

### 3.3 Zero Cost Invariant
Cloudflare provides 1.1.1.1, 1.1.1.2, and 1.1.1.3 as an open, unmetered public utility. It requires:
* Zero API keys.
* Zero billing accounts or credit cards.
* Zero external servers or infrastructure.

---

## 4. Code Inventory & Package Mapping

| File Path | Package | Responsibilities |
| :--- | :--- | :--- |
| [`packages/core/src/logic/shield/SanctuaryShieldService.ts`](file:///c:/x/packages/core/src/logic/shield/SanctuaryShieldService.ts) | `@repo/core` | Cloudflare DoH resolution, domain safety evaluation, child filtering |
| [`packages/core/src/logic/mesh/types.ts`](file:///c:/x/packages/core/src/logic/mesh/types.ts) | `@repo/core` | Multi-bearer types, `MeshStateDigest`, `MeshPacket`, `IMeshBearerTransport` |
| [`packages/core/src/logic/mesh/crypto/MeshEncryptionEnvelope.ts`](file:///c:/x/packages/core/src/logic/mesh/crypto/MeshEncryptionEnvelope.ts) | `@repo/core` | AES-GCM 256-bit encryption for open radios, state digest root hash generation |
| [`packages/core/src/logic/mesh/transports/LanMdnsBearerTransport.ts`](file:///c:/x/packages/core/src/logic/mesh/transports/LanMdnsBearerTransport.ts) | `@repo/core` | High-speed local Wi-Fi / hotspot discovery and bulk sync |
| [`packages/core/src/logic/mesh/transports/NostrDtnBearerTransport.ts`](file:///c:/x/packages/core/src/logic/mesh/transports/NostrDtnBearerTransport.ts) | `@repo/core` | Delay-tolerant store-and-forward relay across public Nostr endpoints |
| [`packages/scanner-kit/src/qr/animatedMeshQr.ts`](file:///c:/x/packages/scanner-kit/src/qr/animatedMeshQr.ts) | `@repo/scanner-kit` | Chunked animated QR streaming and adaptive frame rate throttling |
| [`apps/gurudevi-mobile/app/(tabs)/workspace/peers.tsx`](file:///c:/x/apps/gurudevi-mobile/app/%28tabs%29/workspace/peers.tsx) | `gurudevi-mobile` | Mobile UI showing 4-tier transport matrix, hotspot guide, and sneakernet controls |

---

## 5. Future Expansion Roadmap

1. **In-App WebView Navigation Filter (Short-Term)**:
   * Connect `SanctuaryShieldService.evaluateDomainSafety()` to the Library floor's in-app web viewer, halting navigation if a domain is flagged as dangerous or adult.
2. **Zonal Headscale / WireGuard WAN Blueprints (Medium-Term)**:
   * Provide turnkey Docker Compose templates for Zonal Education Offices to run a private **Headscale** control plane, giving 50+ regional schools private encrypted IP addresses (`100.x.y.z`).
3. **Outline Shadowsocks Emergency Egress (Medium-Term)**:
   * Deploy Outline Server scripts for emergency internet blackout bypass using Shadowsocks AEAD.
4. **LoRa / Meshtastic Radio Accessory (Long-Term)**:
   * Add an optional Bluetooth Serial bridge in `apps/gurudevi-mobile` to talk to $25 ESP32 + SX1262 LoRa hardware transceivers, giving schools a 5–15 km radio link during national flood or cyclone grid collapse.

---
title: "@repo/scanner-kit - Offline Optical Capture"
status: "active"
created: 2026-03-25
updated: 2026-10-15
author: "EdLove Foundation & Gurudevi Sanctuary"
tags: [packages, scanner-kit, qr-code, optical-capture, offline-access]
---

# @repo/scanner-kit — Offline Optical Capture

> **Fast, private QR code and optical scanning that bridges the physical and digital school.**

`@repo/scanner-kit` enables effortless, touch-free interactions using mobile cameras and printed codes. It is built to work reliably on budget smartphones in variable classroom lighting without requiring continuous cloud communication.

---

## 📷 What It Enables

* **Instant Attendance Scanning**: Fast check-in at school gates or classroom doors using student identity cards or teacher tokens.
* **Instant Resource Access**: Students scan a QR code printed in a physical textbook or blackboard to open the corresponding digital lesson, audio guide, or library book.
* **Device Pairing & Sync**: Connecting school devices or pairing teacher phones securely with offline classroom displays.
* **High-Speed Offline Encoding**: Encodes structured institutional payloads into dense, error-correcting 2D codes that can be scanned even when smudged or partially creased.

---

## 🛡️ Invariants

* **Client-Side Processing**: Image analysis and barcode decoding happen directly on the device CPU/GPU. No video frames or photos are sent to external cloud servers.
* **Lightweight & Battery-Friendly**: Camera pipelines are throttled and deactivated immediately after capture to preserve mobile battery life in low-power environments.

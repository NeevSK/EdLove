---
title: "Camera and OCR Architecture Decision"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naveen"
scribe: "Antigravity"
tags: [scanner-kit, mobile, architecture, decisions]
---

# Camera and OCR Architecture Decision

This document records the architectural decisions made regarding the camera engines, QR scanning mechanisms, and OCR processing layers for the Gurudevi mobile client.

---

## 1. Context & Problem Statement

The Gurudevi mobile client requires:
1. **QR & Barcode Scanning**: Scan codes in real-time using the camera or import them as static image files from the system gallery.
2. **Text OCR (Optical Character Recognition)**: Extract textual data (such as student registers) from printed or handwritten papers containing mixed languages (English, Sinhala, and Tamil).

We evaluated switching from `expo-camera` to a performance-focused JSI wrapper (`react-native-vision-camera`) and wrapping camera integrations behind a unified adapter pattern. Furthermore, we analyzed the capabilities of local vs. cloud-assisted OCR engines, especially regarding local Sinhala and Tamil script support.

---

## 2. Decision Outcomes

### A. Camera View Engine: Standardized on `expo-camera`
* **Decision:** We decided **against** implementing a runtime-swappable camera tool adapter (abandoned for simplicity/parsimony).
* **Rationale:** 
  * The APIs of `expo-camera` (prop-based callbacks) and `react-native-vision-camera` (JSI frame worklets) are structurally divergent. Creating a unified interface component adds unnecessary overhead.
  * `expo-camera` provides native-speed captures, works in Expo Go, and has a near-zero incremental bundle footprint since it's already part of the Expo runtime.
  * Since real-time on-device video frame rendering (like live object bounding boxes) is not a hard requirement, `expo-camera`'s `<CameraView>` is more than sufficient.

### B. QR Gallery Scan: Retained `@react-native-ml-kit/barcode-scanning`
* **Decision:** Retain the on-device ML Kit barcode scanner for gallery imports.
* **Rationale:** While the live camera handles barcode detection natively, scanning a static photo chosen from the gallery requires a static file parser. `@react-native-ml-kit/barcode-scanning` performs this fast, locally, and offline.

### C. OCR Processing Layer: Cloud-Assisted Hybrid Model
* **Decision:** On-device OCR will be restricted to Latin (English) scripts. Sinhala and Tamil OCR will be processed via cloud-assisted endpoints (such as Google Cloud Vision API or OpenAI GPT Vision via a Supabase Edge Function proxy).
* **Rationale:**
  * Google ML Kit’s **on-device** Text Recognition (v2) only supports Chinese, Devanagari, Japanese, Korean, and Latin. It has no on-device support for Sinhala or Tamil.
  * Tesseract OCR on-device incurs a massive binary footprint penalty and poor accuracy without complex image pre-processing.
  * Offloading complex multilingual handwriting/printed document OCR to cloud vision APIs yields near-perfect results for Sinhala and Tamil scripts without bloating the client application size.

---

## 3. Implementation Patterns

* **OCR Engine Independence:** The OCR layer is successfully wrapped behind the `OCRProvider` interface. Switching between local/offline scanning (`MLKitProvider`) and cloud scanning (`GoogleVisionProvider` or `OpenAIVisionProvider`) is fully decoupled from the UI.
* **Camera Component containment:** The app directly calls `<CameraView>` inside [ScannerModal.tsx](file:///c:/Users/Naween/projects/polymath-platform/packages/scanner-kit/src/ScannerModal.tsx). If camera requirements change in the future, adjustments will be contained strictly inside this component.

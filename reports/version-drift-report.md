# Sovereign Version Drift & Framework Dialect Report

Generated: 2026-10-08T15:04:02.642Z
Threshold: \Delta_{\text{major}} \ge 2

## 1. Dependency Manifest Drift (Latest Major - Current Major >= 2)

| Status | Package | Current | Latest | Lag (Δ) | Notes / Waiver |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 📝 `WAIVED` | `@sentry/node` | `8.55.2` | `11.5.0` | +3 maj | v8 held for Node/Hono server compatibility. |
| 📝 `WAIVED` | `vercel` | `59.23.2` | `62.0.0` | +3 maj | v59 pinned for monorepo build deployment workflows. |
| 🔒 `SACRED` | `typescript` | `5.9.3` | `7.0.2` | +2 maj | Sacred pin (7.0.2) in Stack Map |
| 📝 `WAIVED` | `pino-pretty` | `11.3.0` | `13.2.0` | +2 maj | Pinned v11 for pino v9 log transport compatibility. |
| 📝 `WAIVED` | `inline-style-prefixer` | `5.1.2` | `7.0.1` | +2 maj | v5 pinned as direct peer dependency of react-native-web runtime. |
| 📝 `WAIVED` | `tesseract.js` | `5.1.1` | `7.0.0` | +2 maj | v5 pinned for local web worker and model asset stability. |

## 2. Framework Dialect & Code Deprecation Drift

✅ Zero deprecated framework dialects detected across source code.


# Polymath Sovereign Deprecation Manifest (2026)

**Last Updated:** 2026-04-29
**Status:** Active
**Context:** Tracking React 19, RN 0.83, and Expo SDK 55 transitions.

---

## 1. React 19 Core Deprecations & Removals

| Pattern | Status | Severity | Recommended Alternative |
| :--- | :--- | :--- | :--- |
| `forwardRef()` | **Deprecated** | Medium | Pass `ref` as a standard prop in React 19. |
| `propTypes` | **Removed** | High | Migrate to TypeScript. |
| `defaultProps` (Function) | **Removed** | High | Use ES6 default parameters: `({ prop = value }) => ...` |
| `ReactDOM.render()` | **Removed** | High | Use `createRoot` from `react-dom/client`. |
| `useFormState()` | **Removed** | High | Use `useActionState()` for better action alignment. |
| String Refs (`ref="string"`) | **Removed** | Critical | Use `useRef()` or callback refs. |
| `react-test-renderer` | **Deprecated** | Medium | Use `@testing-library/react-native`. |

## 2. React Native (0.83+) Specifics

| Pattern | Status | Severity | Recommended Alternative |
| :--- | :--- | :--- | :--- |
| `sendRequestInternal` | **Deprecated** | Medium | Use standard Networking APIs or Fetch. |
| `startOperationBatch` | **Deprecated** | Low | Internal animation API optimization change. |
| `ViewPropTypes` | **Removed** | Critical | Use `React.ComponentProps<typeof View>`. |
| `ListView` | **Removed** | Critical | Use `FlatList` or `SectionList`. |

## 3. Expo SDK 55 Ecosystem

| Pattern | Status | Severity | Recommended Alternative |
| :--- | :--- | :--- | :--- |
| Legacy Architecture | **Removed** | Critical | Migration to New Architecture is mandatory. |
| `newArchEnabled` (app.json) | **Removed** | High | Default is now true; remove the key. |
| `notification` (app.json) | **Removed** | High | Use `expo-notifications` individual config. |
| `expo-av` in Expo Go | **Removed** | Medium | Use development builds for AV testing. |

## 4. Gluestack UI & Styling

| Pattern | Status | Severity | Recommended Alternative |
| :--- | :--- | :--- | :--- |
| `react-native-aria` | **Legacy** | Review | Transition to `@gluestack-ui/core` integrated ARIA. |
| Gluestack v1 Imports | **Deprecated** | High | Update to v3+ modular package structure. |

---

## Script Sync Status
- [x] React 19 standard removals (PropTypes, DefaultProps)
- [x] React 19 `forwardRef` warnings
- [x] RN 0.70+ Critical removals (ViewPropTypes)
- [x] Expo 55 Config removals
- [x] JSDoc `@deprecated` scanning

> [!IMPORTANT]
> This manifest serves as the ground truth for the `scripts/audit-deprecations.ps1` logic. If patterns diverge, update the script's `$patterns` array to reflect this document.

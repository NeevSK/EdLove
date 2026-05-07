# React Native Web: Fixing Missing Native APIs (Fabric & Legacy)

## 📖 The "Why": Why Are These Errors Happening?
If you are building a React Native application that exports to the web (using Expo or Webpack), you will likely encounter build crashes or runtime `TypeError`s stating that a certain function is "missing" or "not a function" inside `react-native-web`.

### The Architectural Gap
1. **The React Native Native API:** Native mobile libraries (like `react-native-reanimated`, `expo-av`, `react-native-gesture-handler`, etc.) frequently call low-level React Native APIs to talk to the iOS/Android operating system. Examples include `codegenNativeComponent`, `requireNativeComponent`, or `UIManager` methods.
2. **The React Native Web Polyfill:** `react-native-web` is a translation layer that attempts to emulate React Native components using standard HTML/CSS DOM elements. **It does not implement the Native bridge.** 
3. **The Result:** When the Metro Web bundler compiles your app, it bundles the 3rd-party mobile code. The code tries to import functions like `codegenNativeComponent` from `react-native-web`, but `react-native-web` doesn't have them. The bundle fails, or the app throws a runtime `TypeError`.

---

## 🛡️ The Web Compatibility Layer (Canonical Strategy)

In advanced React Native monorepos, fixing `react-native-web` missing APIs is the first line of defense. However, systemic stability requires a **two-tier architecture**: The Internal Patch and The External Firewall.

### Tier 1: The Internal Patch (pnpm patch)
Used when a library (e.g., `react-native-web`) is missing a core export that 3rd-party dependencies expect. 
- **Target:** `dist/index.js`, `dist/cjs/index.js`.
- **Method:** Add the missing property directly to the exports (see "How Exactly to Fix This" below).

### Tier 2: The External Firewall (Metro Resolver)
Used to block native-only or heavy-data packages from entering the web bundle. This is the **most efficient systemic way** to manage "Native Leaks" in a monorepo.

#### 1. Prefix-Based Interception
We use a `resolveRequest` hook in `metro.config.js` to intercept not just package roots, but **deep internal imports** that would otherwise bypass standard mocks.

```javascript
// metro.config.js
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === 'web') {
        for (const prefix in WEB_SHIMS) {
            if (moduleName.startsWith(prefix)) {
                return { filePath: WEB_SHIMS[prefix], type: 'sourceFile' };
            }
        }
    }
    return context.resolveRequest(context, moduleName, platform);
};
```

#### 2. The Universal Bridge (Self-Healing Proxies)
Static mocks often fail when libraries access sub-properties (e.g., `Reanimated.experiment`). We use a **Recursive Proxy Bridge** to ensure that any property accessed on a shimmied package returns a safe, no-op function instead of `undefined`.

```javascript
// universal-bridge.js
const createProxyShim = (name, baseMock) => {
    const shim = Object.assign((...) => {}, baseMock);
    return new Proxy(shim, {
        get: (obj, prop) => {
            if (prop === 'default') return proxy;
            if (prop in obj) return obj[prop];
            return createProxyShim(`${name}.${prop}`); // Recursive self-healing
        }
    });
};
```

#### 3. Data & Hardware Shimming
- **Heavy Data:** Packages importing massive JSONs for offline use are redirected to "Cloud Shims" that trigger database fetches on web.
- **Hardware/GPU:** Mocks return "Coming Soon" components or proxy to Browser APIs (e.g., WebGPU).

---

## 📊 Visibility & Auditing

To ensure you are not "blind" to native leaks, we have implemented a persistent audit system.

### The Audit Log
Every time the Metro resolver intercepts a native-only module leak, it records it in:
`apps/gurudevi-mobile/.web-firewall-audit.jsonl`

### Running a Report
You can generate a human-readable summary of blocked leaks by running:
```bash
cd apps/gurudevi-mobile
pnpm audit:web
```

This report will show:
- Which native modules were blocked.
- Which specific files (issuers) attempted to import them.
- How many times the leak occurred.

---

## 🔍 How to Identify the Issue
When attempting to run the web bundle (e.g., `pnpm start -c`), you'll see errors in the console or browser looking like this:

### Pattern 1: Missing Exports in Bundler (Metro/Webpack)
```text
Unable to resolve module "react-native-web/dist/index" ...
None of these files exist:
  * ...codegenNativeComponent
```

### Pattern 2: Runtime Web Browser TypeError
```text
Uncaught TypeError: (0 , _reactNativeWebDistIndex.codegenNativeComponent) is not a function
```
```text
Uncaught TypeError: UIManager.default.hasViewManagerConfig is not a function
```

### Core Diagnosis
If you see the name of the missing function is highly specific to Native component registration (e.g., `codegen...`, `requireNative...`, `hasViewManager...`), you are encountering a missing Fabric/Legacy bridge API in `react-native-web`.

---

## 🛠️ How Exactly to Fix This
You have two options to fix this issue. The first is architectural, and the second is a forceful patch.

### Method 1: The Architectural Fix (Platform Extensions)
If the missing export is occurring inside **your own code**, the correct fix is to separate the web logic from the native logic using `.web.tsx` file extensions.
1. Create `MyComponent.tsx` (Contains the `requireNativeComponent` or native module logic).
2. Create `MyComponent.web.tsx` (Contains standard `<div />` or React Web fallbacks).
Metro will automatically pick up `.web.tsx` when bundling for the browser!

### Method 2: The Forceful Patch (`pnpm patch`)
If the missing export is inside a **third-party `node_module`** that you cannot easily rename or rewrite, you must patch `react-native-web` to export "dummy" or "no-op" versions of the missing functions so the third-party library stops crashing.

**Step 1:** Run `pnpm patch react-native-web@0.21.2`
**Step 2:** Pnpm will give you a temporary folder. Open it.
**Step 3:** You must patch **every entry point** where Metro might look. Modify these three files:
*   `src/index.js` (The Source)
*   `dist/index.js` (The ESM bundle, used by Babel transforms)
*   `dist/cjs/index.js` (The CommonJS bundle, used by `require('react-native')`)

**Step 4:** Inject the missing export safely at the bottom of the files.
_Example for `codegenNativeComponent`:_
```javascript
// At the bottom of index.js
import View from './exports/View';
export const codegenNativeComponent = function(name) { return View; }; // Return a dummy View
export const requireNativeComponent = function(name) { return View; }; // Legacy equivalent
```

**Step 5:** Save the files, then run `pnpm patch-commit <path-to-temp-folder>`.
**Step 6:** Extremely Important: Stop your terminal and restart with `pnpm start -c` to clear the Metro cache and force it to read the patched CJS/ESM modules.

---

## 🛑 Common Similar Patterns (A Checklist)
Here is a list of the most commonly missing APIs in `react-native-web` and how to stub them in your `pnpm patch`:

1.  **Missing `codegenNativeComponent` / `requireNativeComponent`**
    *   **Fix:** Export a function that returns the default `View` component.
2.  **Missing `codegenNativeCommands`**
    *   **Fix:** Export a function that maps the `supportedCommands` array into empty no-op functions (`cmd[command] = function() {}`).
3.  **Missing `UIManager` methods (`getViewManagerConfig`, `hasViewManagerConfig`, `dispatchViewManagerCommand`)**
    *   **Fix:** Open `src/exports/UIManager/index.js` (and the `dist`/`dist/cjs` equivalents). Add the missing functions to the `UIManager` object. Have `hasViewManagerConfig` always return `false`.
4.  **Missing `Platform.constants`**
    *   **Fix:** Open `src/exports/Platform/index.js` and add missing constants like `reactNativeVersion: { major: 0, minor: 74, patch: 0 }`.

By following this patching pattern, you can eliminate 99% of web-compatibility crashes caused by heavily-native 3rd party UI libraries.

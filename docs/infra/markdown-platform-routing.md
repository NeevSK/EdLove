# Markdown Platform Routing — `react-native-enriched-markdown`

## Context
`MessageBubble` (`packages/ui`) renders message content via `react-native-enriched-markdown`'s
`EnrichedMarkdownText`. `AIAssistantScreen` (`packages/ai`) consumes `MessageBubble` and passes
`content` (markdown string). The library is cross-platform:

- **native** → `main`/`module` → `lib/module/index` (RN Fabric component).
- **web** → `browser` → `lib/module/index.web.js` → re-exports from `./web/EnrichedMarkdownText.js`
  (self-contained: md4c WASM parser + lazy KaTeX).

## Problem
Published `react-native-enriched-markdown@0.6.0`'s `package.json` has **no `browser` field**, so
web bundlers (Vite/Astro/Metro-for-web) resolve `import 'react-native-enriched-markdown'` →
`main` → `lib/module/index` (the native build), which crashes / mis-renders on web.

## Fix
Add `"browser": "./lib/module/index.web.js"` to the library's `package.json` via a pnpm patch
(`browser` only affects web; Metro ignores it and keeps using `main`/`module`).

### Files
- `patches/react-native-enriched-markdown@0.6.0.patch` — unified diff adding the `browser` key
  immediately after `module` (3-space context, LF). Regenerated canonically via `git diff`; passes
  `git apply -p1 --check` (exit 0).
- `pnpm-workspace.yaml` →
  `patchedDependencies: { 'react-native-enriched-markdown@0.6.0': 'patches/react-native-enriched-markdown@0.6.0.patch' }`.
- Applied to the live store copy that mobile resolves:
  `node_modules/.pnpm/react-native-enriched-markdown@0.6.0_<hash>/node_modules/react-native-enriched-markdown/package.json`
  (`apps/gurudevi-mobile/node_modules/react-native-enriched-markdown` is a symlink to it).

### Resolution chain
`AIAssistantScreen.tsx` → `MessageBubble.tsx` → `EnrichedMarkdownText`
→ native `lib/module/index` | web `lib/module/index.web.js` → `./web/EnrichedMarkdownText.js`.

## Known blocker (pre-existing — not introduced here)
The repo root `package.json` declares `"packageManager": "yarn@4.11.0"`, but the repo is actually
a **pnpm** workspace (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, and every mobile script uses
`pnpm exec ...`). pnpm v11 enforces the `packageManager` field and refuses to run:

```
[ERROR] This project is configured to use yarn
For help, run: pnpm help install
```

So `pnpm install`/`pnpm exec`/`pnpm run` are **all blocked** under pnpm v11.18 in this checkout
(older pnpm treated the field as a warning, not an error). To apply the registered patch from a
clean state and unblock the toolchain, set the field to match the lock + scripts:

```jsonc
// package.json (repo root)
"packageManager": "pnpm@11.18.0"
```

The patch is already registered in `pnpm-workspace.yaml`, so the next successful `pnpm install`
re-applies it automatically. The store copy is also patched in place so the fix is effective now
without a full reinstall.

## Other notes
- **css-interop**: the repo is Gluestack v3 + `react-native-css-interop@0.1.22`
  (direct dep in `packages/ui` + `apps/gurudevi-mobile`; pervasively used in `components/ui/*`).
  Not migrated to v5; left untouched. The existing
  `patches/react-native-css-interop@0.1.22.patch` continues to apply via the same mechanism.
- Vite/Astro honor `browser`/`exports` by default; if a future web app uses a bundler that doesn't,
  alias `react-native-enriched-markdown` → `react-native-enriched-markdown/lib/module/index.web.js`.

## Verification
- `packages/ui` typecheck (`tsc --build --noEmit`): **0 errors** for `MessageBubble.tsx`
  (pre-existing unrelated errors exist only in other `ui` files).
- `@repo/ai` typecheck: **0 errors** (`AIAssistantScreen.tsx` consuming `MessageBubble`).
- ESLint `packages/ui/src/components/MessageBubble.tsx`: **0 errors** (1 pre-existing
  `import-x/no-named-as-default-member` warning on `React.memo`).
- ESLint `packages/ai/src/screens/AIAssistantScreen.tsx`: **0 errors**.
- Store lib `package.json` resolves `main`/`module`/`browser`/`source`; `lib/module/index.web.js`
  exports `EnrichedMarkdownText` (named + default).

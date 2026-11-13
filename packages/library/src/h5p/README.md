# H5P player core

Plays H5P content offline on mobile and the web, without an H5P server. It is a pure core
with no app, workspace package or platform imports (`boundary.test.ts` holds that), so it
can be published on its own later. Why H5P, and what else was weighed, is in the project
doc `claude/lms-integrate-vs-build.md`. Where its events end up is in
[the assessments card](../../../../docs/architecture/domains/learning/assessments.md).

## What is here

| File | What it does |
| --- | --- |
| `h5pPackage.ts` | Parses `h5p.json` and `library.json` with Zod, checks entry paths (no `..`, absolute paths, backslashes or control characters) and file types (scripts and styles only inside library folders, no Flash, no HTML), and resolves the order libraries load in. Libraries the package leaves out can come from the device (`installedLibraries`). |
| `h5pArchive.ts` | Opens an `.h5p` file in memory with `fflate`, applying the checks and size limits before anything is inflated, then again on the real sizes. Defaults suit a 2 GB phone. Writing to disk is the caller's job. |
| `h5pBridge.ts` | The page that hosts one player (`buildPlayerDocument`), with a Content-Security-Policy that allows only the package's own origin, and the message envelope between page and host (`parseBridgeMessage`): `ready`, `xapi`, `state`, `resize` and `error`, versioned and checked. |
| `h5pEvents.ts` | Reads the xAPI statements H5P sends into `H5PEvent`: the verb, the activity, the part (`subContentId`), the library, and the result (a score that doesn't add up is dropped, the rest is kept), with the raw statement kept for xAPI 2.0 export. |

The page loads [`h5p-standalone`](https://github.com/tunapanda/h5p-standalone) 3.8.2 (MIT)
from the same origin as the package.

## Not built yet

1. **Shipping the player files.** `h5p-standalone`'s `dist/` must reach the device (written
   once to the document directory) and the web build's static folder.
2. **The native host.** A component in `@repo/ui/components/native` running
   `react-native-webview` 14.0.1 with `originWhitelist` limited to `file://`, file access
   limited to the package folder, `onMessage` going through `parseBridgeMessage`, and one live
   player at a time.
3. **The web host.** A sandboxed iframe (`allow-scripts`, no `allow-same-origin` unless the
   player needs it) in `@repo/ui/components/web`, checking `event.origin` before
   `parseBridgeMessage`.
4. **The adapter** from `H5PEvent` to the assessments facts, once Neev encodes them.

## Evidence

G0 and G1 only: `vitest run src/h5p` (47 tests) and `tsc` with no errors in these files. The
policy and the state-saving script in `buildPlayerDocument` have not yet run in a real
WebView or browser (G4/G5); in particular, whether H5P's libraries load under the policy
needs that run.

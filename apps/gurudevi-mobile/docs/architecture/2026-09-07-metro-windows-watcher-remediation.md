---
title: "Metro Windows Watcher Remediation"
status: "active"
created: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi-mobile, metro, windows, expo, pnpm, android]
---

# Metro Windows Watcher Remediation

## Incident

The physical Android development client received HTTP 500 from Metro instead
of a JavaScript bundle. Expo Dev Launcher then displayed its error activity.
The device was not crashing in native application code.

The server log established the failure sequence:

1. Metro's file watcher timed out with `Failed to start watch mode`.
2. Metro nevertheless exposed port 8081.
3. The first Android bundle request failed in `DependencyGraph.js` because an
   internal map was undefined.

This is a Metro watcher/file-map initialization failure, not evidence of an
out-of-memory termination. No operating-system OOM diagnostic or Node heap
allocation failure was observed.

## Constraints

- Keep the existing Windows `node_modules` and pnpm store. Do not create a
  parallel WSL dependency tree or reinstall packages.
- Do not modify Android or iOS generated files, dependency versions, or the
  lockfile.
- Preserve the explicit singleton resolver aliases required by this monorepo.
- Limit cache clearing to Metro's transient cache when validating a changed
  Metro configuration.

## Decision

`metro.config.js` now disables Watchman and leaves `watchFolders` empty for
the Windows mobile development path.

Expo SDK 57 enables on-demand filesystem access by default. It can resolve
workspace files outside the app root without Metro pre-crawling every shared
package directory. The removed broad `packages` watch folder was forcing the
fallback watcher to recursively register the entire workspace during startup,
which exceeded Metro's startup health-check window.

The former resolver also eagerly enumerated every pnpm virtual-store entry into
`extraNodeModules`. This checkout has 3,624 virtual-store entries. Metro then
failed while serializing its file-map cache with `Data cannot be cloned, out of
memory`. The fallback is now lazy and cached: only a package requested by the
active bundle is resolved from the pnpm store.

pnpm v12 may use hashed virtual-store directory names for peer-dependent
packages. The lazy fallback therefore finds a requested package by testing its
actual nested `node_modules/<package>` path instead of assuming a package-name
directory prefix.

The retained resolver configuration continues to map workspace packages and
runtime singletons deterministically. The trade-off is explicit: after edits
inside a shared package, restart Metro until a reliable narrow-watch policy is
measured and adopted.

## Validation protocol

1. Start `pnpm --filter gurudevi-mobile start -- --clear --max-workers 1`.
2. Confirm port 8081 is reachable before launching the device.
3. Request an Android bundle and require HTTP 200 before using the development
   client.
4. Run `adb reverse tcp:8081 tcp:8081`, launch `org.edlove.gurudevi`, and
   confirm the welcome route appears.
5. Capture a clean device log. A Metro HTTP 500 or `DependencyGraph.js`
   exception fails the validation.
6. Exercise welcome, authentication, and the Self tab only after the server
   passes the bundle check.

## Dependency materialization blocker

The first Android bundle after this remediation reached Metro resolution and
failed on `@radix-ui/react-compose-refs`, required by Expo Router through
`@radix-ui/react-slot`. The package is declared in `pnpm-lock.yaml` but is not
materialized in the current Windows `node_modules` links.

A frozen, offline workspace install was attempted as the smallest repair. It
made no filesystem changes because pnpm refused the operation: the existing
lockfile does not match `packages/admin/package.json` for its
`@types/react-native` path specifier. The lockfile also contains unrelated
uncommitted edits. Do not use a non-frozen install or regenerate the shared
lockfile until the owner chooses how to reconcile those changes.

Once the lockfile is reconciled, run a frozen install using the existing
Windows pnpm store, then resume the Android bundle check. This does not require
WSL dependencies, a second store, or an APK rebuild.

## Rollback

Restore `config.watchFolders` to the previous workspace package directory only
after demonstrating that the watcher can establish and remain healthy on this
Windows checkout. Do not compensate by adding WSL package copies or by
repeatedly deleting `node_modules`.

## References

- Expo SDK 57 Metro configuration: <https://docs.expo.dev/versions/v57.0.0/config/metro/>
- Expo monorepo guidance: <https://docs.expo.dev/guides/monorepos/>
- Metro configuration reference: <https://metrobundler.dev/docs/configuration/>

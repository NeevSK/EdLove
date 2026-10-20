---
title: "EAS Performance Build Archive Validation"
status: "active"
created: 2026-10-19
updated: 2026-10-19
author: "Codex"
tags: [eas, android, performance, build-evidence]
---

# EAS Performance Build Archive Validation

This records source-archive inspection for the single operator-authorized
internal Android performance artifact. Inspection prepared a local archive;
it did not submit a cloud build, install an APK, or interact with a device.

## Result

- Date: 2026-10-19.
- Pinned CLI: project-local `eas-cli@25.0.0`.
- Command: `doppler run --no-fallback --project gurudevi-mobile --config dev -- pnpm exec eas build:inspect -p android -s archive -e performance -o <fresh-temp-directory>`.
- Final archive directory: `C:\Users\Naween\AppData\Local\Temp\gurudevi-eas-performance-archive-final-85eb76d852fe44aabf98a284f0e86c0f`.
- Inspect log: `C:\Users\Naween\AppData\Local\Temp\gurudevi-eas-performance-inspect-1d9f3eb29a054802b4257e194624bf1a.log` (environment values were not printed).
- Result: exit code 0; 4,833 files and 100,597,500 bytes (95.9 MiB, sum of file lengths before EAS upload compression).

The first copy, before a repository-root `.easignore`, was 284,411,448 bytes
(271.2 MiB). It contained 28.8 MB of `.git`, broad documentation/report
material, and omitted required mobile JavaScript configuration and plugin
files because root `.gitignore` ignores `apps/**/*.js`. An intermediate
`.easignore` copy was 97,044,697 bytes; exact app asset exceptions added the
source images referenced by the running app, producing the final 100,597,500
byte copy.

## Archive checks

The final copy includes:

- `apps/gurudevi-mobile/app.json`, `app.config.js`, `babel.config.js`,
  `metro.config.js`, `react-native.config.js`, and `eas.json`.
- The custom plugins listed by `app.json`, including
  `plugins/withProfileableBuild.js`, and its
  `plugins/lib/buildGradleBlock.js` helper.
- `src/shims/early-bootstrap.js` and `src/shims/node-globals-shim.js`, imported
  by the app entrypoint.
- Root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, Cedar policy and
  schema sources, and `scripts/copy-powersync-assets.mjs`.
- App icon and splash files, splash animation, and source-referenced mascot,
  preview and dance assets, including
  `assets/mascot/firefly-guide-welcome-light-scene.webp`.

The checked copy omits `.git`, root `docs/` and `reports/`, mobile `.expo/`,
`node_modules`, generated `android/` and `ios/`, mobile `dist/`, and sampled
JavaScript shadow files such as `src/devtools.js` and
`src/shims/crypto-web.js`. No `.env*`, `doppler.json`, generated public-runtime
file, or keystore filename was found in the final archive.

The root [`.easignore`](../../../../.easignore) starts from the current root
`.gitignore` safeguards, adds EAS-only workspace/documentation exclusions, and
re-includes only app configs, active config plugins/helpers, imported boot
shims, and referenced assets. The final archive confirms these rules work in
EAS CLI 25.0.0. It does not prove cloud-builder access to public Supabase
environment variables or prove that the app compiles; confirm those before the
single cloud build.

Related plan: [performance engineering execution plan](2026-10-19-performance-engineering-execution-plan.md).

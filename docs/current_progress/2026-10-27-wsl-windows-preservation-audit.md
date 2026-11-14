---
title: "WSL to Windows source preservation audit"
status: active
created: 2026-10-27
updated: 2026-10-27
author: Codex
tags: [recovery, wsl, windows, source-preservation]
---

# Preservation checkpoints

This is a source-preservation audit, not migration or runtime acceptance. No recovered Linux file was copied over Windows source during this audit. Commits are local; preservation commits bypass hooks at the user's explicit request.

| Source | Preserved commit | State at audit |
| --- | --- | --- |
| Verger candidate worktree | `8aee62a7b190b5192cc333469fa5eb4bc351d2bd` | Clean Windows worktree |
| Original `C:\x` checkout | `d74df1de12383a0d7360127909a38a74f867eb22`, ref `codex/original-checkout-before-wsl-20261027` | Recovery commit made with a separate index; original checkout remains unchanged |
| External `C:\projects\rn-terrain` | `9f3e1ac949075f0bf46090e203547faef64d20f0` | Clean Windows worktree |
| Integrated source before candidate | `785958472d95a06d589224da85566a324e7c56d2` | Included in full history bundle |

The original checkout's current files match the saved recovery index (`git diff-files --quiet`, exit 0). This covers tracked and staged nonignored source captured by that snapshot; it is not a backup claim for every ignored/generated file on Windows.

# Readable Linux client comparison

The recovered `verger-v2-verification-20261027/client` contains 8,114 files. SHA-256 comparison against this Windows worktree found 8,109 identical files and five differences. There were no client-only files in that readable copy.

| Differing path | Treatment |
| --- | --- |
| `.gitignore` | Windows includes four newer exceptions preserving native configuration/build plugin inputs. Keep Windows. |
| `apps/gurudevi-mobile/.gitignore` | Windows includes newer exceptions preserving artwork/build assets. Keep Windows. |
| `apps/gurudevi-mobile/app.config.js` | Linux adds the verification-only Android package `app.gurudevi.sanctuary.vergerv2`. Preserve the Linux copy as evidence; do not replace normal app configuration. |
| `docs/engineering/runtime-performance/verger/2026-10-27-android-modules-v2-plan.md` | Windows has the newer implementation-status link and active status. Keep Windows. |
| `docs/engineering/runtime-performance/verger/pipeline.md` | Windows has the newer native/device evidence and profiling follow-up. Keep Windows. |

The candidate `VergerModule.kt` SHA-256 is `7D653AE9189904CF98D8BC78E8C0C81ED48A2E4C9A0CC125056C841E7642E60F`, matching the previously recorded native build/device source hash.

The readable `client-v1` control copy also contains 8,114 files: 8,108 match Windows exactly, with six differences and no control-copy-only files. Five are the same paths classified above (the control app uses `app.gurudevi.sanctuary.vergerv1`). The sixth is `packages/verger-android/expo-module.config.json`, which retains the legacy module registration and matches the integrated checkpoint's configuration. Preserve that control separately from the v2 candidate. This comparison covers recovered files only; it does not establish recovery of excluded/generated native directories.

# Backup artifacts and verification

Artifacts reside at `E:\CodexArtifacts\ubuntu-recovery-20261027`:

- `polymath-git-history.bundle`: complete history through the integrated checkpoint.
- `verger-checkpoint-8aee62a7b.bundle`: candidate checkpoint; requires the integrated checkpoint above.
- `original-checkout-source.bundle`: original checkout recovery commit; its parent is in the history bundle.
- `rn-terrain-history.bundle`: complete external repository history.
- `linux-client-windows-file-audit.json`: per-file comparison, including both hashes.
- `linux-v1-windows-differences.json`: six differences in the readable v1 control copy.
- `home-nsk-readable`: recovered readable Linux files, including the isolated app configuration.
- `ubuntu-home-copy.log`, `ubuntu-full-export.log`, and `recovery-status.json`: recovery coverage and failures.

All four bundles were accepted by `git bundle verify` against their appropriate repositories. This checks bundle structure and required ancestry; it is not a fresh restore into an empty repository or runtime verification.

# Unresolved recovery coverage

**A complete no-loss claim for all WSL files is not supported.** The Linux copy reported 16,238 copied files, 21 failed files and 30 failed directories. Entire unreadable directories have unknown contents. Full distro export also failed with filesystem I/O errors.

Notably, the old Linux `projects/polymath-platform` directory and the staged `candidate` directory could not be scanned. The verification-only `baseline.init.gradle` and `candidate.init.gradle` also failed to copy. Windows holds the authored Verger implementation and its commits, but the unreadable WSL-only files cannot be certified byte-for-byte. Do not confuse reconstructable build setup with a verified recovered original.

Ubuntu remains stopped. The original VHD remains in place; no filesystem repair, sparse-mode conversion, distro deletion or source overwrite was performed. Supported compaction failed with `ERROR_VIRTUAL_DISK_LIMITATION`. Preserve the VHD for further recovery; do not treat the partial export as a valid full backup.

No feature tests were rerun for this read-only audit. Evidence here is file comparison, Git state inspection and bundle verification, with the limits above. Verger v1/v2 runtime qualification and startup/World profiling remain unfinished.

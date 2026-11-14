---
title: "Agent-Native Mobile Workflow and Skill Retrieval"
status: "active"
created: 2026-10-16
updated: 2026-10-16
author: "Polymath Platform"
tags: [agents, skills, expo, react-native, mobile, workflow]
---

# Agent-Native Mobile Workflow and Skill Retrieval

## Purpose

Give agents a repeatable way to discover repository conventions, load the right instruction at the point of work, implement Expo changes, and gather runtime evidence. A skill is task-time reference material; it is not reliable memory across context resets.

## Mobile work loop

1. Read the app's `package.json`, app config, root and app-level `AGENTS.md`, and relevant existing implementation. Confirm the actual Expo, React Native, and library versions before relying on version-specific advice.
2. Load `.agents/skills/expo-overview/SKILL.md`, then load the focused skill it selects (for example `expo-router`, `expo-native-ui`, `expo-ui`, `expo-animation`, `expo-data-fetching`, `expo-upgrade`, or `eas-app-stores`). Load `branded-ui` and repo-specific architecture guidance when the change touches platform conventions.
3. Search existing repository abstractions and call sites. Keep changes inside the app/domain boundary and preserve established flows.
4. Implement the smallest compatible change. For API or library details that may have changed, read installed declarations/source and the documentation for the app's SDK version.
5. Verify in proportion to the claim. Use static checks for static claims, tests for contracts, bundling for integration, and a simulator/device for runtime or visual claims. When a device is available, prefer accessible snapshots and selectors, capture only focused logs, and save screenshots or traces when they help review.
6. Report the evidence tier, command/tool, observed result, and what that evidence does not prove. Do not say a visual or runtime flow was verified from code inspection alone.

### Expo tooling verified against upstream documentation

Expo's current agent setup describes three complementary pieces: Expo Skills for implementation guidance, Expo MCP for live Expo/EAS documentation and project services, and project context files such as `AGENTS.md`. The official Expo plugin is available for Codex (`codex plugin add expo@openai-curated`) and registers skills plus MCP; the documented MCP sign-in command is `codex mcp login expo`. Check the current official setup before changing these commands.

Callstack's `agent-device` is a separate CLI/MCP toolkit for operating a running app. Its version-matched CLI help is the command authority: install only through the project's approved toolchain or a user-managed global install, run `agent-device doctor`, then use `agent-device help workflow` and narrower help as needed. The official skill can be installed from `callstack/agent-device` with the `skills` CLI. For reviews or planning-only work, do not launch devices unless asked.

This repository also has a `sovereign_device` adapter in `packages/platform-mcp`. Its supported action names and argument mapping live in `packages/platform-mcp/src/services/DeviceService.ts`; its action surface is not interchangeable with the full upstream CLI. Use the adapter when available and consult its implementation before relying on a skill's example payload.

Do not treat claims about `@expo/agent-cli`, remote Expo simulators, third-party build services, model availability, costs, or plugin hardware requirements as stable setup facts. Verify each against an official, dated source and the repository's actual host/toolchain before recommending adoption. The current stack notes are research leads, not authority for package installation or native pin changes.

## Skill retrieval and context continuity

- At task start, use `.agents/skills/CATALOG.md` descriptions to select skills by trigger; load their actual `SKILL.md` before proposing implementation.
- Follow local skill references only when relevant. Avoid loading the whole catalog or every skill into context.
- On compaction, handoff, interruption, or task pivot, reread the root/app instructions and the focused skill. A carry-forward note should name the exact skill paths and current files, but must not replace their contents.
- Separate three kinds of guidance: upstream skills for general tool/library workflows, repository skills for local architecture and conventions, and installed package docs/types for versioned API truth. Resolve conflicts in that order only where scope allows: repository boundaries and explicit pins constrain upstream guidance; installed source and SDK-versioned docs ground API use.
- Keep upstream material traceable. Record the canonical repository, source path, revision/date, local path, and any intentional local overlay. Never blindly overwrite a local skill during synchronization; inspect and review the diff first.

## Skill corpus audit findings (2026-10-16)

The current workspace has extensive existing edits. The audit below was read-only and no skill files were healed or overwritten.

- `node scripts/skill-doctor.mjs` inspected 240 entries across `.agents/skills` and `.claude/skills`; it reported 14 frontmatter errors, 226 healthy entries, and 0 warnings. Errors concern missing/malformed frontmatter or missing `name` in local and mirrored skills, including `gh-fix-ci`, `open-source-maintainer`, `powersync-expert`, `security-best-practices`, `supabase-expert`, and `ui-polisher`.
- The non-strict doctor printed errors but exited successfully. Run `node scripts/skill-doctor.mjs --strict` to make findings fail the command. The root `package.json` currently has no `skill:doctor` script, and `check:anti-slop` does not include this audit. Therefore the October 10 ledger's statements that the doctor is wired into the anti-slop gate and that 237/237 entries pass are not supported by the current checked-out files.
- The current `scripts/sync-upstream-skills.mjs` audit mode inventories configured remotes but does not compare local content or revisions. Its sync mode clones into a temp directory but does not copy, hash, or diff the skills into `.agents/skills`. Treat it as incomplete; do not use `--sync` as an updater.
- A set of local skills is repository-specific and should remain locally maintained (brand, platform constraints, storage/sync patterns, repo tooling). Upstream provenance alone does not make a skill correct for this monorepo. Conversely, local authorship alone does not make it bad: assess trigger quality, source grounding, version scope, overlap, and reviewability.
- The root `.agents/skills/CATALOG.md` contains 138 entries. This structural audit did not establish that every skill is current. The lockfile includes entries marked `computedHash: "pending"`, so provenance/freshness is not complete for those entries.
- `skills-lock.json` has 40 tracked upstream entries from 8 repositories; 5 entries have `computedHash: "pending"` (including locally imported `caveman`, `grill-me`, `ponytail`, `superpowers`, and `thermo-nuclear-code-review`). A lockfile hash proves only content identity against the recorded value, not that the source is still current or correct for this repo.
- `expo-overview` is a useful entry router and its focused Expo skills provide substantially better routing than relying on a single broad `expo-rn-expert` playbook. Keep the local Expo/RN playbook for monorepo-specific constraints, but inspect its exact SDK claims against the app manifest before use.
- `agent-device-control` describes the repository adapter and is locally edited in this workspace. Preserve it and review its examples against the gateway implementation and current installed CLI help before treating them as general upstream CLI syntax.

## Maintenance follow-through

1. Repair the 14 frontmatter issues with reviewed, minimal edits; do not use the doctor's `--heal` mode blindly because it synthesizes generic metadata and can rewrite content.
2. Make the strict doctor part of an explicit package script and the desired CI/anti-slop gate in a separate reviewed change. First confirm the checker scope and avoid double-counting mirrored skills unintentionally.
3. Replace the placeholder sync behavior with an audit that records immutable upstream revisions and hashes, shows a local diff, and requires explicit review before applying updates. Include LICENSE and supporting reference files when present.
4. For each skill, classify it as upstream mirror, upstream-derived local overlay, or repository-authored. Track source/revision and last review; use focused freshness checks for fast-changing APIs rather than claiming that a syntactically valid skill is current.
5. Add a small evaluation set of representative prompts for trigger routing and critical constraints. Review routing failures after real work; do not infer quality from skill counts or frontmatter validity.

## Sources

- [Expo AI agents overview](https://docs.expo.dev/agents/)
- [Expo Skills documentation](https://docs.expo.dev/skills/)
- [Expo and agent-device workflow](https://docs.expo.dev/agents/agent-device/)
- [Expo official skills repository](https://github.com/expo/skills)
- [Callstack agent-device setup](https://github.com/callstack/agent-device/blob/main/website/docs/docs/agent-setup.md)
- [skills.sh Expo listing](https://www.skills.sh/expo)

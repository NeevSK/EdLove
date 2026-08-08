# AI Agent Tooling Landscape + RN/Native Toolchain Guide (2026)

---

## 1. General AI agent tooling landscape — five distinct building blocks

| Building block | What it is | When to use it |
|---|---|---|
| **Tools / function calling** | One callable function, one input, one output | Any single discrete action |
| **MCP (Model Context Protocol)** | Anthropic's open standard (donated to the Linux Foundation's Agentic AI Foundation, Dec 2025) for connecting an agent to external tools/data — write once, use in any MCP-compatible client | Standardized integrations (GitHub, databases, APIs) reusable across agents |
| **Skills** | Reusable packaged *procedures* (`SKILL.md`) — published as an open standard at agentskills.io (Dec 2025); ~40 skills-compatible products by mid-2026 (Codex, Copilot, Cursor, Gemini CLI, VS Code) | Repeatable workflows/best practices the agent should follow consistently |
| **Subagents** | A specialized child agent handling a sub-task with its own context/tools (one level deep in Claude Code — no further nesting) | Context would otherwise overflow, or a sub-task needs a narrower toolset |
| **Hooks** | Event-driven interception points in the agent lifecycle (before a tool call, after a response, on error) | Custom governance/logging/validation injected into the flow |

Adjacent protocols: **A2A** (Google's agent-to-agent collaboration protocol, donated to the Linux Foundation; IBM's ACP merged into it in early 2026) and **AG-UI** (how an agent streams state to a user-facing frontend). Mental model: *MCP = agent↔tools, A2A = agent↔agent, AG-UI = agent↔user*.

---

## 2. Native/lower-level FFI-specific agent tooling

### C++
- **`cpp-pro` skill** (fullstack-dev-skills collection) — idiomatic modern C++, RAII, smart pointers, STL, templates, move semantics, performance.
- **C++ Style Guide MCP Server** (`SongJiangzhou/cpp_guidelines_mcp`) — agent-callable tools: `analyze_memory_safety`, `suggest_modern_cpp` (up to C++23), `check_const_correctness`. Install: `npx -y @smithery/cli install cpp_guidelines --client claude`.
- Anthropic's own official skills repo (`github.com/anthropics/skills`) — safest first stop for anything C++-related.

### Rust
- **rust-analyzer MCP servers** (`zeenix/rust-analyzer-mcp`, `dexwritescode/rust-mcp`) — real hover-info, go-to-definition, find-references, refactoring against your actual codebase.
- **`cargo-mcp`** — runs `cargo build`/`test`/`check`/`clippy`/`fmt` and returns structured results.
- **`rust-cargo-docs-rag-mcp`** — crate documentation lookup keyed to your exact `Cargo.lock` versions; solves AI using outdated API info for fast-moving crates.
- **`probe-rs` MCP server** — embedded debugging (ARM Cortex-M, RISC-V) with real hardware integration; relevant only if you touch embedded work later.
- **`rmcp` crate** — Rust SDK for building your own bespoke MCP server if you ever need one tailored to your specific workflow.

### React Native / Expo specifically
- **Expo MCP Server** (`claude mcp add --transport http expo https://mcp.expo.dev/mcp`) — live access to your Expo project, EAS logs, simulators, RN DevTools.
- **Expo Skills** — SDK conventions, config-plugin patterns; `create-expo-app` projects are scaffolded with `CLAUDE.md`/`.claude/settings.json` for this out of the box.
- **`expo-dev-client` skill** — automates the Expo Go → custom native runtime transition, enforces the prebuild workflow to prevent fragile manual edits (directly relevant to the prebuild-wipe issue documented separately).
- **Software Mansion's `react-native-best-practices` skill** (github.com/software-mansion-labs/skills, 215 stars, MIT) — from the team behind Reanimated/Gesture Handler/RN-Skia integration. Table-of-contents structured skill; sub-skills load only when relevant:
  - **`jsi/`** — HostObject, HostFunction, NativeState, zero-copy ArrayBuffer, threading safety, CallInvoker, TurboModules vs Nitro Modules, C++ memory patterns, crash debugging. *This is the direct match for everything dissected by hand earlier in this research.*
  - **`on-device-ai/`** — LLM/vision/OCR/audio/embeddings, built around React Native ExecuTorch.
  - **`animations/`, `gestures/`** — Reanimated/Gesture Handler/Skia patterns.
  - **`rnrepo`** — Software Mansion's own pre-built native artifact distribution infra (attacks native build-time pain directly).
  - Install: `/plugin marketplace add software-mansion-labs/skills` → `/plugin install skills@swmansion`
- **`metro-mcp`** / **Radon IDE MCP** — live on-device inspection: components, network requests, logs, screenshots — via Chrome DevTools Protocol, no app code changes needed.

**Recommended starter kit for this project specifically**: Expo MCP + Expo Skills (general layer) + Software Mansion's `jsi` sub-skill (C++/Nitro layer) + rust-analyzer MCP + `cargo-mcp` (Rust layer) + C++ Style Guide MCP (self-check) + `metro-mcp`/Radon (live debugging).

---

## 3. Brownfield vs greenfield

- **Greenfield**: starting from scratch, no existing codebase to work around — free to choose architecture/stack/conventions from day one.
- **Brownfield**: adding new tech to an *existing* app with its own history, architecture, and accumulated constraints — integration has to work around what's already there, not around an ideal setup.
- **In RN terms**: greenfield = fresh `create-expo-app`, New Architecture from day one, no legacy baggage. Brownfield = adding Nitro/UBRN/native modules to a multi-year-old app, possibly still partly on Old Architecture, with existing pinned dependencies and CI assumptions.
- **Practical implication**: most of the cataloged gotchas (prebuild wiping edits, New-Arch opt-in mismatches, ABI drift) bite hardest in brownfield, since legacy has already accumulated. Greenfield mostly avoids them by never accumulating that legacy. Know which situation you're in before starting native work.

---

## 4. Toolchain & infra guidance — what real practitioners actually use in 2026

### Debugging (corrected from earlier assumptions — this changed recently)
- **Flipper is dead in 2026** — the standalone remote debugger is gone.
- **React Native DevTools** — built-in since RN 0.76+. Press `j` in the Metro terminal; a Chrome window attaches directly to the Hermes runtime via Chrome DevTools Protocol. No bridge, no proxy, no setup. **Free.**
- **Reactotron** — state/storage inspection (Redux, Zustand, MMKV). **Free/OSS.**
- **Xcode / Android Studio directly** — native-level debugging, no middleware needed. **Free.**
- **Production crash reporting** — Sentry, Bugsnag, or Crashlytics with source maps. **Crashlytics (Firebase) is free**; Sentry/Bugsnag have paid tiers for scale — start with Crashlytics if cost matters, upgrade only if you need their specific extra features.

### Native build tooling (real, currently-documented practice, e.g. via Callstack)
- **CMake** — the real standard for compiling native code (e.g. Hermes itself for iOS is built this way, targeting Apple platforms/architectures and producing a universal framework for device + simulator).
- **clang-tidy / clang-format** — lint/style for C++.
- **`depcheck`** — identifies and removes unused native dependencies; can reduce app size and improve time-to-interactive by up to 17%. **Free**, genuinely worth adding — unused native deps are a measurable, not just cosmetic, cost.
- **Instruments (iOS) / Android Profiler / Hermes Debugger** — native-level profiling, all **free**, built into Xcode/Android Studio.

### Environment setup basics (boring but load-bearing)
- **Watchman** (Meta OSS, free) via Homebrew — reduces Metro bundler restarts by 40–60%.
- Set `ANDROID_HOME` correctly — prevents roughly half of "SDK not found" errors; the single most common early setup failure.
- **macOS** is the practical single-machine choice for shipping both platforms (hosts both Apple and Android toolchains); Windows can do Android fine, but splitting Windows+WSL2 without a clear reason adds friction.

### Rust-specific toolchain
- `rustup` for toolchain management
- `cargo-ndk` for Android cross-compilation
- Cargo for dependency management (far less fragmented than C++'s vcpkg/Conan split)

### CI/build automation — free-first framing
- **GitHub Actions** — free for public repos, generous free minutes for private; the default choice while solo, and needed regardless since it can run both C++ and Rust builds (EAS Build doesn't uniquely help with native-language builds).
- **EAS Build** — has a free tier, paid for scale; worth adopting once build volume or team size grows, not before.
- Principle either way: build automation forces a project to declare its assumptions, exposing missing environment deps before they become release-day surprises.

### CI/infra checklist (combining with earlier prebuild/config research)
- Both C++ and Rust toolchains present in CI — they don't share a pipeline automatically; budget CI time for both.
- Sanitizers (ASan/UBSan) in a separate debug/test CI lane only — never in release builds.
- Commit lockfiles: `Podfile.lock`, `yarn.lock`/`package-lock.json`, `Cargo.lock` — non-negotiable given documented drift risks.
- Verify `patch-package`'s postinstall hook actually runs in CI, not just locally.

---

## 5. Practical sequencing recommendation

Don't set up the full native/agent toolchain preemptively. Start with:
1. Expo MCP + Expo Skills + Reanimated/Skia (no native code yet).
2. Add Software Mansion's `jsi` sub-skill, rust-analyzer MCP, `cargo-mcp`, and the C++ Style Guide MCP only once an actual case needs native code (vector search, on-device AI, per the earlier "genuinely needs native" list).
3. Add EAS Build, Sentry/Bugsnag, and heavier CI infra only once build volume or team size actually justifies the cost — premature infra investment is the same trap flagged earlier in this research (the "over-engineer before you need it" tendency).

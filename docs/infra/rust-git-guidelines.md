---
title: "Rust & Git Workflow Guidelines"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "Antigravity"
tags: [rust, git, gitignore, cargo, developer-guidance]
---

# Rust & Git Integration Guide & SOP

Welcome to Rust! This guide is designed to help web/mobile developers understand how Rust projects are structured, what files the Rust compiler (`rustc`) and package manager (`cargo`) generate, and how to safely handle them in Git.

In this repository, we have two primary Rust folders:
1. [spike-rust-inline/](file:///c:/Users/Naween/projects/polymath-platform/spike-rust-inline) (which contains the [rust-stub](file:///c:/Users/Naween/projects/polymath-platform/spike-rust-inline/rust-stub) sub-project).
2. [native-capabilities/](file:///c:/Users/Naween/projects/polymath-platform/native-capabilities) (a workspace with multiple Rust crates).

---

## 1. Anatomy of a Rust Project (What are these files?)

When you create or build a Rust project, Cargo structures and builds it using the following directories and files:

### `Cargo.toml`
* **What it is:** The **manifest file** for your Rust project (equivalent to `package.json` in Node.js).
* **Role:** It defines the package name, version, dependencies (crates), build profiles, and workspace settings.
* **Git Status:** **Always Commit.** This is the source of truth for your project configuration.

### `Cargo.lock`
* **What it is:** The **lockfile** (equivalent to `pnpm-lock.yaml` or `package-lock.json`).
* **Role:** It contains the exact versions of all resolved dependencies.
* **Git Status:** **Usually Commit.** 
  - For final applications, binaries, and integration projects, it *must* be committed to guarantee reproducible builds.
  - In our projects (`spike-rust-inline` and `native-capabilities`), committing `Cargo.lock` ensures every developer and the CI build use identical package versions.

### `src/`
* **What it is:** The **source code directory**.
* **Role:** Contains your actual Rust code files (e.g., `lib.rs` for libraries, `main.rs` for executables, and submodules).
* **Git Status:** **Always Commit.**

### `target/`
* **What it is:** The **compiler output directory** (similar to `dist/`, `.next/`, or `build/`).
* **Role:** When you run `cargo build`, `cargo check`, or `cargo run`, Cargo compiles dependencies and your code, generating intermediate objects, debug symbols, cache files, and the final compiled binary.
* **Size:** It can easily balloon to **hundreds of megabytes or gigabytes** because it retains intermediate build states to speed up compilation.
* **Git Status:** **NEVER Commit.** It is machine-specific, extremely large, and generated dynamically.

### `.cargo/config.toml`
* **What it is:** Local build configuration.
* **Role:** Specifies target-specific linkers, compilation flags, environment variables, or custom Cargo aliases.
* **Git Status:** **Commit** if it contains configurations required for team cross-compilation (e.g., configuring the Android NDK clang linkers).

---

## 2. Git vs. Gitignore Rulebook

Below is the definitive reference for how to configure your git settings for Rust files:

| File/Directory | Location | Description | Git Action | Reason |
| :--- | :--- | :--- | :--- | :--- |
| `Cargo.toml` | Project root | Manifest / Dependencies configuration | **Track** ✅ | Source of truth for build settings. |
| `Cargo.lock` | Project root | Exact resolved package versions | **Track** ✅ | Ensures reproducible builds. |
| `src/` | Project root | Rust code (`.rs` files) | **Track** ✅ | Your actual project source code. |
| `target/` | Project root | Build cache, intermediate artifacts, final binaries | **Ignore** ❌ | Machine-specific, massive size (GBs), automatically generated. |
| `.cargo/config.toml` | Project root | Custom cargo paths, targets, and linkers | **Track** ✅ | Required for multi-platform compilation configurations. |
| `*.rs` | Anywhere in `src/` | Rust source files | **Track** ✅ | Core source files. |
| `*.so` / `*.dll` / `*.dylib` | Varies | Compiled dynamic libraries (e.g., Android JNI `.so` outputs) | **Ignore** ❌ * | Usually generated on build; should not be tracked unless manually vendor-copied to a JNI directory like `jniLibs/`. |
| `*.log` | Varies | Local compiler diagnostics or cargo check logs | **Ignore** ❌ | Local transient logs. |

> [!WARNING]
> **Why committing `target/` is dangerous:**
> If you accidentally stage and push the `target/` directory, you will commit hundreds of thousands of small binary files, making git clones extremely slow and permanently bloating the `.git` repository size. If this happens, a repository history rewrite (force-cleaning) is required.

---

## 3. How to Setup `.gitignore` for Rust folders

If you want to track a Rust project in Git but ignore the heavy build outputs, use this standard `.gitignore` pattern.

### Standard Rust `.gitignore` Template
Place this `.gitignore` directly in your Rust project sub-directory (e.g. inside `native-capabilities/.gitignore`):

```gitignore
# Generated by Cargo
# Contains all compiled binaries, intermediate objects, and cache
/target/

# These are local diagnostic log files sometimes outputted during checks
*.log

# Backup files generated by cargo-fmt or editors
**/*.rs.bk

# If you use cargo-clippy or other analyzers that write build reports
clippy-results.json
```

---

## 4. Understanding the Project's Current Configuration

In the root [.gitignore](file:///c:/Users/Naween/projects/polymath-platform/.gitignore), you might have noticed these entries:

```gitignore
# Rust test
spike-rust-inline/
native-capabilities/
```

### Why are the entire folders ignored?
These folders contain complete, isolated workspaces and local spikes (sandbox environments) that are currently not intended to be pushed to the main repository as part of the core application. 

### How to transition a Rust folder to be tracked by Git
If you decide to make a Rust folder a formal part of the repository, you should:

1. **Modify the Root `.gitignore`**:
   Remove the directory block (e.g. remove `native-capabilities/` or `spike-rust-inline/` from the root `.gitignore`).
   
2. **Add a Local `.gitignore` in the Rust folder**:
   Ensure that a local `.gitignore` exists inside that folder to explicitly ignore its `/target/` directory:
   ```gitignore
   /target/
   ```

3. **Stage only the Source Files**:
   Run `git status` to verify. You should only see `Cargo.toml`, `Cargo.lock`, `.cargo/`, and `src/` directories as untracked files. Do not commit anything inside a `target` folder.

---

## 5. Useful Commands for Rust Beginners

Here is a quick cheat sheet of commands to run inside any Rust project directory (using PowerShell or Command Prompt):

*   **Check syntax and compile dependencies without producing a binary (super fast):**
    ```powershell
    cargo check
    ```
*   **Compile and run a binary project (if it has `main.rs`):**
    ```powershell
    cargo run
    ```
*   **Build the project in development mode (outputs to `target/debug/`):**
    ```powershell
    cargo build
    ```
*   **Build the project in optimized production mode (outputs to `target/release/`):**
    ```powershell
    cargo build --release
    ```
*   **Clean all cached build artifacts to free disk space (deletes the `target/` directory):**
    ```powershell
    cargo clean
    ```

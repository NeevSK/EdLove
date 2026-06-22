---
title: "Command Execution Reporter"
status: "active"
created: 2026-06-21
updated: 2026-06-21
author: "Naveen"
scribe: "Antigravity"
tags: [infra, tooling, reporting]
---

# Command Execution Reporter

This documentation details the custom monorepo tooling designed to intercept `package.json` script executions, capture standard streams as UTF-8 encoded text logs, and format structural reports containing analytics and actionable insights.

---

## 1. Overview & Architecture

The reporting toolchain consists of two primary scripts located in the `scripts/` directory:

1. **`scripts/run-and-report.mjs`**: The core execution runner. It executes inner commands within a shell, streams output to the terminal in real-time, intercepts errors/warnings (TypeScript compiler errors, ESLint/Biome lint rules, generic script crashes), and writes results to files under the `reports/` folder.
2. **`scripts/toggle-reports.mjs`**: An orchestration utility that scans all `package.json` files in the monorepo, backing up original scripts to a `_originalScripts` field and wrapping the scripts with the runner, or reversing the wrapper completely.

---

## 2. Command Wrapping Mechanics

When scripts are wrapped (via `pnpm wrap:reports`), standard commands are prefixed with `node scripts/run-and-report.mjs`.

### Example Script Transform
* **Original**:
  ```json
  "check-types": "pnpm exec tsc --noEmit"
  ```
* **Wrapped**:
  ```json
  "check-types": "node ../../scripts/run-and-report.mjs --cmd \"pnpm exec tsc --noEmit\" --name \"apps_gurudevi-mobile-check-types\""
  ```

---

## 3. Usage & CLI Configuration

All wrapped commands natively log outputs and generate summaries. However, you can control reporting behavior directly from the command line:

### Disable Reporting On-the-Fly (`--no-report`)
To execute any wrapped script without generating log files or analytical summaries, append `--no-report` to the command line:
```bash
pnpm start --no-report
```

### Argument Forwarding
Additional arguments are transparently forwarded to the underlying wrapped tool:
```bash
pnpm start -c --no-report
```
*(Executes the inner start command with the `-c` flag directly to standard output without logging).*

---

## 4. Output Formats & Locations

* **Raw Logs**: Saved under `reports/run-<clean-script-name>.log`.
* **Actionable Reports**: Saved under `reports/run-<clean-script-name>-report.txt`.
  * The report is a plain text format optimizing token budget.
  * It includes metrics (errors vs. warnings count), a list of the top offending files, and detailed code locations formatted as clickable `file:///` scheme URLs for direct editor jumping.
  * The timestamp of when the command ran is recorded inside the report itself, while the filename remains static to avoid cluttering your directory.

---

## 5. Maintenance Commands

* **Wrap all scripts monorepo-wide**:
  ```bash
  pnpm wrap:reports
  ```
* **Unwrap all scripts monorepo-wide**:
  ```bash
  pnpm unwrap:reports
  ```

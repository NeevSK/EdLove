---
title: "Diagnostic Assessment & Intervention Plan: WSL 2 Networking Timeouts"
status: "active"
created: 2026-08-20
updated: 2026-08-20
author: "Naveen"
scribe: "opencode"
tags: [docs, infra]
---

# Diagnostic Assessment & Intervention Plan: WSL 2 Networking Timeouts

This document presents a structured diagnostic assessment of your laptop's network environment, compares it to the ideal WSL 2 setup, and outlines a precise intervention plan to resolve the package download timeouts.

---

## 1. Diagnostic Findings (Host vs. WSL)

| Component | Current State (Your Laptop) | Ideal Target State |
| :--- | :--- | :--- |
| **Wi-Fi Link Speed** | **72.2 Mbps** (Indicates congested/weak signal) | 300+ Mbps (Stable signal) |
| **WSL Networking Mode** | `Mirrored` (Enabled via `.wslconfig`) | `Mirrored` |
| **WSL interface MTU** | **1350** (Aligned to match host VPN/WARP) | 1350 - 1400 |
| **pnpm Concurrency** | **Default (Unlimited)** | **Restricted (4 - 8)** |
| **Fetch Timeout Limit** | **Default (30 seconds)** | **Extended (2 - 5 minutes)** |

---

## 2. Root Cause Analysis

1. **Wi-Fi Saturation**: Your active Wi-Fi connection has a link speed of **72.2 Mbps**. 
2. **Connection Squeezing**: When you run `pnpm install`, it attempts to open dozens of concurrent network requests to download package tarballs. On a highly constrained 72.2 Mbps connection, this saturates your router's packet buffer, leading to packet drops, latency spikes, and connection resets (`ECONNRESET`).
3. **Low Timeout Thresholds**: Node's default fetch client aborts connections if they stall for more than 30 seconds, leading to the `TimeoutError` that crashes the installation.

---

## 3. Intervention Plan

We will configure your package manager and environment to run in a "low-bandwidth/unstable-connection" mode. This prevents router saturation and ensures downloads complete successfully.

### Action 1: Limit pnpm Network Concurrency
Restricting the number of concurrent connections prevents packet drops:
```bash
wsl pnpm config set network-concurrency 4
```

### Action 2: Extend Fetch Timeout Limits
Instruct pnpm and Node to wait longer on slow connections:
```bash
wsl pnpm config set fetch-timeout 300000 # 5 minutes (300000 ms)
wsl pnpm config set fetch-retries 5
```

### Action 3: Clear and Resume Install
Prune the broken cache state and run a slow-but-steady installation:
```bash
wsl bash -c "cd ~/projects/polymath-platform && pnpm install --frozen-lockfile"
```

---

## 4. Verification

* Verify if `pnpm install` completes successfully without `TimeoutError` or `ECONNRESET` under the new concurrency limits.

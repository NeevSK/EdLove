---
title: "Resolution Log: WSL 2 & Docker local EAS Build Issues"
status: "active"
created: 2026-08-20
updated: 2026-08-20
author: "Naveen"
scribe: "opencode"
tags: [docs, infra]
---

# Resolution Log: WSL 2 & Docker local EAS Build Issues

This document records the exact root causes, lessons learned, and resolutions for each issue encountered while configuring native WSL 2 and containerized local EAS builds.

---

## 1. Directory Lock & Performance (51-Minute Installs)
* **What went wrong**: Running `pnpm install` inside a Docker container mounting the Windows Host filesystem (`c:/Users/...` linked to `/workspace`) caused extremely slow disk speeds. Windows NTFS and Linux ext4 translation layers cannot handle the I/O volume of `pnpm` workspace symlinks.
* **The Correction**: Migrated the entire workspace natively inside the WSL 2 Linux ext4 directory (`~/projects/polymath-platform`).
* **The Lesson**: **Never run package managers on Windows-mounted directories (`/mnt/c/...`) inside Linux/Docker.** Always clone the repository natively inside the WSL filesystem.

---

## 2. Bloated Disk Space (10,000+ Untracked Files)
* **What went wrong**: Running `pnpm` created a global virtual package store `.pnpm-store` in the root folder. Because this was a hidden directory and not present in the root `.gitignore`, Git attempted to track over 10,000 package cache files, bloating disk indexing.
* **The Correction**: Replaced the first lines of the root `.gitignore` to explicitly ignore `.pnpm-store` and `.pnpm-store/`.
* **The Lesson**: **Always gitignore local caches and package stores at the monorepo root.** 

---

## 3. Expo Authentication Blocks (`An Expo user account is required`)
* **What went wrong**: Running `eas build --local` inside Docker failed because the isolated container did not have your local Expo credentials.
* **The Correction**: Mounted your Windows host global Expo credentials folder (`C:\Users\<Username>\.expo`) into the container's root directory (`/root/.expo`).
* **The Lesson**: Containers run as isolated root users. **To authenticate EAS commands inside Docker, mount the host credentials folder into the container's `/root/` config paths.**

---

## 4. Doppler Configuration Clashes (`The bearer token is invalid`)
* **What went wrong**: Although the container was authenticated using the mounted `.expo` configuration, passing the Doppler `.env` file injected a mock or outdated `EXPO_TOKEN`. EAS CLI read this token, skipped the `.expo` credentials, and failed with an invalid token error.
* **The Correction**: Added `-e EXPO_TOKEN=""` to the Docker run script to override and nullify the variable, forcing EAS CLI to fall back to the mounted `.expo` credentials.
* **The Lesson**: **Nullify environment variables that override local credentials** when deploying local build scripts.

---

## 5. WSL 2 VPN Networking Timeouts (`fetch failed / ETIMEDOUT`)
* **What went wrong**: During package installation inside native WSL 2, downloads crawled at 2 KiB/s and failed with timeouts. This was caused by an MTU (Maximum Transmission Unit) mismatch between WSL 2's default network card (`mtu 1500`) and the active Cloudflare WARP VPN interface on your Windows host. Packets exceeding the VPN limits were silently dropped.
* **The Correction**: 
  1. Created a Windows host `C:\Users\<Username>\.wslconfig` file to enable **Mirrored Networking Mode** (`networkingMode=mirrored` and `dnsTunneling=true`).
  2. Restarted WSL (`wsl --shutdown`).
  3. Lowered the WSL 2 network MTU to `1350` to fit within the VPN headers:
     ```bash
     wsl -u root ip link set dev eth0 mtu 1350
     wsl -u root ip link set dev loopback0 mtu 1350
     ```
* **The Lesson**: **Always match WSL 2's MTU to your host VPN's MTU.** If you run a VPN (WARP, Zscaler, Cisco) on Windows, WSL 2's default MTU of 1500 will cause packet drops and timeouts.

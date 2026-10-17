---
title: "WSL 3.0 & Modern WSL Architecture: Capabilities, Integration Patterns & Engineering SOP"
status: "active"
created: 2026-10-09
updated: 2026-10-09
author: "Naveen"
scribe: "Antigravity"
tags: [wsl3, wslc, containers, architecture, npu, gpu, virtiofs, monorepo, sop]
---

# WSL 3.0 & Modern WSL Architecture: Capabilities, Integration Patterns & Engineering SOP

> **Reference for current WSL capabilities, resource governance, WSL Containers (`wslc`), GPU support, and monorepo development patterns in the Polymath Platform.**

## Accuracy Note — WSL 3.0.2 Host Check (2026-10-16)

On this workstation, `wsl --version` reports **WSL 3.0.2.0**, while `wsl --list --verbose` reports the Ubuntu distribution as **VERSION 2**. These are compatible facts: `3.0.2` is the installed WSL product/package release; the distro still runs the WSL 2 architecture. WSL 3.0.2 is marked **Pre-release** by the upstream Microsoft/WSL release page. Upstream now lists **3.0.3** as the latest release, so this host is one package release behind. Treat this machine as a WSL 2 distro on the WSL 3.0.2 host release, not as a distinct WSL 3 guest/kernel architecture.

Several statements below describe features in the current WSL release line, not capabilities exclusive to WSL 3.0. In particular:

| Claim requiring qualification | Verified behavior |
| :--- | :--- |
| WSL 3 defaults Windows filesystem sharing to virtiofs | Not true. Microsoft documents VirtioFS as experimental and disabled by default; it also requires the `virtio` and `hostFileSystemAccess` settings. Keep builds on the distro's native ext4 filesystem, as this repo already does. |
| `wslc` is a WSL 3-only feature | `wslc` is included with WSL 2.9.3 and later and is in public preview. It is available on this host (`wslc 3.0.2.0`); it is independent of the distro version. |
| WSL 3 adds direct NPU passthrough / ONNX DirectML | Not established by Microsoft's supported WSL GPU documentation. WSL supports GPU compute paths such as CUDA on supported NVIDIA setups and documented DirectML workflows; this does not establish generic NPU passthrough or that an ONNX `DmlExecutionProvider` is available inside Linux. Treat NPU use as unsupported here unless a specific vendor/runtime documents and verifies it. |
| Mirrored networking, memory reclaim and sparse VHD are new WSL 3 architecture | These are WSL configuration features with individual platform/version requirements; they are not proof of a new guest architecture. This host's `.wslconfig` has mirrored networking, DNS tunneling, 10 GB memory, 4 GB swap, 6 processors, gradual reclaim, sparse VHD, auto-proxy, and host address loopback configured. |
| vNUMA is universally enabled | WSL 3.0.2 release notes say automatic vNUMA was enabled for large WSL VMs; don't infer a benefit for this 10 GB capped development VM without measurements. |

The WSL 3.0.2-specific additions verified upstream include sparse VHD creation behavior and automatic vNUMA for large VMs. Check the exact upstream release notes and Microsoft Learn configuration pages before relying on preview behavior. This workstation also has the built-in `wslc` CLI, but container workflows remain optional and are not needed for the mobile app's WSL/ext4 build path. Sources: [Microsoft WSL releases](https://github.com/microsoft/WSL/releases), [Microsoft WSL configuration reference](https://learn.microsoft.com/en-us/windows/wsl/wsl-config), [WSL containers documentation](https://learn.microsoft.com/en-us/windows/wsl/wsl-container), and [GPU compute in WSL](https://learn.microsoft.com/en-us/windows/wsl/tutorials/gpu-compute).

---

## 1. Executive Summary & The Architectural Paradigm Shift

The WSL package release line has reached **3.0.x**, while installed Linux distributions still use either the WSL 1 or WSL 2 architecture. The current Ubuntu distro on this workstation is WSL 2. WSL 3.0.x adds product features; it does not replace the WSL 2 guest architecture with a new “WSL 3” distro mode:

```
[WSL 1: Syscall Emulation] ➔ [WSL 2: Hyper-V Utility VM (9P I/O + NAT)] ➔ [WSL 3: Paravirtualized AI/Container Substrate]
```

### Key Architectural Evolution

| Domain | WSL 2 distro architecture | Current WSL package features | Impact on Polymath Monorepo |
| :--- | :--- | :--- | :--- |
| **Filesystem** | Linux distro files use the VHD's ext4 filesystem; Windows drives mount through DrvFs. | VirtioFS for Windows shares is experimental and disabled by default. | Keep repo, pnpm store, and Android toolchain under Linux ext4. Avoid claiming a generic 80% speedup without a benchmark. |
| **Containers** | Historically required Docker/Podman tooling. | Built-in `wslc` is available on WSL 2.9.3+ and remains a preview feature. | Useful for optional isolated tasks; not required for the mobile build workflow. |
| **Hardware Compute** | GPU compute is supported through documented vendor/runtime paths. | WSL 3.0.x does not establish generic NPU passthrough. | Use CUDA or other documented GPU paths only after checking the host GPU, driver, and runtime. |
| **Memory Management** | `.wslconfig` can cap VM memory and CPUs. | `autoMemoryReclaim` is configurable; vNUMA is enabled for large VMs in 3.0.2 release notes. | The host uses gradual reclaim with a 10 GB memory cap; measure before tuning. |
| **Disk Management** | Distro storage uses a dynamically growing VHD. | `sparseVhd=true` can make newly created VHDs sparse; behavior and compaction depend on version/settings. | Don't assume deleting Linux files immediately reduces host disk use; verify supported sparse/compact behavior. |
| **Networking** | NAT is the default; mirrored mode is an available configuration. | Mirrored networking and DNS tunneling are configurable WSL features, not exclusive WSL 3 architecture. | Host is configured with mirrored networking and DNS tunneling; verify connectivity in the specific VPN/firewall environment. |

---

## 2. Deep Dive: New Capabilities & Decision Trees

### A. Native WSL Containers (`wslc` / `container.exe`)

WSL 3.0 introduces native container management directly in Windows without running a persistent background Docker daemon:
* **Binary:** `wslc.exe` (aliased to `container.exe`).
* **Under the Hood:** A privileged Windows service (`wslservice.exe`) provisions isolated, ephemeral user sessions (`wslcsession.exe`) using a new network architecture ("Consommé") for instant port mapping.

#### Decision Matrix: When to Use `wslc` vs Docker / DevContainers

| Scenario | Recommended Engine | Rationale |
| :--- | :--- | :--- |
| **Disposable Single-Container Task** | ✅ `wslc` | Instant startup, zero daemon overhead, no third-party licensing. |
| **Ephemeral Test Isolation / CI Step** | ✅ `wslc` | Run isolated CLI checks or linters inside pure Alpine/Ubuntu containers. |
| **Multi-Container Stacks (`docker-compose`)** | ⚠️ Docker Desktop / Podman | `wslc` does not yet natively support `docker-compose` or the `DOCKER_HOST` socket API. |
| **Full Workspace DevContainer** | ⚠️ VS Code DevContainers / Docker | DevContainer specifications depend on standard Docker socket bindings. |

#### CLI Pattern: Using `wslc`
```powershell
# Inspect container status
wslc ps

# Run a disposable Linux container with automatic port forwarding
wslc run -it --rm -p 3000:3000 node:22-alpine sh

# Stop and clean up
wslc stop <container-id>
wslc rm <container-id>
```

---

### B. Hardware Acceleration: Documented GPU Paths

Microsoft documents GPU compute paths for WSL, including CUDA on supported NVIDIA systems and DirectML workflows. That does not establish direct NPU passthrough or a working ONNX DirectML execution provider inside Linux. For this workstation, treat NPU compute as unavailable until the specific hardware vendor and Linux runtime provide a supported path and it has been tested.

#### Detection Pattern: Verify the GPU and Runtime in WSL
```bash
# Check WSL's GPU device node. This alone does not prove a framework provider works:
ls -la /dev/dxg

# Check providers from the exact runtime installed in the distro:
python3 -c "import onnxruntime as ort; print(ort.get_available_providers())"
# Interpret only the providers actually returned; do not assume DmlExecutionProvider is available on Linux.
```

---

### C. Resource Governance: Memory & Disk Optimization

On a workstation with 32 GB RAM without dedicated AI GPUs, WSL is configured for maximum build performance without starving the Windows host.

#### Authoritative `.wslconfig` (Located in `C:\Users\<User>\.wslconfig`):
```ini
[wsl2]
# Mirrored networking maps ports bidirectionally (Metro 8081, Web 3000)
networkingMode=mirrored
dnsTunneling=true

# Upper ceiling: Guarantee at least 20GB of physical RAM remains for Windows
memory=12GB
swap=2GB
processors=6

[experimental]
# Balloon driver releases idle Linux file cache back to Windows after 5 min
autoMemoryReclaim=gradual

# Virtual hard disk automatically shrinks as Linux files are deleted
sparseVhd=true
autoProxy=true
```

#### The Sparse VHD `--allow-unsafe` Nuance
* **New Distros:** Created after `sparseVhd=true` is set automatically benefit from dynamic disk shrinkage.
* **Existing Distros:** Upstream Hyper-V enforces a safety guard against unexpected ext4 metadata corruption. To convert an existing distro, run:
  ```powershell
  wsl --shutdown
  wsl --manage Ubuntu --set-sparse true --allow-unsafe
  ```
* **Safe Alternative:** If you prefer not to use `--allow-unsafe`, run periodic manual compaction:
  ```powershell
  wsl --shutdown
  wsl --compact Ubuntu
  ```

---

## 3. Monorepo Integration Patterns & Code Recipes

### Pattern 1: Detecting WSL 3 & Feature Capabilities

When authoring automation scripts in `scripts/`, use feature detection rather than hardcoded assumptions:

```javascript
// scripts/lib/wsl-features.mjs
import { spawnSync } from 'node:child_process';

export function getWslCapabilities() {
  const result = spawnSync('wsl', ['--version'], { encoding: 'utf-8' });
  if (result.status !== 0) {
    return { available: false, packageVersion: null, packageMajor: null, hasWslc: false };
  }

  const raw = result.stdout;
  const match = raw.match(/WSL\s+version:\s*(\d+)\.(\d+)\.(\d+)/i);
  const major = match ? parseInt(match[1], 10) : null;
  const version = match ? `${match[1]}.${match[2]}.${match[3]}` : 'unknown';

  // Check wslc container capability
  const wslcCheck = spawnSync('wslc', ['--version'], { encoding: 'utf-8' });
  const hasWslc = wslcCheck.status === 0;

  return {
    available: true,
    packageVersion: version,
    packageMajor: major,
    hasWslc,
  };
}
```

---

### Pattern 2: High-Performance Pure Linux ext4 Mobile Build Flow

To completely bypass Windows path limits and file locks, the monorepo follows the pure Linux architecture documented in [`pure-linux-wsl-migration-sop.md`](file:///c:/x/apps/gurudevi-mobile/docs/infra/pure-linux-wsl-migration-sop.md):

```mermaid
graph LR
    subgraph "Windows 11 Host"
        IDE["Antigravity / VS Code Remote"]
        ADB_WIN["adb.exe (Port 5037)"]
        DEVICE["Physical Phone (USB)"]
        DEVICE --- ADB_WIN
    end

    subgraph "WSL 3.0 Linux ext4"
        REPO["/home/nsk/projects/polymath-platform"]
        METRO["Metro Bundler (Port 8081)"]
        GRADLE["Gradle Daemon (12GB cap)"]
        CCACHE["ccache Native Store"]
        
        REPO --> METRO
        REPO --> GRADLE
        GRADLE --> CCACHE
    end

    IDE -. "Remote IPC Socket" .-> REPO
    ADB_WIN <== "Mirrored Network localhost:8081" ==> METRO
    GRADLE ==> "APK deployed via Windows ADB alias" ==> ADB_WIN
```

#### Build Execution Commands:
```bash
# 1. Start Metro inside WSL ext4 (bound to localhost:8081 via mirrored network):
pnpm --filter gurudevi-mobile start

# 2. Compile Debug APK with tuned memory bounds:
export GRADLE_OPTS='-Xmx2048m -XX:MaxMetaspaceSize=384m'
pnpm --filter gurudevi-mobile run build:android

# 3. Install to connected device via Windows ADB alias:
alias adb='/mnt/c/Users/Naween/AppData/Local/Android/Sdk/platform-tools/adb.exe'
adb install -r apps/gurudevi-mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Agent Operational Guardrails for WSL 3

In compliance with `AGENTS.md` (Prime Directive & Cognitive Handshake), AI agents interacting with the WSL environment must observe these operational rules:

1. **Introspection Over Memory:** Never hallucinate `wslc` or `wsl` flags. Always run `wslc --help` or `wsl --status` first.
2. **Preserve Sacred Pins:** Never run `npx expo install --fix` inside Linux; version exclusions in `package.json` are sacred.
3. **Never Cross Filesystem Boundaries During Node Operations:** Never run `pnpm install` in `/mnt/c/` from inside WSL. Toolchain execution belongs 100% inside Linux `ext4` or 100% on Windows PowerShell.
4. **Clean Exit On Long-Running Daemons:** Always verify daemons are killed or managed when running background tasks.

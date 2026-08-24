---
title: "ðŸ› ï¸ Modern CLI Toolchain Guide"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, platform-mcp]
---

# 🛠️ Modern CLI Toolchain Guide

Welcome to your new, high-performance terminal experience. These tools are written in **Rust** and designed for extreme speed, smart defaults, and beautiful user interfaces.

---

## 🚀 The "Big Six" Essentials

| Tool | Command | Primary Purpose | Key Benefit |
| :--- | :--- | :--- | :--- |
| **Ripgrep** | `rg` | Search **content** inside files | 100x faster than traditional grep. |
| **fd** | `fd` | Search for **filenames** | Intuitive syntax; respects `.gitignore`. |
| **fzf** | `fzf` | Interactive **fuzzy filter** | The "glue" that lets you search anything. |
| **bat** | `bat` | Enhanced **file viewer** | Syntax highlighting and Git integration. |
| **zoxide** | `z` | Smarter **directory jumping** | Learns where you go; no more long `cd` paths. |
| **eza** | `eza` | Modern **file listing** | Colors, icons, and tree views. |
| **tokei** | `tokei` | **Code statistics** | Count LOC across languages instantly. |
| **sd** | `sd` | **Find & Replace** | Simple, fast replacement (sed slayer). |
| **dust** | `dust` | **Disk Usage** | Visualizes where your bytes are going. |
| **typos** | `typos` | **Spell Checker** | Source code spell checker with ultra-low false positives. |

---

## 🔍 ripGrep (`rg`)
*The fastest text searcher in existence.*

- **Basic search:** `rg "my_function"`
- **Case-insensitive:** `rg -i "todo"`
- **Search only specific files:** `rg "button" -g "*.tsx"`
- **With "Advanced" Regex:** `rg -P "(?=.*search)(?=.*term)"` (requires PCRE2 enabled)

## 📂 fd (`fd`)
*The user-friendly alternative to 'find'.*

- **Find by name:** `fd button`
- **Find by extension:** `fd -e tsx`
- **Execute for each result:** `fd -e css -x bat` (finds all CSS and views them with `bat`)

## ⚡ fzf (`fzf`)
*The terminal's magic magnifying glass.*

- **Interactive file find:** Just type `fzf`. It opens a UI where you can type fragments of a filename to jump to it.
- **Combined with fd:** `fd --type f | fzf` (pours all files into a fuzzy searcher).

## 🦇 bat (`bat`)
*A cat with wings (and colors).*

- **View a file:** `bat index.tsx`
- **Show only a range:** `bat --line-range 10:40 index.tsx`
- **Theme support:** Supports dozens of colorschemes like `Monokai` and `Nord`.

## 🚀 zoxide (`z`)
*Never type a full path again.*

- **Jump to a project:** `z polymath` (if you've been there once, it will find it).
- **Interactive jump:** `zi` (starts a fuzzy jump to your most frequent folders).

## 🌳 eza (`eza`)
*An `ls` for the 21st century.*

- **Standard listing:** `eza -la --icons`
- **Tree view:** `eza --tree --level=2`
- **Grid view:** `eza --grid`

---

## 📊 tokei (`tokei`)
*See your code from 30,000 feet.*

- **Summary of repo:** `tokei .`
- **Group by file:** `tokei --files .`

## ✍️ sd (`sd`)
*Intuitive find and replace.*

- **Project-wide replace:** `fd -t f | xargs sd "OldName" "NewName"`
- **Regex replace:** `sd "v(\d+)\.(\d+)" "version-$1-$2" file.txt`

## 🧹 typos (`typos`)
*Professional codebase hygiene.*

- **Check everything:** `typos`
- **Detailed report:** `typos --format json`

## 📦 dust (`dust`)
*Visualizing disk usage.*

- **Monorepo sizes:** `dust -d 1`

---

## ⚙️ Installation
To get this high-performance toolchain on your machine, follow these steps:

### Windows (via Winget)
Run these commands in an elevated PowerShell:
```powershell
winget install sharkdp.fd BurntSushi.ripgrep.MSVC sharkdp.bat ajeetdsouza.zoxide eza-community.eza sharkdp.hyperfine
```
**IMPORTANT:** After installation, restart your terminal or run `RefreshEnv` if using Chocolatey.

### macOS (via Homebrew)
```bash
brew install fd rg bat zoxide eza tokei sd dust typos
```

### Linux
Most distributions have these in their repositories:
```bash
# Ubuntu/Debian
sudo apt install fd-find ripgrep bat zoxide
# Fedora
sudo dnf install fd-find ripgrep bat zoxide eza
```

---

## 🔒 Security & Integrity
All tools are installed via **official package managers** (Winget, Brew, etc.) and verified with **cryptographic hashes**. 
*   **Repo Audit:** As of April 2026, no upstream supply chain attacks have been detected for these repositories.
*   **Reputation:** These are industry-standard tools used by millions of developers globally.

---

> [!TIP]
> **Don't forget to restart your terminal!** If a command says "not found," simply close and reopen PowerShell.

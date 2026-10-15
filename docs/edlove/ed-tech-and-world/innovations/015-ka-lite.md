---
title: "Innovation Dossier: KA-Lite (Offline Khan Academy & Mastery Learning Engine)"
status: "active"
created: 2026-09-02
updated: 2026-09-02
author: "Naveen"
scribe: "Antigravity"
tags: [innovations, ka-lite, learning-equality, offline-learning, khan-academy, mastery-learning, python-django, edlove-web]
---

# Innovation Dossier: KA-Lite (Offline Khan Academy & Mastery Learning Engine)

> **Category**: 2. Local-First & Offline-Resilient Infrastructure  
> **Origin / Custodian**: USA / Global / Foundation for Learning Equality (FLE) (Founded by Jamie Alexandre et al., 2012)  
> **Official Portal**: [learningequality.org/ka-lite](https://learningequality.org/ka-lite/)  
> **GitHub Repository**: [github.com/learningequality/ka-lite](https://github.com/learningequality/ka-lite) *(MIT License)*  
> **Predecessor to**: Kolibri Learning Platform (013)  
> **License**: MIT License (100% Free & Open Source)

---

## 1. Executive Summary & Core Philosophy

**KA-Lite** was the breakthrough open-source software project created by the Foundation for Learning Equality (FLE) that proved high-fidelity, interactive **mastery-based video and exercise education** could run on low-power, air-gapped computers without ever touching the live internet.

Khan Academy revolutionized online math and science pedagogy, but its proprietary web infrastructure required constant broadband internet access—locking out over 4 billion people in the Global South, rural schools, refugee camps, and correctional facilities. KA-Lite solved this by creating an **air-gapped local mirror**:
- **Full Offline Mastery Mechanics**: Packaged Khan Academy’s vast library of compressed MP4 video lectures, localized subtitles, and interactive JavaScript exercises (Perseus engine).
- **Local Teacher Analytics**: Enabled local teachers to register student accounts, assign exercise playlists, and track individual student mastery progress via a local SQLite database without cloud telemetry.

---

## 2. Architectural & Technical Foundation

```
┌────────────────────────────────────────────────────────────────────────┐
│ KA-LITE AIR-GAPPED SYSTEM ARCHITECTURE                                 │
├────────────────────────────────────────────────────────────────────────┤
│ • Core Web Server: Python (2.7 / 3.x) + Django Web Framework           │
│ • Local Database: SQLite (Zero-configuration file-based database)      │
│ • Assessment Engine: Khan Academy Perseus (Interactive JS exercises)  │
│ • Media Subsystem: Compressed H.264 MP4 videos + WebVTT subtitles     │
│ • Sync Bridge: Asynchronous REST API over JSON / USB sneakernet data   │
│ • Hardware Targets: Raspberry Pi, old Windows XP/7/10 PCs, Android SBCs│
└────────────────────────────────────────────────────────────────────────┘
```

1. **Self-Contained Python/Django Runtime**:
   - Packaged with an embedded CherryPy/WSGI server and SQLite database, allowing it to be installed on any legacy desktop computer, low-cost netbook, or $35 Raspberry Pi with a single click.

2. **Perseus Interactive Assessment Engine**:
   - Rather than static video viewing, KA-Lite bundled Khan Academy's rich interactive exercise framework (hints, dynamic variable math generation, interactive graphs, step-by-step scratchpads) running 100% client-side in the browser.

3. **Two-Tier Synchronization Topology**:
   - **Central Quality Server**: Curated, scraped, and compressed content packages.
   - **Distributed Edge Devices**: Synced student progress logs via USB thumb drives or opportunistic Wi-Fi bursts back to regional educational ministries.

---

## 3. Comparative Matrix: Online Khan Academy vs. KA-Lite Local Server

| Dimension | Khan Academy Web (khanacademy.org) | KA-Lite Air-Gapped Engine |
| :--- | :--- | :--- |
| **Connectivity Requirement** | Continuous high-speed broadband connection | **Zero Internet Required (100% Local Wi-Fi / LAN)** |
| **Hardware Overhead** | Modern browser + High memory overhead | **Legacy hardware (Runs on 512MB RAM, Windows XP, RPi)** |
| **Data Privacy** | Cloud profile / Centralized server storage | **100% Sovereign local SQLite database** |
| **Cost to Deploy** | Heavy recurring data bandwidth costs | **$0 recurring cost (One-time offline flash image)** |

---

## 4. Synthesis & Key Lessons for EdLove & Gurudevi (Sri Lanka)

### Strengths to Emulate:
1. **Interactive Mastery over Static PDFs**: Proved that offline learners deserve rich, interactive problem-solving engines, not just dead PDF scans or passive video playback.
2. **Extreme Hardware Forgiveness**: Ran smoothly on donated, obsolete Pentium-grade computers across thousands of developing world schools.

### Limitations:
1. **Monolithic Content Coupling**: Originally tied strictly to Khan Academy's curriculum structure, which led Learning Equality to architect **Kolibri** (a modular, multi-source OER ecosystem).

### ✦ Direct Grounding for Sri Lankan National Syllabus Delivery:
- The National Institute of Education (NIE) in Sri Lanka produces video lessons and past papers, but students in rural areas cannot afford the mobile data to stream them.
- EdLove takes the core architectural lesson of KA-Lite (bundling interactive JS assessments with compressed video on local SQLite runtimes) to distribute Sri Lankan G.C.E. O/L and A/L science, math, and history curricula for offline village deployment.

---
title: "Innovation Dossier: Planboard by Chalk (Curriculum Mapping & Calm Lesson Architecture)"
status: "active"
created: 2026-09-02
updated: 2026-09-02
author: "Naveen"
scribe: "Antigravity"
tags: [innovations, planboard, chalk-com, lesson-planning, curriculum-mapping, teacher-tools, standards-alignment, edlove-web]
---

# Innovation Dossier: Planboard by Chalk (Curriculum Mapping & Calm Lesson Architecture)

> **Category**: 4. Teacher Sovereignty & Calm Instruments  
> **Origin / Custodian**: Canada / Chalk.com (Founded by William Zhou & Suraj Srinivas, acquired by PowerSchool)  
> **Official Portal**: [chalk.com/planboard](https://www.chalk.com/planboard/)  
> **Mobile Surface**: Native iOS & Android Apps (Planboard for Teachers)  
> **License**: Free for Individual Educators / Enterprise SaaS for Districts

---

## 1. Executive Summary & Core Philosophy

**Planboard by Chalk** is an acclaimed digital lesson planning and curriculum mapping instrument designed to replace chaotic physical paper planner binders and rigid administrative word-processor templates with a **fluid, timetable-synchronized, standards-aligned digital planning workspace**.

Traditional teacher lesson planning is plagued by administrative double-entry: teachers must write daily lesson notes in paper logbooks, re-type them into district compliance portals, and manually track which state educational standards were addressed. Planboard was architected with a **teacher-first calm workflow**:
- **Timetable-Linked Lesson Cards**: The planner automatically mirrors the teacher’s rotating school schedule (A/B block schedules, 6-day cycles), placing a clean markdown/rich-text canvas on every teaching period.
- **Dynamic Curriculum Standard Tagging**: Pre-loads international and state curriculum standards; teachers simply click or search standards to link them to specific lesson activities.
- **Effortless Schedule Shifting ("Bump Lesson")**: When a snow day, flood, or unexpected school assembly cancels class, a single "Bump" button shifts the entire lesson sequence forward one day, eliminating manual rescheduling chaos.

---

## 2. Architectural & Technical Foundation

```
┌────────────────────────────────────────────────────────────────────────┐
│ PLANBOARD FRONTEND & CURRICULAR MAPPING TOPOLOGY                       │
├────────────────────────────────────────────────────────────────────────┤
│ • Web UI: React SPA + Draft.js / Quill Rich-Text Block Editor          │
│ • State Architecture: Redux / Flux store for timetable grid rendering  │
│ • Mobile Native: Swift (iOS) & Kotlin (Android) with Offline Caching   │
│ • Backend Services: Node.js / Java Spring API + PostgreSQL             │
│ • Standards Index: Elasticsearch (Fast instant lookup across standards)│
│ • Document Export: PDF Compiler (Generates formatted printable binders)│
└────────────────────────────────────────────────────────────────────────┘
```

1. **Cycle-Aware Timetable Grid Engine**:
   - Handles non-standard school schedules: alternating 2-week block rotations, rotating 6-day cycle timetables, and custom holiday schedules with automatic period layout.

2. **Standards Tagging & Coverage Heatmaps**:
   - Indexes tens of thousands of curriculum standards. As teachers tag lessons, the system generates real-time coverage heatmaps showing which curriculum competencies have been thoroughly taught and which need review before term exams.

3. **Offline Mobile Synchronization**:
   - The native iOS and Android apps allow teachers to draft lesson plans, attach photos of board drawings, and review schedules offline during daily commutes, syncing when connected to Wi-Fi.

---

## 3. Comparative Matrix: Paper Teacher Planners vs. Planboard Digital Instrument

| Dimension | Physical Paper Lesson Planner | Planboard Digital Platform |
| :--- | :--- | :--- |
| **Schedule Rescheduling** | Messy white-out, manual erasing, rewriting | **1-Click "Bump" (Instantly shifts future lessons)** |
| **Curriculum Tracking** | Manual page-flipping to match syllabus codes | **Instant standard search & automated coverage reports** |
| **Multimedia Integration** | Cannot embed videos, audio, or slide links | **Direct embedding of YouTube, Google Drive, PDFs, audio** |
| **Sharing & Collaboration**| Physical photocopying required | **Shareable read-only links for substitute teachers** |

---

## 4. Synthesis & Key Lessons for EdLove & Gurudevi (Sri Lanka)

### Strengths to Emulate:
1. **The 1-Click "Bump" Mechanism**: Recognizing that real school days are messy and unpredictable, designing software that absorbs schedule disruptions gracefully.
2. **Visual Standards Alignment**: Making curriculum compliance feel like a natural byproduct of good lesson design rather than a bureaucratic chore.

### Limitations:
1. **Corporate Acquisition Drift**: Following its acquisition by enterprise giant PowerSchool, standalone development slowed in favor of enterprise district sales pipelines.

### ✦ Direct Grounding for Sri Lankan National Curriculum Lesson Plans:
- Sri Lankan teachers are required by provincial education directors to maintain formal written lesson note books (*Padam Satahan Potha*), spending dozens of unpaid hours each week hand-copying syllabus competency codes.
- EdLove and Gurudevi can implement a **native, local-first Planboard module**: pre-loaded with all Sri Lankan NIE competency codes (Grade 1–13, Sinhala/Tamil/English), allowing teachers to generate compliant, beautiful lesson plans in minutes and export printable PDF summaries for school inspectors.

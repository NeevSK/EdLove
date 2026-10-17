---
title: "Lanka Data Foundation (LDF) & Real-Time Telegram Ecosystem Integration"
status: "active"
created: 2026-10-09
updated: 2026-10-09
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, ldf, lsf, telegram, education-atlas, civic-data, open-data]
---

# Lanka Data Foundation (LDF) & Real-Time Telegram Ecosystem Integration

> **Executive Summary:** This document records the empirical implementation and integration of the **Lanka Data Foundation (LDF)** open-data gazette archive and the **Expanded Sri Lankan Telegram Educational Channel Network** into the local SQLite Write-Ahead Logging (WAL) Civic-Epistemic substrate.

---

## 1. Lanka Data Foundation (LDF) Adapter

### 1.1 Source & Provenance
* **Upstream Repository:** `https://github.com/LDFLK/gztarchiver-storage`
* **Metadata Authority:** `metadata/global_metadata.json` (30,014 pre-indexed gazette records spanning 2015 to Present).
* **Adapter Implementation:** [`scripts/education-atlas/adapters/ldf-adapter.mjs`](file:///c:/x/scripts/education-atlas/adapters/ldf-adapter.mjs)

### 1.2 Ingestion & Normalization Mechanics
The adapter connects to the LDF automated archive and filters for educational, academic, and public service notices using domain taxonomy keywords:
* Target Keywords: `education`, `school`, `teacher`, `examination`, `university`, `curriculum`, `syllabus`, `scholarship`, `vidyalaya`, `pirivena`, `ugc`, `nie`, `tvec`, `sliate`, `admission`, `efficiency bar`, `slts`, `sleas`, `slps`.
* **Yield:** Ingested **794 high-authority gazette circulars and governance notices** into `resources` table.
* **Fields Mapped:**
  * `resource_id`: `LK-LDF-${document_id}`
  * `source_id`: `LK-SOURCE-LDF-ARCHIVE`
  * `title`: Extracted institutional description
  * `summary`: LDF administrative categorisation
  * `canonical_url` & `download_url`: Direct government gazette PDF mirror
  * `publication_date`: ISO 8601 date
  * `ingested_via`: `ldf_adapter`

---

## 2. Real-Time Educational Telegram Monitor

### 2.1 Monitored Public Channels
To avoid the friction of standalone mobile applications, the harvester taps into active Sri Lankan public Telegram channels that act as the primary distribution layer for teachers and students:

| Channel Handle | Channel Title | Domain Focus |
| :--- | :--- | :--- |
| `@pastpaperswiki` | Past Papers WiKi Telegram Hub | G.C.E. O/L & A/L past papers, model papers |
| `@alapiedu` | A/L Api Examination Resources Hub | Advanced Level academic resources |
| `@apepanthiyalk` | Ape Panthiya Exam & Notes Hub | Secondary school notes & term test papers |
| `@applicationslk` | Applications.lk Official Gazette & Circulars | Weekly government vacancies & circulars |
| `@governmentjobslk` | Government Jobs LK Vacancy Channel | Public service and teaching vacancies |
| `@gazettelk` | Gazette.lk Official Gazette Alerts | Real-time Friday gazette updates |
| `@sinhalagazette` | Sinhala Gazette & Public Notices | Sinhala medium gazette extracts |
| `@cmwithmn_26MR` | Combined Mathematics Academic Community | Subject-specific G.C.E. A/L teacher community |

### 2.2 Extraction & Classification Mechanics
* **Implementation:** [`scripts/education-atlas/harvesters/telegram-channel-monitor.mjs`](file:///c:/x/scripts/education-atlas/harvesters/telegram-channel-monitor.mjs)
* **Zero-Auth Protocol:** Queries public web channel previews (`https://t.me/s/${username}`) with zero API keys or authentication requirements.
* **Heuristic Classification:**
  * **Exam Level:** Automatically tags `GCE A/L`, `GCE O/L`, `Grade 5 Scholarship`, or `Term Test`.
  * **Resource Type:** Distinguishes `marking_scheme`, `model_paper`, `past_paper`, `syllabus`, and `curriculum_doc`.
  * **Language Medium:** Scans for Sinhala (`\u0D80-\u0DFF`) and Tamil (`\u0B80-\u0BFF`) character blocks to classify medium as `sinhala`, `tamil`, `english`, or `trilingual`.

---

## 3. Database State Post-Ingestion

Running `node scripts/education-atlas/verify-status.mjs` confirms the live state of the unified database (`data/education-atlas/atlas_staging.db`):

```text
===========================================================
  SRI LANKA EDUCATION ATLAS & DISCOVERY PLATFORM STATUS    
===========================================================

[Sources Registry] Total Registered Entities: 128
- Candidate Sources: 100
- Community Channels: 10
- Official National Bodies: 8
- Independent Public Sources: 5
- University Repositories: 2
- Public Library Repositories: 2
- Open Resource Repositories: 1

[Cataloged Resources] Total Indexed Items: 3,430
- Library Catalogues: 2,001
- Official Circulars: 1,087
- Statistical Digests: 119
- Marking Schemes: 99
- Assessment Resources: 81
- Exam Resources: 16
- Textbooks & Guides: 27

[Ingestion Channels Breakdown]
- manus_export:      2,323 records
- ldf_adapter:         794 records
- gazette_harvester:   290 records
- telegram_monitor:     23 records
```

---

## 4. Next Phase: Search API & Omnichannel Delivery
With 3,430 verified records indexed in SQLite WAL mode:
1. **Search Port:** Expose the sub-millisecond FTS5 search engine via a lightweight REST / Hono endpoint.
2. **WhatsApp / Web Bot:** Build the conversational query adapter so teachers and students can query circulars and past papers directly via natural language.

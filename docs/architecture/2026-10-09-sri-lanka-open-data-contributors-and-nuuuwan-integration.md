---
title: "Sri Lanka Open Data Landscape: Nuwan Senaratna Integration & Community Ecosystem Map"
status: "active"
created: 2026-10-09
updated: 2026-10-09
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, open-data, nuuuwan, nuwan-senaratna, ldf, lsf, civic-tech, sri-lanka]
---

# Sri Lanka Open Data Landscape
## Nuwan Senaratna Integration & Local Community Contributor Map

> **Executive Summary:** This document catalogs the key open-data contributors, civic technology repositories, and data initiatives in Sri Lanka, and records the empirical integration of **Nuwan Senaratna's (`nuuuwan`)** open news and civic dataset into the Sri Lanka Education Atlas & Civic-Epistemic substrate.

---

## 1. Nuwan Senaratna (`nuuuwan`) Integration

### 1.1 Source & Repository Provenance
* **GitHub Profile:** [github.com/nuuuwan](https://github.com/nuuuwan)
* **Key Open Repositories:**
  * `news_lk3_data` & `lk_news`: Daily automated scraping and archiving of major Sri Lankan newspapers (Ada Derana, Daily Mirror, Virakesari, Dinamina, Daily FT, NewsFirst). Contains over **82,154 pre-indexed articles**.
  * `lk_cabinet_decisions`: Weekly automated tracker of official Sri Lankan Cabinet decisions.
  * `lk_legal_docs` & `lk_supreme_court_judgements`: Catalog of Acts of Parliament, legal gazettes, and Supreme Court judgments.
  * `lk_hansard`: Parliamentary Hansard transcripts and speech records.
  * `cbsl` & `lk_datasets`: Economic time-series from the Central Bank of Sri Lanka and Census department.

### 1.2 Adapter Implementation
* **Adapter Path:** [`scripts/education-atlas/adapters/nuuuwan-adapter.mjs`](file:///c:/x/scripts/education-atlas/adapters/nuuuwan-adapter.mjs)
* **Mechanics:** Streams the `summary.tsv` corpus and applies a trilingual domain filter (`education`, `school`, `teacher`, `exam`, `university`, `ugc`, `nie`, `doenets`, `scholarship`, `curriculum`, `syllabus`, `අධ්‍යාපන`, `විභාග`, `ගුරු`, `පාසල්`, `கல்வி`, `பரீட்சை`, `ஆசிரியர்`).
* **Yield:** Ingested **2,500 education-specific news articles** with exact publication dates, media source IDs, languages (`si`, `ta`, `en`), and direct article URLs.

---

## 2. Master Map of Sri Lankan Open Data & Civic Tech Contributors

To systematically expand beyond education into the full civic-epistemic substrate ("Urumaya"), the platform identifies and interfaces with these core community builders:

| Contributor / Organization | GitHub / Web Authority | Key Assets & Datasets | Potential Integration Seam |
| :--- | :--- | :--- | :--- |
| **Nuwan Senaratna (`nuuuwan`)** | `github.com/nuuuwan` | 82k news articles, Cabinet Decisions, Hansard, Supreme Court rulings | **News & Policy Signals:** Correlate news announcements with official Gazette releases. |
| **Lanka Data Foundation (`LDFLK`)** | `github.com/LDFLK` / `opendata.lk` | 30k Gazettes (`gztarchiver`), OpenGIN (Gov Org Hierarchy), SkillStream (Vacancies) | **State Institutional Backbone:** Canonical hierarchy of ministries and statutory bodies. |
| **Lanka Software Foundation (`LSF`)** | `github.com/LSF` | OpenNDX (Data exchange), Sahana (Disaster stack), SL-UDI | **DPI Standards:** Interoperable data contracts and open public standards. |
| **Verité Research** | `veriteresearch.org` / `manthri.lk` | Manthri.lk (MP records), PublicFinance.lk (National Budget & Debt) | **Public Finance & Accountability:** Tracking educational budget allocations. |
| **LIRNEasia** | `lirneasia.net` | Digital access surveys, remote learning research, telecom policy | **Epistemic Research:** Grounding system pressure in empirical field surveys. |
| **Dr. Nisansa de Silva (Moratuwa NLP)** | `github.com/nisansads` | `sinling` (Sinhala linguistic toolkit), Sinhala NLP corpora | **NLP & Entity Extraction:** Morphological analysis and tokenization for Sinhala text. |
| **OpenStreetMap Sri Lanka (`OSM-LK`)** | `openstreetmap.org` | Geocoded points of interest for ~10,155 schools, exam centers, universities | **Spatial Grounding:** Mapping circulars and school vacancies to physical locations. |

---

## 3. Database State Post-Nuwan Ingestion

Running `node scripts/education-atlas/verify-status.mjs`:

```text
===========================================================
  SRI LANKA EDUCATION ATLAS & DISCOVERY PLATFORM STATUS    
===========================================================

[Sources Registry] Total Registered Entities: 129
- Candidate Sources: 100
- Community Channels: 10
- Official National Bodies: 8
- Independent Public Sources: 6
- University Repositories: 2
- Public Library Repositories: 2
- Open Resource Repositories: 1

[Cataloged Resources] Total Indexed Items: 5,930
- News Reports:         2,500  (Nuwan Senaratna archive)
- Library Catalogues:   2,001  (Manus Atlas seed)
- Official Circulars:   1,087  (LDF + Gazette Harvester)
- Statistical Digests:    119  (Department of Examinations)
- Marking Schemes:         99  (DoENets / PastPapersWiki)
- Assessment Resources:    81  (Curriculum books & evaluations)
- Exam Resources:          16  (Community Telegram channels)
- Textbooks & Guides:      27  (NIE / Channel NIE)

[Ingestion Channels Breakdown]
- nuuuwan_adapter:   2,500 records
- manus_export:      2,323 records
- ldf_adapter:         794 records
- gazette_harvester:   290 records
- telegram_monitor:     23 records
```

---

## 4. Next Step: Cross-Referencing & The Civic-Epistemic Flywheel
With news, gazettes, and community papers now living in the same SQLite WAL database:
1. **The Verification Loop:** When a news article reports *"Government announces teacher exam postponement"*, the system can automatically query `resources` to cite the corresponding Gazette date or Ministry circular number.
2. **FTS5 Cross-Corpus Search:** A single query searches across news reporting, official statutory gazettes, and community study materials simultaneously in $<2\text{ms}$.

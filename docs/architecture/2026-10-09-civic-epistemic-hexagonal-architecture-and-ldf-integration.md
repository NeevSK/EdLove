---
title: "Civic-Epistemic Hexagonal Architecture: LDF/LSF Infrastructure Integration & Education-First Domain"
status: "active"
created: 2026-10-09
updated: 2026-10-09
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, hexagonal, ldf, lsf, urumaya, civic-tech, education-domain, open-data]
---

# Civic-Epistemic Hexagonal Architecture
## Composing LDF/LSF Infrastructure Foundations with an Education-First Domain

> **Core Thesis:** Open-data initiatives like the **Lanka Data Foundation (LDF)** and **Lanka Software Foundation (LSF)** have spent years laying foundational structural bricks: institutional hierarchies (OpenGIN), data-exchange frameworks (OpenNDX), and historical public archives. Rather than duplicating their efforts, the **Civic-Epistemic Engine ("Urumaya")** operates as a clean **Hexagonal (Ports and Adapters)** system that depends on and composes these open assets, anchoring **Education** as its flagship operational domain.

---

## 1. The Architectural Separation of Concerns

### 1.1 The Macro Foundation (LDF & LSF)
* **What they provide:** Macro-level public infrastructure.
  * **OpenGIN / Department Flow View:** Canonical mappings of state institutional hierarchies (which ministry controls the Department of Examinations, how departments shifted across gazettes).
  * **OpenNDX / Data Exchange:** Standards for inter-agency data interoperability.
  * **Macro Census Datasets:** High-level economic, labor, and demographic indicators.
* **Their limit:** They operate at the institutional and research level; they do not build day-to-day citizen resolution workflows for individual teachers, students, or parents dealing with practical pressures.

### 1.2 The Civic-Epistemic Layer ("Urumaya")
* **What we provide:** The human-facing, pressure-aware application of state reality.
  * Bridges formal legal circulars and exam schedules with lived experience (exam anxiety, teacher transfer friction, syllabus changes).
  * Translates raw institutional gazettes into direct, actionable next steps.
  * Employs zero-friction distribution (Google Search, WhatsApp, Telegram) rather than enterprise dashboards.

---

## 2. Hexagonal Topology (Ports & Adapters)

To ensure the platform remains modular, cost-free, and adaptable across future domains (health, pensions, civic rights), all external integrations are isolated behind strict contracts:

```
[ Inbound Adapters ]                [ Hexagonal Core ]               [ Outbound Adapters ]
- Google SEO Landing Pages   ──►   ┌────────────────────────┐   ──►  - LDF OpenGIN Adapter
- WhatsApp / Telegram Bot    ──►   │ Civic-Epistemic Core:  │   ──►  - Gazette Harvester (documents.gov.lk)
- Ceylon Field Notebook UI   ──►   │ - Education Substrate  │   ──►  - Telegram Community Harvester
- Public REST / GraphQL API  ──►   │ - Urumaya Epistemic    │   ──►  - SQLite WAL / DuckDB ($0 Storage)
                                   │ - Pressure Maps        │
                                   └────────────────────────┘
```

### 2.1 The Inbound Ports (Drivers / Interaction)
1. **`SearchAndQueryPort`:** Full-text and faceted search by grade, subject, year, medium, circular number, and ministry.
2. **`AlertNotificationPort`:** Triggers event streams when new Friday gazettes or emergency ministerial notices are published.
3. **`ConversationalDialoguePort`:** Grounded question-answering adapter capable of taking natural Sinhala/Tamil queries and returning verified citations and PDF links.

### 2.2 The Outbound Ports (Driven / Substrate)
1. **`InstitutionTaxonomyPort`:** Consumes ministry and department metadata.
   * *Adapter:* **LDF OpenGIN Adapter** (syncs canonical state institution IDs and historical cabinet portfolios).
2. **`StatutoryDocumentPort`:** Consumes legal publications.
   * *Adapter:* **Gov Printing Gazette Harvester** (Friday Next.js stream).
3. **`CurriculumAndAssessmentPort`:** Consumes pedagogical records.
   * *Adapter:* **Education Ministry & NIE Harvesters** (Syllabi, TIMs, marking schemes).
4. **`CommunitySignalPort`:** Consumes real-time grassroots files.
   * *Adapter:* **Telegram & Social Harvesters** (Teacher groups, past paper hubs).
5. **`PersistencePort`:** Durable, zero-cost storage.
   * *Adapter:* **SQLite WAL & Parquet Adapter** (Local disks, GitHub Releases for backups).

---

## 3. Why Education Must Be the Flagship Bounded Domain

Starting with a vague, broad "Civic Platform" is the primary cause of civic tech failure. Anchoring **Education** first provides three decisive strategic advantages:

### 3.1 Acute, High-Stakes Personal Urgency
Unlike general public policies (which citizens only care about during elections), education generates **constant, acute human pressure**:
* A student studying for the G.C.E. Advanced Level has an urgent, non-negotiable need for marking schemes and syllabus clarifications.
* A teacher facing a provincial transfer circular or efficiency bar exam has their livelihood tied to timely regulatory truth.
* A parent seeking Grade 1 admissions or Grade 5 scholarship papers is actively searching every single week.

### 3.2 High-Structure, Machine-Friendly Data
Education data naturally organizes into clean, universal facets:
$$\text{Record} = f(\text{Stage/Grade}, \text{Subject}, \text{Exam Level}, \text{Medium: SI/TA/EN}, \text{Year}, \text{Authority})$$
This allows building bulletproof full-text search indexes (like our SQLite FTS5 index) with zero ambiguity.

### 3.3 Natural Viral Community Distribution
Sri Lankan education already possesses the largest, most active grassroots distribution network in the country:
* Thousands of active teacher WhatsApp groups and student Telegram channels.
* By serving this community first with verified, clean resources, the platform builds **instant authority and trust**. Once that epistemic trust is earned, expanding to adjacent civic domains (Teacher Pensions, Civil Service Rights, Public Health) is natural.

---

## 4. Architectural Domain Evolution Roadmap

```
[ Phase 1: Education Atlas ] (Current Flagship)
  ├── 120 Sources, 2,618 Verified Records
  ├── Friday Gazette Section IIA (Teaching Jobs/Exams)
  └── Trilingual Past Papers, Marking Schemes & Syllabi
          │
          ▼
[ Phase 2: Public Service & Administrative Rights ]
  ├── Gazette Part I: General Circulars (Pensions, Leaves, Increments)
  ├── Public Service Commission (PSC) Minutes
  └── Establishments Code (ආයතන සංග්‍රහය) Search Engine
          │
          ▼
[ Phase 3: The Full Civic-Epistemic Substrate (Urumaya) ]
  ├── LDF OpenGIN Deep Mapping (Citizen interaction with all state bodies)
  ├── Open Civic API Toolkit (Modular backend for ethical Sri Lankan civic tools)
  └── Conversational Multilingual Agent (WhatsApp / Public Web)
```

---

## 5. Non-Negotiable Invariants

1. **Zero-Cost Sovereign Infrastructure:** Core services must run on embedded/open-source engines (SQLite WAL, DuckDB, static CDN distribution). No cloud vendor bills.
2. **Strict Ports & Adapters Isolation:** The core domain logic (`packages/education-atlas` or `packages/core`) must never import scraper libraries or external network fetchers directly. External data enters solely through defined ports.
3. **Trilingual Dignity by Default:** Every schema and port must treat Sinhala (`si`), Tamil (`ta`), and English (`en`) as first-class citizens.
4. **Link-First & Citation-Grounding:** The platform never claims authority of its own; it provides verifiable citations back to the official gazette date, circular number, or state publisher.

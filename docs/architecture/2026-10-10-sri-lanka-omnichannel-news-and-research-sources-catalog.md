---
title: "Sri Lanka Omni-Channel News & Research Sources Catalog: Architecture, Entities & Ingestion Paths"
status: "active"
created: 2026-10-10
author: "Naween & Antigravity"
tags: [civic-data, sources-catalog, research-institutes, news-ecosystem, sri-lanka, triangulation, 2026]
---

# Sri Lanka Omni-Channel News & Research Sources Catalog

> **PURPOSE & SCOPE:**  
> This catalog serves as the canonical registry of all information providers, research institutes, official state publishers, vernacular breaking services, and independent civic data initiatives across Sri Lanka. Each source is codified with its institutional lineage, trilingual identity, ingestion endpoint (RSS, REST, Scraping, Static TSV), authority tier, and calibrated triangulation weight ($w_i$) under the **TCDI Triangulation Model**.

---

## 1. Epistemic Taxonomy & Weighting Standards

Sources in the Sri Lankan civic and research ecosystem are organized into five structural tiers, calibrated according to empirical reliability, legal standing, and susceptibility to partisan distortion:

| Source Kind | Description | Example Entities | Base Weight ($w_i$) |
| :--- | :--- | :--- | :---: |
| **Tier 1: Legal Bedrock & State Gazettes** | Primary legislative instruments, gazette orders, parliamentary acts. | Dept of Government Printing, Parliament, CBSL Monetary Law. | **0.85 – 0.90** |
| **Tier 2: Sovereign Research & Think Tanks** | Independent empirical research, econometrics, poverty analysis, civil liberties. | Verité, Frontier, IPS, CEPA, LIRNEasia, CPA, ICES, Heidelberg SAI. | **0.70 – 0.80** |
| **Tier 3: Official State Press & Information** | Official press statements, cabinet decisions, exam timetables. | DGI (`news.lk`), PMD, DoENets, Ministry of Education, TVEC. | **0.60 – 0.75** |
| **Tier 4: Mainstream Vernacular Press & Media** | National print and broadcast news across English, Sinhala, and Tamil. | Wijeya (Mirror/Lankadeepa), ANCL (Lake House), Express (Virakesari), Derana, Hiru, NewsFirst, EconomyNext. | **0.40 – 0.50** |
| **Tier 5: Real-Time Breakers & Community** | Mobile push notification services, Telegram teacher channels, grassroots forums. | Helakuru Esana, PastPapersWiki, Teacher Union Telegrams. | **0.20 – 0.35** |

---

## 2. Category A: Sovereign Research Institutes & Civic Think Tanks

These institutions produce the primary qualitative, econometric, and structural analysis in Sri Lanka. They provide the deep contextual layer that explains *why* a policy or gazette happened.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CATEGORY A: SOVEREIGN RESEARCH INSTITUTES                       │
├────────────────────────┬─────────────────────────────┬─────────────────────────────────┤
│ Institute / Entity ID  │ Focus & Key Leadership      │ Public Access & Ingestion Path  │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Verité Research        │ Economics, Legal, Media,    │ • Web: veriteresearch.org       │
│ `inst:verite_research` │ Public Finance. Led by      │ • Publications: Open PDFs       │
│                        │ Dr. Nishan de Mel.          │ • PublicFinance.lk platform     │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Frontier Research      │ Macro, Sector, Curation.    │ • Web: frontiergroup.info       │
│ `inst:frontier_res`    │ Founded by late Amal &      │ • Substack / Medium briefings   │
│                        │ Ayoma Sanderatne.           │ • Time-tracking executive notes │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Institute of Policy    │ State think tank on macro,  │ • Web: ips.lk                   │
│ Studies (IPS)          │ trade, labor, education.    │ • Publications: Annual "State   │
│ `inst:ips_lk`          │ Dr. Dushni Weerakoon.       │   of the Economy" & Policy Docs │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Centre for Poverty     │ Poverty dynamics, social    │ • Web: cepa.lk                  │
│ Analysis (CEPA)        │ development, rural credit.  │ • Open Research Repository:     │
│ `inst:cepa_lk`         │ Fieldwork-grounded research.│   Publications, briefs & blogs  │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ LIRNEasia              │ Telecom, digital policy,    │ • Web: lirneasia.net            │
│ `inst:lirneasia_lk`    │ AI readiness, data governance│ • Open Data: Survey datasets,  │
│                        │ Prof. Rohan Samarajiva.     │   research reports (CC-BY)      │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Centre for Policy      │ Constitutional reform,      │ • Web: cpalanka.org             │
│ Alternatives (CPA)     │ human rights, governance.   │ • Groundviews (citizen journal) │
│ `inst:cpa_lk`          │ Dr. P. Saravanamuttu.       │ • Vikalpa (SI), Maatram (TA)    │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Lanka Data Foundation  │ Civic open data, Gazette    │ • GitHub: github.com/LDFLK      │
│ (LDF) `inst:ldf_lk`    │ archiver, spatial census.   │ • Storage: 30k+ parsed gazettes │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Lanka Software         │ Open source governance,     │ • Web: opensource.lk            │
│ Foundation (LSF)       │ digital public goods.       │ • GitHub: github.com/lsflk      │
│ `inst:lsf_lk`          │ Dr. Sanjiva Weerawarana.    │ • Sahana disaster, digital id   │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Heidelberg University  │ Historical, sociological,   │ • Web: uni-heidelberg.de/sai    │
│ South Asia Inst (SAI)  │ and academic research on SL.│ • Colombo branch office records │
│ `inst:heidelberg_sai`  │ Sri Lanka Chair program.    │ • Academic papers & monographs  │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Social Scientists'     │ Feminist economics, agrarian│ • Web: ssalanka.org             │
│ Association (SSA)      │ history, ethnic studies.    │ • Pravada journals & books      │
│ `inst:ssa_lk`          │ Dr. Kumari Jayawardena.     │                                 │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Int. Centre for Ethnic │ Constitutionalism, gender,  │ • Web: ices.lk                  │
│ Studies (ICES)         │ ethnic reconciliation.      │ • Monograph series & policy     │
│ `inst:ices_lk`         │ Radhika Coomaraswamy.       │   working papers                │
└────────────────────────┴─────────────────────────────┴─────────────────────────────────┘
```

---

## 3. Category B: State & Institutional Official Publishers

These represent the primary legal, ministerial, and regulatory authority of the country.

1. **Department of Government Information (DGI / `news.lk`):**
   * **Entity:** `inst:dgi_lk` | **Source:** `LK-SOURCE-DGI-NEWS`
   * **Role:** Official communications arm of the Government of Sri Lanka.
   * **Ingestion Paths:**
     * News RSS: `https://news.lk/news?format=feed&type=rss`
     * Cabinet Decisions RSS: `https://news.lk/cabinet-decisions?format=feed&type=rss`
     * Sinhala News RSS: `https://sinhala.news.lk/news?format=feed&type=rss`
     * Tamil News RSS: `https://tamil.news.lk/news?format=feed&type=rss`
   * **Authority Tier:** `A1` | **Base Weight:** `0.75`

2. **Department of Government Printing (`documents.gov.lk`):**
   * **Entity:** `inst:gov_printing_lk` | **Source:** `LK-SOURCE-DOCS-GOV`
   * **Role:** Sovereign legal printer. Every law, regulation, service minute, and tender must appear here to have legal effect.
   * **Ingestion Paths:**
     * Next.js RSC Endpoint: `https://documents.gov.lk/extra-gazettes/<year>/<month>`
     * Binary Proxy: `/api/content-file-proxy?fileId=...`
   * **Authority Tier:** `A1` (Supreme) | **Base Weight:** `0.85`

3. **Central Bank of Sri Lanka (CBSL):**
   * **Entity:** `inst:cbsl_lk` | **Source:** `LK-SOURCE-CBSL`
   * **Role:** Monetary policy, macroeconomic indicators, inflation, exchange rates, banking regulations.
   * **Ingestion Paths:**
     * Web & Press Releases: `https://www.cbsl.gov.lk/en/press/press-releases`
     * Economic Indicators RSS/API: `https://www.cbsl.gov.lk/en/statistics/economic-indicators`
   * **Authority Tier:** `A1` | **Base Weight:** `0.85`

4. **Department of Examinations (`doenets.lk`):**
   * **Entity:** `inst:doenets_lk` | **Source:** `LK-SOURCE-DOENETS`
   * **Role:** National testing authority (A/L, O/L, Grade 5 Scholarship).
   * **Ingestion Paths:**
     * Exam Notices: `https://www.doenets.lk/examination/notices`
     * Results & Statistics API: `https://www.doenets.lk/exam/results`
   * **Authority Tier:** `A1` | **Base Weight:** `0.80`

5. **National Institute of Education (`nie.lk` & `channelnie.nie.ac.lk`):**
   * **Entity:** `inst:nie_lk` | **Source:** `LK-SOURCE-NIE`
   * **Role:** Curriculum development, syllabi, teacher guides, school textbooks.
   * **Ingestion Paths:**
     * Teacher Guides: `https://channelnie.nie.ac.lk/teachers-guides/`
     * Syllabus Collections: `https://nie.lk/curriculum`
   * **Authority Tier:** `A1` | **Base Weight:** `0.75`

---

## 4. Category C: Real-Time Vernacular & Digital Breakers

These services capture breaking reality minutes before newspapers write full articles.

1. **Helakuru Esana (Bhasha Lanka):**
   * **Entity:** `inst:helakuru_esana` | **Source:** `LK-SOURCE-ESANA`
   * **Role:** Sri Lanka's largest digital breaking news notification service (millions of daily active mobile users).
   * **Ingestion Paths:**
     * Web Endpoint: `https://www.helakuru.lk/esana/load`
     * Initial Batch: `https://www.helakuru.lk/esana/load-initial-data` (POST payload)
     * Community API Mirror: `https://esana-api.vercel.app/EsanaV3`
   * **Authority Tier:** `B2` | **Base Weight:** `0.35`
   * **Epistemic Role:** Early warning sensor. Triggers the Triangulation engine to look for official corroboration.

2. **Nuwan Senaratna Open News Stream (`nuuuwan/news_lk3_data`):**
   * **Entity:** `inst:nuuuwan_news` | **Source:** `LK-SOURCE-NUUUWAN-NEWS`
   * **Role:** Automated open-data continuous scraper archiving all major newspapers.
   * **Ingestion Paths:**
     * Summary Feed: `https://raw.githubusercontent.com/nuuuwan/news_lk3_data/main/summary.tsv` (82,154 records)
     * Full Text Store: Partitioned daily TSVs on GitHub.
   * **Authority Tier:** `A2` (Curated Aggregator) | **Base Weight:** `0.40`
   * **Epistemic Role:** The historical newspaper spine of Sri Lanka.

---

## 5. Category D: Major Media Conglomerates & Dailies

Sri Lanka's private media landscape is dominated by five legacy and digital publishing houses:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CATEGORY D: MEDIA HOUSES & PUBLISHERS                           │
├────────────────────────┬─────────────────────────────┬─────────────────────────────────┤
│ Publisher / Entity     │ Outlets & Languages         │ Ingestion Endpoints / RSS       │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Wijeya Newspapers      │ • Daily Mirror (EN)         │ • RSS: dailymirror.lk/rss       │
│ `inst:wijeya_news`     │ • Sunday Times (EN)         │ • RSS: sundaytimes.lk/rss       │
│                        │ • Lankadeepa (SI)           │ • RSS: ft.lk/rss (Daily FT)     │
│                        │ • Tamil Mirror (TA)         │ • Web: tamilmirror.lk           │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Associated Newspapers  │ • Daily News (EN)           │ • Web: dailynews.lk             │
│ of Ceylon (Lake House) │ • Dinamina (SI)             │ • Web: dinamina.lk              │
│ `inst:ancl_lakehouse`  │ • Thinakaran (TA)           │ • Web: thinakaran.lk            │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Capital Maharaja Group │ • NewsFirst English         │ • RSS: newsfirst.lk/feed        │
│ `inst:maharaja_news`   │ • Sirasa News (SI)          │ • RSS: newsfirst.lk/sinhala/feed│
│                        │ • Shakthi News (TA)         │ • RSS: newsfirst.lk/tamil/feed  │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Derana Macro           │ • Ada Derana English        │ • RSS: adaderana.lk/rss.php     │
│ Entertainment          │ • Ada Derana Sinhala        │ • Web: sinhala.adaderana.lk     │
│ `inst:derana_macro`    │ • Ada Derana Tamil          │ • Web: tamil.adaderana.lk       │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Asia Broadcasting Corp │ • Hiru News English         │ • Web: hirunews.lk/english      │
│ (ABC) `inst:abc_hiru`  │ • Hiru News Sinhala         │ • Web: hirunews.lk/sinhala      │
│                        │ • Hiru News Tamil           │ • Web: hirunews.lk/tamil        │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Express Newspapers     │ • Virakesari (Premier Tamil)│ • Web: virakesari.lk            │
│ `inst:virakesari_corp` │ • Thinakkural               │ • RSS: virakesari.lk/feed       │
├────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ Echelon Media          │ • EconomyNext (Macro/Econ)  │ • RSS: economynext.com/feed     │
│ `inst:echelon_media`   │ • Echelon Magazine          │ • Web: echelon.lk               │
└────────────────────────┴─────────────────────────────┴─────────────────────────────────┘
```

---

## 6. Category E: Grassroots & Community Epistemic Channels

Where teachers, students, and citizens actually coordinate:

1. **PastPapersWiki Network:**
   * **Source ID:** `LK-COMM-PASTPAPERSWIKI`
   * **Ingestion:** Telegram public channel `t.me/s/pastpaperswiki`
   * **Epistemic Role:** Real-time upload of question papers, answer keys, and district trial exams within hours of examination completion.
2. **ApplicationsLK / Job Gazette Network:**
   * **Source ID:** `LK-COMM-APPLICATIONSLK`
   * **Ingestion:** Telegram `t.me/s/applicationslk`
   * **Epistemic Role:** Real-time parsing of government teaching exams and state ministry job gazettes.
3. **Teacher Union Channels (Ceylon Teachers' Union - CTU / GLUS):**
   * **Entity:** `inst:ctu_lk`
   * **Role:** Early reporting on strike actions, syllabus disputes, and school transfer controversies.

## 7. Category F: Sovereign Legislative, Judicial & Academic Open Repositories

Beyond print news, the platform has integrated primary civic and judicial datasets curated under the `nuuuwan` open data initiative:

| Repository / Entity | Scope & Historical Depth | Format & Endpoints | Epistemic Weight ($w_i$) |
| :--- | :--- | :--- | :---: |
| **Cabinet Decisions**<br>`inst:cabinet_office_lk` | **11,126 official Cabinet Decisions** (2010–2026) from `cabinetoffice.gov.lk`. Direct Minister proposals & confirmed policy determinations. | `nuuuwan/lk_cabinet_decisions` (JSON, TXT, TSV) | **0.90** |
| **Parliament Hansard**<br>`inst:parliament_lk` | **281 volumes** of verbatim parliamentary debates (2000s, 2010s, 2020s) from `parliament.lk`. Lawmaker statements & select committee reports. | `nuuuwan/lk_hansard` (JSON, PDF, TXT) | **0.88** |
| **Supreme Court Judgements**<br>`inst:supreme_court_lk` | **2,729 binding judgments** (2009–2026) from `supremecourt.lk`. Fundamental Rights petitions on exam leaks, university quotas, and teacher recruitment. | `nuuuwan/lk_supreme_court_judgements` (JSON, PDF, TXT) | **0.90** |
| **Educational Publications**<br>`inst:edupub_lk` | **1,426 official school publications** & textbooks from `edupub.gov.lk` in Sinhala, Tamil, and English. | `nuuuwan/lk_edupub` (JSON, PDF, TXT) | **0.85** |
| **Sri Lanka Journals Online (SLJOL)**<br>`inst:nsf_sljol` | **90+ peer-reviewed academic journals** hosted by National Science Foundation (`sljol.info`). OJS / OAI-PMH compliant. | `sljol.info` (Open Access) | **0.80** |
| **Dept of Census & Statistics**<br>`inst:dcs_lk` | National Census (1971, 2001, 2012, 2024), Annual School Censuses, Labour Force Surveys, and Poverty Head Count Indices. | `statistics.gov.lk` / `nuuuwan/lk_census_*` | **0.85** |
| **Advocata Institute**<br>`inst:advocata_lk` | Bath Curry Index (food inflation tracker), state-owned enterprise reforms, and tax policy analysis. | `advocata.org` (Open Reports) | **0.72** |
| **Groundviews / Vikalpa / Maatram**<br>`inst:cpa_groundviews` | Premier longform citizen investigative journalism archive founded in 2006 by Centre for Policy Alternatives (CPA). | `groundviews.org` (RSS / Web) | **0.65** |

---

## 8. Automated Source Ingestion Pipeline Design

```
                       ┌────────────────────────────────────────┐
                       │     SOVEREIGN SOURCE CRAWLER CRON      │
                       └───────────────────┬────────────────────┘
                                           │
         ┌───────────────────┬─────────────┴───────┬───────────────────┐
         ▼                   ▼                     ▼                   ▼
    [Hourly RSS]       [Daily TSV]          [Weekly Gazette]    [Continuous Push]
    • news.lk          • nuuuwan 82k news   • documents.gov.lk  • Helakuru Esana
    • Ada Derana       • Cabinet decisions  • Friday 6:00 PM    • Telegram Bot
    • NewsFirst        • Supreme Court      • RSC / Proxy       • PastPapersWiki
         │                   │                     │                   │
         └───────────────────┼─────────────────────┴───────────────────┘
                             ▼
              ┌─────────────────────────────┐
              │  RAW INGESTION STAGING DB   │
              │   (`data/.../atlas.db`)     │
              │    (13,767 RESOURCES)       │
              └──────────────┬──────────────┘
                             ▼
              ┌─────────────────────────────┐
              │  EXPANDED TCDI LINKER &     │
              │  TRIANGULATOR (link-entities│
              └──────────────┬──────────────┘
                             ▼
              ┌─────────────────────────────┐
              │  POLY-TEMPORAL KNOWLEDGE    │
              │  GRAPH: 8,334 LIVE EDGES    │
              │  ACROSS 55 ENTITIES         │
              └─────────────────────────────┘
```

### Current Empirical Substrate (Verified in `atlas_staging.db`)
- **Total Cataloged Evidentiary Resources:** `13,767`
- **Total Registered Sources in Catalog:** `157`
- **Total Entities in Knowledge Graph:** `55`
- **Total Committed Temporal Connections:** `8,334`
- **Verified Multi-Channel Triangulation Clusters:** Multiple 1.0 confidence coincidences spanning Gazettes + Cabinet Decisions + Trilingual Newspaper Reports.

By formalizing these 55 institutional, judicial, and media entities into our data platform, Urumaya moves from being a simple exam paper directory to becoming the **definitive civic intelligence atlas of Sri Lanka**.

# 2026 Modern SEO, GEO, AEO & Agentic Discovery Architecture

> **Author**: Polymath Platform Solution Architecture & Senior Engineering  
> **Status**: APPROVED ARCHITECTURAL SPECIFICATION & OPERATIONAL ROADMAP  
> **Invariants Enforced**: Sovereign Sanctuary Privacy, Zero AI Data Leakage, Temporal Grounded Authority, Princeton GEO Playbook, IndexNow Push Verification.  
> **Date**: October 2026

---

## 1. Executive Summary: The Three-Tier Discovery Shift

Between 2024 and 2026, the mechanics of web discovery underwent the most profound structural phase change since the invention of Google's PageRank. Web discovery is no longer a monotonic game of optimizing for 10 blue links; it is a **Three-Tier Discovery Ecosystem**:

```
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                               TIER 1: SEO                                │
 │                         (Search Engine Optimization)                     │
 │  • Engines: Google, Bing, DuckDuckGo, Yandex                             │
 │  • Modality: Crawlers follow HTML links, index DOM, parse sitemaps       │
 │  • Currency: PageRank, backlinks, semantic HTML, Core Web Vitals (INP)   │
 └────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                               TIER 2: AEO                                │
 │                        (Answer Engine Optimization)                      │
 │  • Engines: Google AI Overviews, Siri / Apple Intelligence, Voice Search │
 │  • Modality: Extracts structured 40–60 word answer cards & featured cards│
 │  • Currency: Direct Q&A headings, Schema.org JSON-LD, FAQ entities       │
 └────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                               TIER 3: GEO                                │
 │                      (Generative Engine Optimization)                    │
 │  • Engines: Perplexity, ChatGPT Search, Claude, Google Gemini, Copilot   │
 │  • Modality: Retrieval-Augmented Generation (RAG) across web indices     │
 │  • Currency: Statistical grounding, authoritative citations, quotes,     │
 │              token-efficient context ingestion (llms.txt / llms-full.txt)│
 └──────────────────────────────────────────────────────────────────────────┘
```

For **Gurudevi** (the educational ecology platform for Sri Lanka) and the **EdLove Foundation**, achieving maximum visibility across Google, Bing, ChatGPT Search, and Perplexity while strictly safeguarding student/teacher privacy in the inner sanctuary requires a disciplined, multi-layered architectural approach.

---

## 2. The 2026 Agentic & Search Engine Crawler Matrix

A major failure mode in modern web administration is confusing **Search & Citation Crawlers** with **AI Model Training Crawlers**. Blocking all AI crawlers completely erases a brand from conversational search (ChatGPT Search, Perplexity, Copilot), whereas permitting all crawlers without path constraints risks exposing proprietary or private user workflows to bulk model-training datasets.

### The Verified 2026 User-Agent Registry

| Entity | User-Agent | Primary Function | Policy for Gurudevi Public (`gurudevi.lk` / `gurudevi.app`) | Policy for Sanctuary (`sanctuary.gurudevi.app`) |
| :--- | :--- | :--- | :--- | :--- |
| **OpenAI** | `OAI-SearchBot` | **ChatGPT Search**: Real-time indexing for citations & answers | **ALLOW** (Disallow private paths) | **DISALLOW ALL** |
| **OpenAI** | `GPTBot` | **Model Training**: Ingests web data for future model training | **ALLOW (Editorial only)** | **DISALLOW ALL** |
| **Perplexity** | `PerplexityBot` | **Conversational Search**: Real-time RAG retrieval & citations | **ALLOW** (Disallow private paths) | **DISALLOW ALL** |
| **Anthropic** | `Claude-SearchBot` | **Claude Search**: Real-time search discovery for Claude | **ALLOW** (Disallow private paths) | **DISALLOW ALL** |
| **Anthropic** | `ClaudeBot` / `anthropic-ai` | **Model Training**: Crawls for Claude model training | **ALLOW (Editorial only)** | **DISALLOW ALL** |
| **Google** | `Googlebot` | **Core Search & AI Overviews**: Primary web indexing | **ALLOW** (Disallow private paths) | **DISALLOW ALL** |
| **Google** | `Google-Extended` | **Gemini AI Training**: Controls ingestion into Gemini models | **DISALLOW** (Training opt-out) | **DISALLOW ALL** |
| **Microsoft** | `bingbot` | **Bing & Copilot**: Powers Bing search and Copilot grounding | **ALLOW** (Disallow private paths) | **DISALLOW ALL** |
| **Apple** | `Applebot` | **Apple Intelligence**: Siri, Spotlight, and Safari search | **ALLOW** (Disallow private paths) | **DISALLOW ALL** |
| **Apple** | `Applebot-Extended` | **Apple AI Training**: Training crawler for Apple models | **DISALLOW** (Training opt-out) | **DISALLOW ALL** |

---

## 3. The Sovereign Domain Topology: Public vs Sanctuary Privacy

Gurudevi operates across multiple domains and subdomains. A strict architectural firewall separates public educational authority from private teacher/student wellbeing and classroom records.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 INCOMING TRAFFIC                       │
                  └───────────┬────────────────────────────────┬───────────┘
                              │                                │
                              ▼                                ▼
       ┌──────────────────────────────┐        ┌──────────────────────────────┐
       │   PUBLIC KNOWLEDGE SURFACE   │        │   SOVEREIGN SANCTUARY ZONE   │
       │  • gurudevi.lk (301 redirect)│        │  • sanctuary.gurudevi.app    │
       │  • gurudevi.app (Apex / www) │        │  • /self (FireJournal)       │
       │  • [school].gurudevi.app     │        │  • /workspace (Attendance)   │
       └──────────────┬───────────────┘        │  • /library & /community     │
                      │                        └──────────────┬───────────────┘
                      ▼                                       ▼
       ┌──────────────────────────────┐        ┌──────────────────────────────┐
       │  INDEXATION & GEO POLICY     │        │    ZERO-LEAK PRIVACY SHIELD  │
       │  • sitemap.xml & sitemap     │        │  • meta robots: noindex      │
       │  • llms.txt & llms-full.txt  │        │  • robots.txt: Disallow: /   │
       │  • Schema.org JSON-LD        │        │  • X-Robots-Tag: noindex     │
       │  • IndexNow instant push     │        │  • Zero LLM training harvest │
       │  • OpenGraph / Twitter cards │        │  • Ephemeral guest MMKV sync │
       └──────────────────────────────┘        └──────────────────────────────┘
```

### The Three Privacy Sentinels for Sanctuary
1. **HTML Meta Tag Sentinel**: In `apps/gurudevi-web/app/(sanctuary)/layout.tsx`, render:
   ```tsx
   export const metadata: Metadata = {
     robots: {
       index: false,
       follow: false,
       nocache: true,
       googleBot: { index: false, follow: false, noimageindex: true },
     },
   };
   ```
2. **`robots.ts` Disallow Rules**: Explicitly disallow `/self/`, `/workspace/`, `/library/`, `/community/`, `/claim/`, `/profile/`, `/settings/`, `/api/`, `/auth/`, `/recovery/` for all user agents.
3. **Host-Routing Segregation**: In `apps/gurudevi-web/lib/host-routing.ts`, ensure non-public administrative sessions never leak into static public caches.

### The Role of `explore.gurudevi.app` in the Discovery Topology

A critical architectural distinction exists between the **Marketing Surface** (`gurudevi.app` / `gurudevi.lk`) and the **Exploration Surface** (`explore.gurudevi.app`):

1. **The Marketing Surface is the Primary SEO & GEO Anchor**:
   - `https://gurudevi.app/` hosts the rich editorial hero, philosophy, multi-year roadmap, FAQ, cultural gratitude (`/thuthimal`), and bilingual alternates (`/si`, `/ta`).
   - This surface contains the `EducationalOrganization` and `WebSite` Schema.org graphs, OpenGraph cards, and is fully indexed by Google, Bing, Perplexity, and ChatGPT Search.

2. **The Exploration Surface is an Interactive Application Sandbox**:
   - `https://explore.gurudevi.app/` rewrites directly to `/welcome` and provides the interactive **Safe-Try** guest experience (`/self`, `/workspace`, `/library`) without authentication.
   - **Why `explore` carries `noindex, nofollow`**:
     - **Prevents Keyword Cannibalization**: Having search engines index both `gurudevi.app` and `explore.gurudevi.app` with overlapping intro text splits PageRank and confuses search crawlers.
     - **Avoids Fragmented User Journeys**: A user discovering Gurudevi via Google search should land on the rich narrative marketing experience (with mission, team, and context) rather than an isolated application modal.
     - **Industry Consensus**: Flagship digital platforms (Notion, Figma, Slack, Linear) keep their interactive application subdomains (`app.*`, `explore.*`) unindexed, channeling 100% of organic search authority into the primary root domain.
   - **The Link Ingress Bridge**: The marketing page contains clear, high-intent action links (`"Explore the 4 Workspaces"`) leading visitors directly into `explore.gurudevi.app`, ensuring seamless human transition without muddying search crawler indices.

---

### The School Subdomains Architecture (`[school].gurudevi.app`)

Gurudevi provides sovereign subdomains for educational institutions across Sri Lanka (e.g. `ananda.gurudevi.app`, `visakha.gurudevi.app`, `dharmaraja.gurudevi.app`).

```
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                  INCOMING: https://ananda.gurudevi.app/                   │
 └────────────────────────────────────┬─────────────────────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
 ┌──────────────────────────────┐              ┌──────────────────────────────┐
 │   PUBLIC INSTITUTIONAL WEB   │              │   PRIVATE CLASSROOM SANCTUARY │
 │  • / (School Profile)        │              │  • /workspace (Attendance)   │
 │  • /articles (Announcements) │              │  • /self, /badges, /gradebook│
 └──────────────┬───────────────┘              └──────────────┬───────────────┘
                │                                             │
                ▼                                             ▼
 ┌──────────────────────────────┐              ┌──────────────────────────────┐
 │  FULL PUBLIC SEO & GEO       │              │  INSTANT 307 REDIRECT        │
 │  • Schema.org: School        │              │  • Target: sanctuary.gurudevi│
 │  • Canonical: [school].app   │              │  • Header: noindex, nofollow │
 │  • Local discovery in Google │              │  • ZERO student data leak    │
 └──────────────────────────────┘              └──────────────────────────────┘
```

1. **Public Identity & Knowledge Graph (`@type: School`)**:
   - Each school profile is a sovereign civic knowledge entity, marked with Schema.org `School` / `EducationalOrganization`.
   - Fields exposed: School name (in English, Sinhala, and Tamil), verified badge, address (`PostalAddress` with district/province), founding date, leadership, student-teacher ratio, and verified curricular streams.
   - School news and articles (`/articles/[slug]`) receive `NewsArticle` schemas, allowing individual school achievements to surface in Google Search and Google Discover.

2. **The Sanctuary Redirect Sentinel (Zero Data Leakage)**:
   - When a visitor or bot on `[school].gurudevi.app` requests a private path (`/workspace`, `/self`, `/attendance`, `/library/admin`), `host-routing.ts` executes an **immediate 307 redirect** to `https://sanctuary.gurudevi.app/workspace`.
   - Because `sanctuary.gurudevi.app` carries `noindex, nofollow`, **private student attendance, grades, and teacher wellbeing notes can never be indexed, cached, or harvested by search engines or AI training bots**.

3. **Subdomain Canonicalization**:
   - The canonical URL for each school's public page is self-referential: `https://[school].gurudevi.app/`.
   - School subdomains do NOT cannibalize `gurudevi.app` because their search intent is hyper-localized (e.g. searching for a specific school rather than the nationwide platform).

---

### The EdLove.org Epistemic Commons Discovery Alignment (`apps/edlove-web`)

The **EdLove Foundation** (`https://edlove.org`) is the research and philosophical parent of the Gurudevi ecosystem. It houses the **200 Global Educational Innovations Archive**, the **6 Cosmos Paradigms**, the **Pedagogy Canon**, and the **Ceylon Research Atlas**.

To achieve maximum synergy with `gurudevi.app`:
1. **Robots & Content Signals**:
   - `edlove.org` serves `Content-Signal: search=yes, ai-input=yes, ai-train=no`.
   - Allows citation crawlers (`OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`, `Googlebot`, `bingbot`).
   - Opts out from uncredited foundation model training scrapers (`Google-Extended`, `CCBot`).
2. **`llms.txt` and `llms-full.txt` Parity**:
   - `/llms.txt`: Structured Markdown table of contents linking directly to the 200 Innovations, Cosmos Paradigms, and the Ceylon Research Atlas.
   - `/llms-full.txt`: Consolidated Markdown corpus defining the Convivial Limit, the 6 Cosmos Paradigms, and the empirical school census for single-shot ingestion by AI agents.
3. **Structured Schema**:
   - Uses `Organization` and `WebSite` JSON-LD schemas identifying EdLove as the parent organization of Gurudevi (`sameAs` links connecting the two ecosystems).
4. **IndexNow Verification**:
   - Static key file hosted at `https://edlove.org/9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d.txt` for real-time indexing of newly published research articles on Bing and Yandex.

---

## 4. Generative Engine Optimization (GEO): The Princeton Study Playbook

Traditional SEO techniques (keyword stuffing, backlink farming) are actively penalized by modern LLM answer engines. In the landmark 2024/2025 Princeton University GEO research (*Aggarwal et al.*), empirical benchmarking proved that **specific content modifications increase citation visibility in Generative Engines by up to 40%**.

### The 5 Core Principles of Generative Grounding

```
      +-----------------------------------------------------------------+
      |                 THE PRINCETON GEO PYRAMID                       |
      |                                                                 |
      |   [1] CITE VERIFIABLE SOURCES (+30-40% AI Citation Rate)        |
      |       Map claims to named institutions, census data, & papers   |
      |                                                                 |
      |   [2] HARD EMPIRICAL STATISTICS (+35% Ingestion Preference)     |
      |       Replace "many schools" with "10,155 schools across 9 prov"|
      |                                                                 |
      |   [3] DIRECT QUOTES & BYLINES (+28% Semantic Authority)         |
      |       Expert voices with Schema.org Person verification         |
      |                                                                 |
      |   [4] INVERTED PYRAMID / 50-WORD ANSWER-FIRST HEADINGS          |
      |       Immediate definition below H2 before elaborating          |
      |                                                                 |
      |   [5] TOKEN-EFFICIENT PLAIN TEXT / CLEAN SEMANTIC DOM           |
      |       Zero hydration bloat, accessible markdown companion       |
      +-----------------------------------------------------------------+
```

### Practical Application for Gurudevi Editorial (`/journal/[slug]`)
1. **Headline & Subtitle**: State the exact premise clearly in active voice.
2. **First Paragraph (AEO Target)**: Directly answer the titular query in 45–60 words. This provides LLM chunkers with a clean vector embedding.
3. **Structured Tables**: For multi-entity or chronological data, render semantic HTML `<table>` or bulleted lists rather than dense prose paragraphs.
4. **Author Credibility & Attribution**: Each article includes full JSON-LD author linking (`/authors/[id]`), explicit license (`CC BY-NC 4.0`), and canonical sources.

---

## 5. The `llms.txt` and `llms-full.txt` Specification

Introduced by Jeremy Howard (Answer.AI) and adopted by major developer and educational platforms worldwide, `/llms.txt` is the open standard for **Agentic Discovery**.

### Why `llms.txt` Is Vital
- **The Problem**: Web pages contain 80–95% noise (navigation headers, cookie banners, script bundles, styling, tracking tags). An LLM crawler spending 30,000 tokens scraping an HTML page wastes compute and often truncates the actual core content.
- **The Solution**: An `llms.txt` file acts as an **AI-native Table of Contents**, pointing directly to clean, markdown-formatted endpoints.
- **`llms-full.txt`**: A companion file containing the complete, aggregated knowledge base of the platform in plain markdown. When an agent (like Cursor, Claude Code, or an AI research assistant) needs to understand Gurudevi, it can ingest `/llms-full.txt` in a single HTTP request without spidering 50 different pages.

### Canonical Structure of `/llms.txt`
```markdown
# Gurudevi
> Gurudevi is an education ecology support system and sanctuary for education in Sri Lanka, supporting teachers, students, schools, families, and communities.

Gurudevi supports the relationships that make education possible, with teachers as the first-class design beneficiary.

## Core Architectural Pillars
- [Self](https://gurudevi.app/about#self): Wellbeing, reflection, energy, and inner attunement.
- [Workspace](https://gurudevi.app/about#workspace): Classroom, school presence, and learning-studio practices.
- [Library](https://gurudevi.app/about#library): Shared educational knowledge, curricular assets, and teaching materials.
- [Community](https://gurudevi.app/about#community): Human relationships, school networks, and collaborative support.

## Canonical Resources
- [Home](https://gurudevi.app/): Foundation landing page and multi-year horizon.
- [About](https://gurudevi.app/about): Comprehensive philosophical and technical overview.
- [Journal](https://gurudevi.app/journal): Public thought leadership and educational essays.
- [FAQ](https://gurudevi.app/faq): Frequently asked questions on privacy, licensing, and access.

## Full Context Companion
- [Complete Knowledge Corpus](https://gurudevi.app/llms-full.txt): Aggregated plain-text corpus of all public essays, curriculum frameworks, and system documentation for direct LLM context loading.

## Machine-Readable Feeds
- [Sitemap](https://gurudevi.app/sitemap.xml): XML sitemap for search crawlers.
- [Knowledge Index](https://gurudevi.app/knowledge.json): JSON catalog of all public pages, entries, and authors.
- [Journal Feed](https://gurudevi.app/journal/feed.xml): RSS 2.0 feed for aggregators.
```

---

## 6. Schema.org JSON-LD Graph Architecture

Modern search engines (Google, Bing) and AI systems (ChatGPT, Perplexity) parse structured JSON-LD graphs to construct their Knowledge Graphs.

### 1. `EducationalOrganization` Schema (Root & About Pages)
Identifies Gurudevi and EdLove as legitimate educational institutions, establishing E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness):
```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": "https://gurudevi.app/#organization",
  "name": "Gurudevi",
  "alternateName": ["ගුරුදෙවි", "குருதெவி", "EdLove Gurudevi"],
  "url": "https://gurudevi.app",
  "logo": "https://gurudevi.app/icon.png",
  "description": "Gurudevi is an education ecology support system and sanctuary for education in Sri Lanka.",
  "parentOrganization": {
    "@type": "Organization",
    "name": "EdLove Foundation",
    "url": "https://edlove.org"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Sri Lanka"
  },
  "knowsLanguage": ["en", "si", "ta"]
}
```

### 2. `Article` / `BlogPosting` Schema (`/journal/[slug]`)
Guarantees rich snippet previews in Google Search, inclusion in Google Discover, and explicit attribution in AI answers:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://gurudevi.app/journal/why-gurudevi-begins-with-care#article",
  "headline": "Why Gurudevi Begins with Care",
  "description": "The people around learning deserve support that gives energy back rather than asking them to carry more.",
  "datePublished": "2026-08-31T00:00:00Z",
  "dateModified": "2026-08-31T00:00:00Z",
  "inLanguage": "en",
  "mainEntityOfPage": "https://gurudevi.app/journal/why-gurudevi-begins-with-care",
  "author": {
    "@type": "Person",
    "name": "Gurudevi",
    "url": "https://gurudevi.app/authors/gurudevi"
  },
  "publisher": {
    "@id": "https://gurudevi.app/#organization"
  },
  "license": "https://creativecommons.org/licenses/by-nc/4.0/",
  "keywords": "care, education-ecology, teacher-support"
}
```

### 3. `BreadcrumbList` Schema
Provides machine-readable site hierarchy, enabling navigational breadcrumb displays in search engine results.

---

## 7. Instant Search Indexing: The IndexNow Protocol

Traditional web crawlers may take between 3 days and 3 weeks to discover updated or newly published articles on smaller or regional domains. **IndexNow** (supported by Microsoft Bing, Yandex, Seznam, and Naver) eliminates this delay by providing a push API that notifies search engines within seconds of URL creation or modification.

### The IndexNow Mechanism
1. **Key Generation**: A unique 32-character hexadecimal key (e.g. `gurudevi_indexnow_2026_lk_key`).
2. **Key Verification Endpoint**: Hosted at root: `https://gurudevi.app/<key>.txt` containing only the key string.
3. **Publish Notification Pipeline**: Whenever a journal article or institutional page is updated, trigger a single POST request to `https://www.bing.com/indexnow` or `https://api.indexnow.org/indexnow`:
   ```json
   {
     "host": "gurudevi.app",
     "key": "<your-key>",
     "keyLocation": "https://gurudevi.app/<your-key>.txt",
     "urlList": [
       "https://gurudevi.app/journal/why-gurudevi-begins-with-care",
       "https://gurudevi.app/sitemap.xml"
     ]
   }
   ```
   Bing automatically propagates the notification to Yandex and other participating engines, triggering near-instantaneous indexing.

---

## 8. Implementation Blueprint for `apps/gurudevi-web`

| File | Scope of Upgrade | Invariant Enforced |
| :--- | :--- | :--- |
| **`app/robots.ts`** | Add `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`; explicit disallow for sanctuary paths (`/self/`, `/workspace/`, `/library/`, `/community/`, `/claim/`, `/profile/`); reference `llms.txt`. | Safe bot routing & sanctuary protection |
| **`app/(sanctuary)/layout.tsx`** | Add `<meta name="robots" content="noindex, nofollow, nocache" />` metadata. | Zero search crawl of private student data |
| **`app/llms.txt/route.ts`** | Standardize to Jeremy Howard / Answer.AI markdown format with direct links and descriptions. | Agentic token-efficient discovery |
| **`app/llms-full.txt/route.ts`** | Implement full aggregated knowledge corpus endpoint. | 1-shot complete LLM context ingestion |
| **`lib/schema-org.ts`** | Type-safe JSON-LD builders for `EducationalOrganization`, `Article`, `WebSite`, `BreadcrumbList` with XSS sanitization (`\u003c`). | Google/Bing Rich Results & Knowledge Graph |
| **`app/(marketing)/(editorial)/journal/[slug]/page.tsx`** | Inject `Article` JSON-LD schema & enhance metadata with OpenGraph article timestamps, tags, and canonical URLs. | AEO / GEO citation enhancement |
| **`app/[key].txt/route.ts`** | Host IndexNow verification key for Bing & Yandex. | Instant push indexing |
| **`tests/unit/seo/*.test.ts`** | Vitest verification of `robots.ts`, `llms.txt`, and Schema.org builders. | Graduated Evidence G1 |

---

## 9. Verification & Quality Gates

Before declaring discovery readiness, all changes must pass:
1. **G0 Static Analysis**: `pnpm --filter gurudevi-web check-types` exits with code 0.
2. **G1 Unit & Boundary Tests**: `pnpm --filter gurudevi-web exec vitest run` exits with code 0 (all SEO and host-routing tests passing).
3. **Rich Results Validation**: Validated against Schema.org specification for `EducationalOrganization` and `Article`.
4. **Privacy Audit**: Sanctuary routes return `noindex` and are blocked in `robots.txt`.

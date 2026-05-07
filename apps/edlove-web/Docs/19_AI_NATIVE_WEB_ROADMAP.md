# AI-NATIVE WEB ROADMAP
## A Layered Strategy for EdLove and the Sister Web Properties

**Purpose**: Define what "AI-native" should mean for the websites in this monorepo, which parts are practical now, which parts are experimental, and how to migrate without losing robustness.

---

## THE SHORT ANSWER

Yes, an AI-native migration is possible.

But it should **not** mean:

- stuffing the site with speculative standards
- replacing semantic web fundamentals with hype
- assuming agents should bypass all controls
- exposing unsafe actions anonymously

For this ecosystem, "AI-native" should mean:

1. the site is readable without client-side JavaScript
2. the meaning of the content is explicit, not merely visual
3. important entities and relationships are machine-readable
4. trusted agents can discover safe, structured ways to query or act
5. actions remain permissioned, auditable, and human-aligned

That requires a **layered architecture**, not a single trick.

---

## THE CORE PRINCIPLE

Build for humans first, but so machines can understand it too.

The strongest AI-native websites are usually not the most JavaScript-heavy ones. They are the ones that provide:

- semantic HTML
- strong SSR or static HTML output
- stable URLs
- structured metadata
- explicit entity relationships
- clean machine-readable endpoints

This means the path forward is not "AI instead of web standards."

It is:

**better web standards, plus selective AI-facing layers on top.**

---

## DOMAIN GOVERNANCE NOTE

For now, the sister sites should be treated as EdLove subdomains, not independent domains.

Current canonical hosting baseline:

- `https://edlove.org`
- `https://intuituilabs.edlove.org`
- `https://neevsk.edlove.org`
- `https://gurudevi.edlove.org`

Important implementation rule:

- metadata helpers, Astro `site` config, sitemap references, `robots.txt`, `llms.txt`, and public knowledge endpoints must reflect the real deployed host
- do not silently swap to future standalone domains just because they are planned
- if a site moves to its own domain later, treat that as an explicit migration task and update all AI-native surfaces together

---

## THE LAYERS

## LAYER 0 | CRAWL AND ACCESS CONTROL

Implement:

- `robots.txt`
- `sitemap.xml`
- canonical URLs
- `noindex` where needed
- environment-specific crawl policy

Goal:

- let legitimate agents discover public content
- keep private or unsafe areas out

---

## LAYER 1 | HTML-FIRST DELIVERY

This is the most important layer for AI-native robustness.

Why:

- machine systems work best when content is present in initial HTML
- heavy CSR creates fragile rendering and indexing paths
- HTML-first output is resilient across crawlers, agents, and future systems

For this monorepo, that means:

- default to Astro static rendering or SSR
- use islands only where interaction is actually needed
- avoid client-only rendering for core informational content
- never require JavaScript for basic meaning extraction

---

## LAYER 2 | SEMANTIC HTML AND INFORMATION ARCHITECTURE

Improve:

- heading hierarchy
- meaningful `article`, `main`, `nav`, `section`, `aside`, `footer`
- explicit author, date, and publisher information
- breadcrumbs where useful
- stable internal taxonomy

The point is not accessibility alone. The point is machine legibility.

---

## LAYER 3 | JSON-LD AND STRUCTURED ENTITIES

This is the strongest near-term AI-native investment.

JSON-LD is mature, standardized, and broadly useful.

Likely schema families across the properties:

- `Organization`
- `WebSite`
- `WebPage`
- `AboutPage`
- `Article`
- `BlogPosting`
- `Person`
- `BreadcrumbList`
- `FAQPage`
- `Dataset`
- `CreativeWork`
- `ItemList`

Rule:

JSON-LD should be generated from content and page data, not hand-copied ad hoc into pages.

---

## LAYER 4 | CONTENT FEEDS FOR MACHINES

Move from machine-readable pages to machine-readable site surfaces.

Examples:

- structured content indexes
- search endpoints
- filtered JSON feeds
- public knowledge manifests
- normalized author/topic/resource endpoints

Recommended implementation direction:

- keep public HTML pages as the primary product
- add optional JSON endpoints that mirror the site's core information graph

---

## LAYER 5 | AI ORIENTATION FILES

### `llms.txt`

Current recommendation:

- treat it as optional and experimental
- do not depend on it
- do not confuse it with a formal web standard

Why still consider it:

- easy to publish
- useful as a concise machine-oriented summary
- may help some AI-facing tooling and future systems

Why not over-invest:

- support by major AI systems is not clearly guaranteed
- JSON-LD, HTML, sitemap, and crawl hygiene matter more

Recommended use:

- publish a short, maintained `llms.txt`
- keep it curated
- point to canonical sections and structured feeds

---

## LAYER 6 | MCP-FRIENDLY READ SURFACES

This is where the sites become usable by agents as tools, not just pages.

The progression should be:

1. create structured public read endpoints
2. define stable schemas for those endpoints
3. optionally expose those endpoints through an MCP server later

Examples:

- list all EdLove domains
- find FAQ entries about account deletion
- fetch the current roadmap
- search articles by tag

Recommended principle:

**Make the knowledge graph queryable before making the site action-capable.**

---

## LAYER 7 | WEBMCP AND IN-BROWSER AGENT TOOLS

This is promising, but still emerging.

Strategic recommendation:

- do not make this the primary foundation of the migration right now
- treat it as an augmentation layer after the rest of the site is already strong

Good future candidates:

- public read tools
- safe internal search tools
- guided support workflows

Bad early candidates:

- privileged admin actions
- destructive mutations
- workflows without clear auditability

---

## LAYER 8 | ACTION SURFACES FOR TRUSTED AGENTS

This is the highest-risk layer.

Examples:

- submit support requests
- start application flows
- claim invitations
- upload or enrich resources
- perform authenticated account actions

Rule:

Agents should not be allowed in everywhere by default.

Instead:

- public read access can be broad
- authenticated actions must be permissioned
- sensitive actions should require explicit user interaction or confirmation
- destructive actions should be auditable

**AI-native does not mean permissionless. It means structured, secure, and legible.**

---

## RECOMMENDED MIGRATION PHASES

### Phase 1 | Foundation

- healthy Astro builds
- semantic HTML
- SSR/static-first delivery
- sitemap and robots hygiene
- metadata cleanup

### Phase 1A | Implemented in `edlove-web` on April 17, 2026

- shared site metadata helper
- layout-level canonical, robots, Open Graph, Twitter, and baseline JSON-LD
- `@astrojs/sitemap` integration
- `robots.txt`
- `llms.txt`
- `knowledge.json`
- loader-based Astro 6 content collections so machine-readable feeds are populated from Markdown content

This is now the reference implementation for sister sites.

### Phase 2 | Structured Data

- JSON-LD coverage across important page types
- common metadata helpers
- typed structured data generation

### Phase 3 | Machine-Readable Knowledge Surfaces

- stable JSON indexes for important public knowledge
- normalized content feeds
- stronger content graph discoverability

### Phase 4 | AI Orientation Layer

- optional `llms.txt`
- optional machine-readable AI orientation page
- explicit pointers to canonical knowledge surfaces

### Phase 5 | MCP and Agent Tooling

- expose read-only structured tools first
- only later consider authenticated actions

---

## WHAT TO BUILD FIRST

1. create a shared metadata strategy for all websites
2. add JSON-LD for core page types
3. publish sitemap and robots rules intentionally
4. add a public machine-readable content index
5. optionally add `llms.txt`

Do **not** start with WebMCP.

WebMCP should come only after:

- page meaning is explicit
- content graph is queryable
- build health is stable

---

## DECISION TABLE

| Layer | Should we do it? | Priority | Confidence |
|------|-------------------|----------|------------|
| Semantic HTML | Yes | Immediate | High |
| SSR/static-first | Yes | Immediate | High |
| JSON-LD | Yes | Immediate | High |
| Sitemap/robots/canonical | Yes | Immediate | High |
| Public JSON knowledge feeds | Yes | Near-term | High |
| `llms.txt` | Yes, lightly | Near-term | Medium |
| MCP read surfaces | Yes | Medium-term | Medium |
| WebMCP | Maybe, later | Experimental | Low to Medium |
| Agent action surfaces | Yes, carefully | Later | Medium |

---

## FINAL STRATEGIC POSITION

The path to AI-native websites in this ecosystem is real and worth doing.

But the right sequence is:

1. make the websites machine-readable
2. make the knowledge graph queryable
3. make safe tools explicit
4. only then add more advanced agent interfaces

That is how we stay:

- robust
- future-friendly
- secure
- understandable across future sessions

---

## GROUNDING SOURCES

Primary or near-primary grounding used for this roadmap:

- [Schema.org for Developers](https://schema.org/docs/developers.html)
- [Schema.org Validator docs](https://validator.schema.org/docs/validator.html)
- [Google Search Central: Structured data gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
- [Google Search Central: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central: robots.txt reference](https://developers.google.com/search/reference/robots_txt)
- [Google Search Central: Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [W3C JSON-LD 1.1 announcement](https://www.w3.org/news/2020/json-ld-1-1-specifications-are-w3c-recommendations/)
- [Model Context Protocol](https://modelcontextprotocol.io/docs/python/servers)
- [MCP Architecture](https://modelcontextprotocol.io/specification/2024-11-05/architecture/index)
- [llms.txt specification](https://www.ai-visibility.org.uk/specifications/llms-txt/)

---

**Status**: Active  
**Last Updated**: April 17, 2026

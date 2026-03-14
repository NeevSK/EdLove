# Library Seed SOP — Gurudevi Epistemic Universe
*Standard Operating Procedure for AI-assisted library content seeding*

---

## 🗓️ Session Chronicle

### Session 1 — Library Architecture & First Seeds
**Branch:** `copilot/create-holistic-digital-library-again`

**What was built:**
- Schema migration `20260313000000_library_knowledge_universe.sql` — the full graph schema (`public.nodes`, `public.edges`, `public.collections`, `public.map_layers`, `public.staging`)
- Seed migration `20260313000001_library_seed_content.sql` — 35 nodes across story, pedagogy, guide, video, movie_trailer, tech_guide, reading, map, infographic, circular; plus 3 map layers and 5 collections
- Seed migration `20260313000002_library_expanded_cinema_books.sql` — 62 more nodes (32 education films, 22 books, 8 Sri Lankan resources) with 6 collections and 35+ edges

**Critical bug introduced:**
Seeds 001 and 002 used hallucinated YouTube `watch?v=` IDs — 28 fabricated 11-character strings that look valid but point to non-existent or wrong videos. Example pattern to watch for:
```sql
-- BAD — hallucinated ID, unpredictable target
'https://www.youtube.com/watch?v=pQXIenVnJmY'

-- GOOD — YouTube channel handle (real, stable)
'https://www.youtube.com/@TED-Ed'

-- GOOD — Wikipedia article about the film (real, always stable)
'https://en.wikipedia.org/wiki/Dead_Poets_Society'
```

**Lesson:** Never ask an AI to produce `watch?v=` IDs. They cannot be verified and are hallucinated with high confidence-sounding names.

---

### Session 2 — Diagnosed & Planned Replacement
**Session terminated mid-flight before code was committed.**

**Diagnosis completed:**
- All 28 `watch?v=` IDs across seed 002 verified as hallucinated
- `archive.org` links pointed to copyrighted content (The Alchemist, To Kill a Mockingbird) that require login/borrow — not freely accessible
- 8 of 17 node types had zero items (lesson, worksheet, link, other, pdf, doc, note, and others)

**Strategy designed:**
- One new migration `20260313000003` that DELETEs all `creator_name = 'Architect'` nodes (edges cascade), then reseeds everything from scratch
- URL strategy: use **platform/topic pages** not individual video IDs
- Split SQL generation across parallel sub-agents, each writing to `/tmp/lib_batch_*.sql`, then merged
- Each agent given **exact URL list** — agents fill metadata but cannot generate URLs

---

### Session 3 — Migration 003 Written, Fixed & Committed
**Commits:**
1. `feat(library): add holistic seed migration with 170 verified nodes across 17 types`
2. `fix(library): correct duplicate tags, copyright notices, and spelling in seed migration`

**What was committed:**
| File | Description |
|------|-------------|
| `supabase/migrations/20260313000003_library_holistic_seed.sql` | 170 nodes × 17 types, 5 collections, 10 edges |
| `packages/library/CONTENT_LICENSE.md` | Per-source copyright guidance for all seeds |

**Bugs fixed in commit 2:**
- `ARRAY['khan-academy','khan-academy',...]` → deduplicated to `ARRAY['khan-academy',...]` (6 rows)
- `'Wikipedia CC BY-SA 4.0 / OpenStreetMap CC BY-SA 2.0'` → split into correct per-source notices (4 map nodes)
- `licence` (British spelling) → `license` throughout `CONTENT_LICENSE.md`

**Sinhala unicode bug fixed in this session (Session 4):**
- `title_si` for e-Thaksalawa (line 848) contained corrupted codepoints `U+0DCA U+0DCE` (invalid sequence) instead of `ඊ` (`U+0D8A`, Sinhala Letter Ii)
- Fixed: `'්෎-තක්සලාව'` → `'ඊ-තක්සලාව'`

---

## 🗄️ Schema Reference

**Database:** Supabase (PostgreSQL)  
**Schema file:** `apps/gurudevi-mobile/supabase/migrations/20260313000000_library_knowledge_universe.sql`

### Tables
| Table | Purpose |
|-------|---------|
| `public.nodes` | Every knowledge resource (28 columns) |
| `public.edges` | Semantic connections between nodes |
| `public.collections` | Curated playlists/reading lists of nodes |
| `public.map_layers` | Named layers for the knowledge map UI |
| `public.staging` | ETL inbox — items awaiting human review before publishing |

### `public.nodes` — All 28 columns (exact insertion order)

```sql
INSERT INTO public.nodes (
    id,                   -- UUID  PRIMARY KEY
    title,                -- TEXT  display title
    title_en,             -- TEXT  English title
    title_si,             -- TEXT  Sinhala title (NULL if not applicable)
    description,          -- TEXT  default description
    description_en,       -- TEXT  English description
    description_si,       -- TEXT  Sinhala description (NULL if not applicable)
    type,                 -- TEXT  see Node Types table below
    format,               -- TEXT  e.g. 'video', 'document', 'interactive', 'image'
    url,                  -- TEXT  canonical URL
    subjects,             -- TEXT[]
    topics,               -- TEXT[]
    grades,               -- INT[]  1–13 (13 = tertiary)
    difficulty,           -- TEXT  'beginner' | 'intermediate' | 'advanced'
    language,             -- TEXT[]  ISO 639-1 codes: 'en', 'si', 'ta'
    visibility,           -- TEXT  'public' | 'school' | 'grade' | 'class' | 'private'
    verified,             -- BOOL
    is_community,         -- BOOL  false = Architect seed; true = user upload
    is_ministry_official, -- BOOL  true only for MoE / NIE resources
    curriculum_aligned,   -- BOOL
    creator_name,         -- TEXT  'Architect' for all admin seeds
    creator_role,         -- TEXT  'admin' for all admin seeds
    copyright_notice,     -- TEXT  see CONTENT_LICENSE.md
    license,              -- TEXT  see License Values below
    tags,                 -- TEXT[]
    views,                -- INT   seed value = 0
    endorsements,         -- INT   seed value = 0
    link_status           -- TEXT  'working' | 'unknown' | 'broken'
)
```

### Node Types (17 total)

| Type | UUID Prefix | Count (migration 003) | Target |
|------|-------------|----------------------|--------|
| `movie_trailer` | `0001` | 10 | 25 |
| `video` | `0002` | 30 | ✅ done |
| `lesson` | `0003` | 10 | 25 |
| `worksheet` | `0004` | 10 | 25 |
| `guide` | `0005` | 10 | 25 |
| `reading` | `0006` | 13 | 25 |
| `pedagogy` | `0007` | 21 | 25 |
| `story` | `0008` | 10 | 25 |
| `tech_guide` | `0009` | 10 | 25 |
| `pdf` | `0010` | 20 | 25 |
| `note` | `0011` | 10 | 25 |
| `circular` | `0012` | 10 | 25 |
| `map` | `0013` | 10 | 25 |
| `infographic` | `0014` | 10 | 25 |
| `link` | `0015` | 10 | 25 |
| `other` | `0016` | 10 | 25 |
| `doc` | `0017` | 10 | 25 |

**Remaining to reach 25-per-type:** 216 nodes across 4 migrations recommended.

### License Values

| Value | Meaning |
|-------|---------|
| `public_domain` | Copyright expired; no restrictions |
| `cc_by` | CC BY — attribute only |
| `cc_by_sa` | CC BY-SA — attribute + share-alike (Wikipedia, OpenStreetMap) |
| `cc_by_nc` | CC BY-NC — non-commercial only |
| `cc_by_nc_sa` | CC BY-NC-SA — non-commercial + share-alike (Khan Academy) |
| `cc_by_nc_nd` | CC BY-NC-ND — no derivatives (TED-Ed) |
| `fair_use` | Educational fair use claimed |
| `institutional` | Platform ToS; free tier for education |

---

## 🔑 UUID Scheme

All Architect seed nodes follow this exact pattern:

```
00000000-{TYPE_NUM:04d}-{ROW_NUM:04d}-0000-000000000000
```

Examples:
- Movie trailer #1:  `00000000-0001-0001-0000-000000000000`
- Movie trailer #25: `00000000-0001-0025-0000-000000000000`
- Lesson #8:         `00000000-0003-0008-0000-000000000000`
- Collection #1:     `00000000-0099-0001-0000-000000000000`

> **Row numbering is global per type across all seed migrations.**  
> If migration 003 uses rows 0001–0010 for `movie_trailer`, the next migration must start from `0011`.

---

## ✅ URL Strategy — Approved Sources per Type

| Type | Preferred Source | URL Pattern | link_status |
|------|-----------------|-------------|-------------|
| `movie_trailer` | Wikipedia film article | `en.wikipedia.org/wiki/Film_Title` | `working` |
| `video` | YouTube @channel | `youtube.com/@ChannelName` | `working` |
| `video` | TED-Ed lesson | `ed.ted.com/lessons/slug` | `working` |
| `lesson` | Khan Academy topic | `khanacademy.org/math/...` | `working` |
| `lesson` | e-Thaksalawa | `e-thaksalawa.moe.gov.lk` | `working` |
| `worksheet` | Math-Drills topic | `math-drills.com/topic/` | `working` |
| `guide` | UNESCO/UNICEF/OECD org pages | institutional homepages | `working` |
| `reading` | Project Gutenberg | `gutenberg.org/ebooks/{id}` | `working` |
| `pdf` | OpenStax book | `openstax.org/details/books/slug` | `working` |
| `pdf` | UNESCO publications | `unesdoc.unesco.org/ark:/...` | `unknown` |
| `pedagogy` | Edutopia articles | `edutopia.org/article/...` | `working` |
| `story` | Project Gutenberg | `gutenberg.org/ebooks/{id}` | `working` |
| `circular` | MoE Sri Lanka | `moe.gov.lk/...` | `unknown` |
| `tech_guide` | Google for Education | `edu.google.com/...` | `working` |
| `map` | Wikipedia / OSM | `en.wikipedia.org/wiki/...` | `working` |
| `infographic` | Our World in Data | `ourworldindata.org/...` | `working` |
| `link` | Khan Academy / TED-Ed homepages | platform homepages | `working` |
| `note` | Wikipedia concept articles | `en.wikipedia.org/wiki/...` | `working` |
| `doc` | World Bank / OECD docs | institutional document pages | `working` |
| `other` | PhET / Desmos / Scratch | platform homepages | `working` |

**🚫 NEVER use:**
- `youtube.com/watch?v=XXXXXXXXXXX` — IDs are hallucinated; no AI can reliably produce real ones
- `archive.org/details/copyrighted-book` — links to books requiring login/borrow
- Any URL containing a specific Gutenberg ID you haven't verified exists

---

## 🔧 SQL Generation Workflow (Repeatable Process)

### Step 1: Plan the Batch
Decide which types and row range you are seeding. Example:
```
Batch D (migration 004):
  movie_trailer:  rows 0011–0025 (15 nodes)
  lesson:         rows 0011–0025 (15 nodes)
  worksheet:      rows 0011–0025 (15 nodes)
```

### Step 2: Compile the URL List First
Before writing any SQL, build a numbered list of real URLs with their metadata:
```
movie_trailer 0011–0025:
  11. Taare Zameen Par (2007) — en.wikipedia.org/wiki/Taare_Zameen_Par — cc_by_sa
  12. Monsieur Lazhar (2011) — en.wikipedia.org/wiki/Monsieur_Lazhar — cc_by_sa
  ...
```

### Step 3: Generate SQL via Python Script
Use a Python helper script in `/tmp/` (never commit) to generate valid SQL:

```python
def q(s):
    """SQL-escape a string: double all apostrophes, wrap in single quotes."""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def sarr(items):
    """Build a TEXT[] literal from a Python list."""
    escaped = [q(i).strip("'") for i in items]
    return "ARRAY[" + ",".join(f"'{e}'" for e in escaped) + "]"

def iarr(items):
    """Build an INT[] literal from a Python list."""
    return "ARRAY[" + ",".join(str(i) for i in items) + "]"

def uid(type_num, row_num):
    """Generate a seed UUID."""
    return f"'00000000-{type_num:04d}-{row_num:04d}-0000-000000000000'"

def mkrow(type_num, row_num, **fields):
    """Build one VALUES row with exactly 28 fields."""
    return f"""(
    {uid(type_num, row_num)},
    {q(fields['title'])},
    {q(fields['title_en'])},
    {q(fields.get('title_si'))},
    {q(fields['description'])},
    {q(fields['description_en'])},
    {q(fields.get('description_si'))},
    {q(fields['type'])},
    {q(fields.get('format', 'document'))},
    {q(fields['url'])},
    {sarr(fields['subjects'])},
    {sarr(fields['topics'])},
    {iarr(fields['grades'])},
    {q(fields.get('difficulty', 'intermediate'))},
    {sarr(fields.get('language', ['en']))},
    {q(fields.get('visibility', 'public'))},
    {'true' if fields.get('verified', True) else 'false'},
    {'true' if fields.get('is_community', False) else 'false'},
    {'true' if fields.get('is_ministry_official', False) else 'false'},
    {'true' if fields.get('curriculum_aligned', False) else 'false'},
    {q(fields.get('creator_name', 'Architect'))},
    {q(fields.get('creator_role', 'admin'))},
    {q(fields['copyright_notice'])},
    {q(fields['license'])},
    {sarr(fields.get('tags', []))},
    0,
    0,
    {q(fields.get('link_status', 'unknown'))}
)"""
```

### Step 4: Validate Before Writing to Repo
Run this quick-check script against every generated file:

```python
import re, sys

content = open('/tmp/lib_batch_d.sql').read()

# 1. Count open vs close parens in VALUES blocks
opens = content.count('(\n')
closes = content.count('\n)')
print(f'Paren pairs: {opens} open, {closes} close')

# 2. Check for unescaped lone apostrophes inside string literals
# (False positives possible — review manually if flagged)
bad = re.findall(r"(?<!')'(?!')", content)
if bad:
    print(f'WARNING: {len(bad)} possible unescaped apostrophes')

# 3. Check for U+0DCE (unassigned Sinhala codepoint — known corruption)
for i, line in enumerate(content.split('\n'), 1):
    if '\u0dce' in line:
        print(f'UNICODE ERROR line {i}: {line[:100]}')

# 4. Check each INSERT block ends with ON CONFLICT
for match in re.finditer(r'INSERT INTO public\.(nodes|collections|edges)', content):
    block_end = content.find('ON CONFLICT', match.start())
    if block_end == -1:
        print(f'MISSING ON CONFLICT near: {content[match.start():match.start()+80]}')

print('Validation done.')
```

### Step 5: Migration File Naming

```
20260313000004_library_seed_batch_d.sql
20260313000005_library_seed_batch_e.sql
20260313000006_library_seed_batch_f.sql
```

Use sequential timestamps. Migrations run in lexicographic filename order in Supabase.

---

## 🐛 Where to Look for Errors

### Error Class 1: Hallucinated URLs (most common)

**Symptom:** Link checker finds `broken` status on 50%+ of a content type.  
**Location to check:** The URL column — specifically `watch?v=` patterns and `archive.org/details/` paths.  
**Fix:** Replace with the type's approved source (see URL Strategy table above).

```sql
-- Audit query: find all broken links seeded by Architect
SELECT id, title, type, url, link_status
FROM public.nodes
WHERE creator_name = 'Architect' AND link_status = 'broken'
ORDER BY type, title;
```

### Error Class 2: Sinhala Unicode Corruption

**Symptom:** Sinhala text renders as boxes, or contains `U+0DCE` (unassigned).  
**Location to check:** `title_si`, `description_si` columns. Run the validator above.  
**Known corruptions fixed:**

| Line | Bad | Fixed | Correct meaning |
|------|-----|-------|-----------------|
| Migration 003, L848 | `'්෎-තක්සලාව'` | `'ඊ-තක්සලාව'` | e-Thaksalawa |

**Root cause:** The Sinhala letter `ඊ` (U+0D8A, "Ii") was split into `U+0DCA` (virama) + `U+0DCE` (unassigned) — likely a Python string encoding issue or copy-paste from a system with a different Sinhala font rendering.

**Fix process:**
```python
# Detect corrupt Sinhala
for i, line in enumerate(open('migration.sql').read().split('\n'), 1):
    if '\u0dce' in line:
        print(f'Line {i}: {repr(line)}')

# Correct mapping of common corruptions:
# '\u0dca\u0dce' → 'ඊ'  (U+0D8A)
# '\u0dca\u0dcf' → 'ආ'  (check context)
```

### Error Class 3: Duplicate Array Tags

**Symptom:** `ARRAY['khan-academy','khan-academy','interactive']` — duplicate first element.  
**Location to check:** `tags` column values generated by parallel sub-agents for the same platform.  
**Fix:** Deduplicate before generating SQL:
```python
tags = list(dict.fromkeys(['khan-academy', 'khan-academy', 'interactive']))
# → ['khan-academy', 'interactive']
```

### Error Class 4: Wrong Copyright Notice for Map Sources

**Symptom:** A Wikipedia article uses `"© OpenStreetMap contributors. CC BY-SA 2.0"` — wrong license for Wikipedia content.  
**Location to check:** `copyright_notice` column for `map` type nodes.  
**Rule:**
- Wikipedia articles → `"Wikipedia CC BY-SA 4.0. Free to read, share and adapt with attribution."`
- OpenStreetMap data → `"© OpenStreetMap contributors. CC BY-SA 2.0. Free to use with attribution."`
- Wikimedia Commons maps → `"Wikimedia Commons CC BY-SA 4.0. Free to use with attribution."`

### Error Class 5: Missing `ON CONFLICT` Clause

**Symptom:** Rerunning the migration inserts duplicate rows instead of skipping.  
**Location to check:** Every `INSERT INTO` block must end with either:
```sql
ON CONFLICT (id) DO NOTHING;                           -- for nodes, collections
ON CONFLICT (from_node_id, to_node_id) DO NOTHING;    -- for edges
```

### Error Class 6: Wrong Column Count (28 for nodes)

**Symptom:** `ERROR: INSERT has more expressions than target columns` or vice versa.  
**Cause:** Adding/removing a field mid-block without updating the header column list.  
**Fix:** Always regenerate via the `mkrow()` helper which enforces 28 fields.  
**Quick count check:**
```python
# Count commas in a VALUES row (should be 27 for 28 fields)
row = """('uuid', 'title', ...)"""
print(row.count(','))  # must be 27
```

### Error Class 7: `archive.org` Copyrighted Books

**Symptom:** URL loads but requires login or a "Borrow" checkout.  
**Examples of bad paths seeded by accident:**
- `archive.org/details/thealchemist` — The Alchemist (still in copyright)
- `archive.org/details/tokillamocking00lee` — To Kill a Mockingbird (still in copyright)
**Fix:** Use `gutenberg.org/ebooks/{id}` for public domain texts only. Verify at gutenberg.org first.

---

## 🚀 Next Session Checklist

Use this as the opening checklist for any future library seeding session:

```
[ ] Run `git log --oneline -5` to confirm current state
[ ] Run type-count audit:
      python3 -c "
      import re; from collections import Counter
      c = open('apps/gurudevi-mobile/supabase/migrations/20260313000003_library_holistic_seed.sql').read()
      types = re.findall(r\"'(movie_trailer|video|lesson|worksheet|guide|reading|pedagogy|story|tech_guide|pdf|note|circular|map|infographic|link|other|doc)'\", c)
      print(Counter(types))
      "
[ ] Check for Sinhala unicode issues:
      python3 -c "
      c = open('apps/gurudevi-mobile/supabase/migrations/20260313000003_library_holistic_seed.sql').read()
      [print(f'L{i}: {l[:100]}') for i, l in enumerate(c.split('\n'),1) if '\u0dce' in l]
      "
[ ] Plan batch: which types, which row range (must not overlap existing UUIDs)
[ ] Compile URL list first (never let AI generate URLs from context)
[ ] Generate SQL via Python mkrow() helper to /tmp/lib_batch_X.sql
[ ] Validate: parens balanced, no unescaped apostrophes, ON CONFLICT present
[ ] Copy validated file to supabase/migrations/2026031300000X_library_seed_batch_X.sql
[ ] Run report_progress to commit
```

**Current status:** 170/425 nodes seeded (40%). `video` is the only type at target (30/25). All others need 4–15 more nodes each.

---

## 🧩 Parallel Agent Strategy (for large batches)

When seeding 100+ nodes, use the task agent with this structure:

1. **Assign non-overlapping types per agent.** Each agent writes to its own `/tmp/lib_batch_X.sql`.
2. **Embed the full URL list in the prompt.** Never let agents generate URLs — they will hallucinate.
3. **Specify exact row range in the prompt** (e.g., "rows 0011–0025 for lesson") to prevent UUID collisions.
4. **After all agents complete**, combine with:
   ```bash
   cat /tmp/lib_batch_d.sql /tmp/lib_batch_e.sql /tmp/lib_batch_f.sql \
     > apps/gurudevi-mobile/supabase/migrations/20260313000004_library_seed_batch_d.sql
   ```
5. **Run the validator** on the combined file before committing.

### Recommended Type Groupings per Agent

| Agent | Types | Nodes |
|-------|-------|-------|
| A | `movie_trailer`, `lesson`, `worksheet` | 45 |
| B | `guide`, `reading`, `story` | 42 |
| C | `pedagogy`, `note`, `tech_guide` | 34 |
| D | `pdf`, `circular`, `doc` | 35 |
| E | `map`, `infographic`, `link`, `other` | 60 |

---

## 📦 Key Files Reference

| File | Purpose |
|------|---------|
| `apps/gurudevi-mobile/supabase/migrations/20260313000000_library_knowledge_universe.sql` | Schema: all tables, indexes, triggers, RLS |
| `apps/gurudevi-mobile/supabase/migrations/20260313000001_library_seed_content.sql` | Legacy seed (keep, do not modify) |
| `apps/gurudevi-mobile/supabase/migrations/20260313000002_library_expanded_cinema_books.sql` | Legacy seed with hallucinated YouTube IDs (keep, do not modify — 003 cleans up) |
| `apps/gurudevi-mobile/supabase/migrations/20260313000003_library_holistic_seed.sql` | Current best seed: 170 nodes, 5 collections, 10 edges |
| `packages/library/CONTENT_LICENSE.md` | Per-source copyright & license guidance |
| `apps/gurudevi-mobile/docs/Library/data_generation_guidance.md` | JSON schema for AI-assisted node generation |
| `apps/gurudevi-mobile/docs/Library/gurudevi-library-spec.md` | Full library product specification |
| `apps/gurudevi-mobile/docs/Library/holistic_library_report.md` | Architecture overview and growth model |

---

### Session 4 — Schema Standardization & Public Access
**Status:** Completed
**Branch:** `copilot/finalize-library-seeding`

**What was addressed:**
- **Schema Fixes:** The `nodes`, `collections`, and `edges` tables were missing several columns required for the holistic seed.
- **RLS Updates:** Content was previously restricted to authenticated users. Applied new policies to allow `anon` (unauthenticated) users to view `verified=true` or `visibility='public'` content.
- **Node Type Mapping:** Mapped variety of content types (movie trailers, TED talks) to project-official ENUM types (e.g., `lesson`, `story`).

**Updated Schema Requirements (Mandatory for Seeds):**
| Table | Missing Columns Added |
|-------|-----------------------|
| `nodes` | `format`, `license`, `media`, `verified`, `is_ministry_official` |
| `collections` | `description`, `icon_emoji`, `verified`, `type`, `updated_at` |
| `edges` | `from_node_id`, `to_node_id`, `relationship` (ENUM) |

**Lessons for Future Migrations:**
1. **Always Verify RLS:** After seeding, ensure `anon` role has `SELECT` access to public/verified nodes.
2. **ENUM Consistency:** Check `pg_enum` for `node_type` and `node_relationship_type` before generating scripts.
3. **ON CONFLICT Strategy:** Ensure all seed inserts use `ON CONFLICT (id) DO UPDATE SET ...` to handle schema updates on existing nodes.

---

*Last updated: 2026-03-14 — Session 4*  
*Maintained by the Architect (Naveen) & the Engine*

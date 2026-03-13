# Gurudevi Library — Content Licensing Policy

## Overview

Every node in the Gurudevi Knowledge Library must carry a `copyright_notice` and `license`
field that accurately reflects the rights of the originating source. This document defines
the accepted license values, their meanings, and the obligations each imposes.

---

## Accepted License Values

| `license` value     | Meaning                                                                        | Attribution required? | Commercial use? | Derivatives? |
| ------------------- | ------------------------------------------------------------------------------ | --------------------- | --------------- | ------------ |
| `public_domain`     | No copyright; freely usable (Project Gutenberg, US Govt works, pre-1927 texts) | No                    | Yes             | Yes          |
| `cc_by`             | Creative Commons Attribution 4.0                                               | Yes                   | Yes             | Yes          |
| `cc_by_sa`          | Creative Commons Attribution-ShareAlike 4.0 (Wikipedia)                        | Yes                   | Yes             | SA only      |
| `odbl`              | Open Database License 1.0 (OpenStreetMap data)                                 | Yes                   | Yes             | SA only (database) |
| `cc_by_nc`          | Creative Commons Attribution-NonCommercial 4.0                                 | Yes                   | No              | Yes          |
| `cc_by_nc_sa`       | Creative Commons Attribution-NonCommercial-ShareAlike (Khan Academy, Code.org) | Yes                   | No              | SA only      |
| `cc_by_nc_nd`       | Creative Commons Attribution-NonCommercial-NoDerivatives (TED-Ed lessons)      | Yes                   | No              | No           |
| `fair_use`          | Educational fair use under copyright law (short excerpts, commentary, critique) | Context-dependent     | No              | No           |
| `institutional`     | Platform-specific ToS — typically free for educators, not openly relicensed    | See platform ToS      | See platform ToS | No          |

---

## Per-Source Guidance

### Wikipedia / Wikimedia Commons
- License: `cc_by_sa`
- Notice pattern: `"Wikipedia CC BY-SA 4.0. Free to read, share and adapt with attribution."`

### OpenStreetMap
- License: `odbl`
- Notice pattern: `"© OpenStreetMap contributors. ODbL 1.0. Free to use, share, and adapt the data with attribution and share-alike for derived databases."`

### Project Gutenberg
- License: `public_domain`
- Notice pattern: `"Public domain. Text provided by Project Gutenberg (gutenberg.org). Free to read and download."`
- ⚠️ Only use texts where US copyright has expired. Check gutenberg.org/ebooks/{id} before seeding.

### TED / TED-Ed
- License: `cc_by_nc_nd`
- Notice pattern: `"© TED Conferences LLC. TED-Ed lessons are CC BY–NC–ND 4.0. Free for educational use."`

### Khan Academy
- License: `cc_by_nc_sa`
- Notice pattern: `"© Khan Academy. Content is CC BY-NC-SA 3.0. Free for non-commercial educational use."`

### OpenStax
- License: `cc_by`
- Notice pattern: `"© OpenStax, Rice University. CC BY 4.0. Free to read, download and share."`

### UNESCO / UNICEF / World Bank / OECD (institutional reports)
- License: `cc_by_sa` for UNESCO; `institutional` for UNICEF/World Bank/OECD
- Notice pattern: `"© UNESCO/UNICEF/World Bank. Free for educational use. See site for full terms."`

### Google / Microsoft / Code.org / Kahoot (EdTech platforms)
- License: `institutional`
- Notice pattern: `"© [Platform]. Free tier available for educators. See platform for terms."`

### Archive.org materials
- License varies (`public_domain` for expired copyright; `fair_use` for others)
- Always verify the original work's copyright status before assigning `public_domain`.

---

## Seeding Rules

1. **No hallucinated URLs.** Every `url` field must point to a real, publicly accessible resource.
   Use Wikipedia article URLs, Project Gutenberg `/ebooks/{id}` pages, or institutional homepages
   rather than guessing at specific video IDs or document paths.

2. **YouTube `/watch?v=` IDs must be verified.** If you cannot confirm the video ID, use the
   creator's channel URL (e.g. `https://www.youtube.com/@TED-Ed`) and set `link_status = 'unknown'`.

3. **Set `link_status` honestly:**
   - `'working'` — you have verified the URL resolves correctly
   - `'unknown'` — you are reasonably confident but have not verified
   - `'broken'` — the URL is known to be dead (trigger a review/removal)

4. **Ministry-official content** (`is_ministry_official = true`) must come from `.gov.lk` or an
   officially affiliated domain (e.g. `nie.lk`, `exams.gov.lk`).

5. **Community content** (`is_community = true`) is set automatically when a teacher or student
   contributes a node. Seeded admin content must use `is_community = false`.

---

## Adding New Seed Content

When creating a new seed migration (`YYYYMMDDNNNNNN_library_*.sql`):

- Use UUID prefix pattern `00000000-{type_num:04d}-{row_num:04d}-0000-000000000000`
- Use `creator_name = 'Architect'` and `creator_role = 'admin'` for all admin seeds
- Include `ON CONFLICT (id) DO NOTHING` on every INSERT block
- Open the migration with `DELETE FROM public.nodes WHERE creator_name = 'Architect'`
  only if you are **replacing** an entire previous seed batch; otherwise use INSERT only

---

*Last updated: 2026-03-13 — initial policy document*

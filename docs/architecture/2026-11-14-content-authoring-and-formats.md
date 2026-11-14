---
title: "Content authoring and formats: one portable source, many ways in and out"
status: proposed
created: 2026-11-14
author: "Naveen"
scribe: "Claude"
tags: [architecture, content, markdown, authoring, editors, slides, marp, import, export, ai, offline, library]
---

# Content authoring and formats

How every piece of written content in Gurudevi is stored, edited, shown, turned into slides,
brought in from other tools and sent out to them, and worked on with AI. It is the body of a
**version** in the content model ([library.resources](domains/library/resources.md)). Content is
step 0 of the LMS: the learning loops (practice, feedback, reflection, the teacher's view) attach to it.

## The decision

All prose content (lesson pages, notes, handouts, articles, slide decks) is stored as **one
markdown dialect**: Gurudevi Markdown, specified below. Every editor, renderer, exporter and AI
action reads and writes that text. Office files (`.docx`, `.pptx`, `.xlsx`) are **doors in and
out, never the stored form**. Sheets are data, kept as their own kind.

Why this and not the alternatives:

| Option | Cost | Why not, or why |
| --- | --- | --- |
| Store Office files, preview with Google or Microsoft viewers (`media-consumption-architecture.md`, Jul 2026) | Online-only previews; tied to a vendor; content can't be diffed, translated block by block or edited by AI | Rejected for prose. Office files are imported and exported instead. |
| Store an editor's own JSON (TipTap, Lexical or BlockNote documents) | Ties the content to one editor's schema forever; AI and diffs work poorly; the mobile renderer would need that schema | Rejected. Editors are replaceable views. |
| Store HTML | Hard to diff and review; unsafe without heavy sanitising; verbose for AI | Rejected as the source. Enriched HTML is a rendering. |
| **Store a defined markdown dialect** | Each editor's markdown flavour can drift from the dialect, so a shared round-trip test suite is mandatory | **Chosen.** Plain text: portable, diffable, translatable, AI-native, small offline, and renderable natively without a WebView. |

## The pipeline

| Layer | What | Get or build |
| --- | --- | --- |
| **Source** | Gurudevi Markdown v1 (below) | Build the spec, parser, serialiser and fixtures on `unified` + `remark` (MIT) |
| **Mobile editing** | Rich text without a WebView | Get: Software Mansion `react-native-enriched` (0.8.1) or `react-native-enriched-markdown`'s input (1.2.0) |
| **Web editing** | WYSIWYG for anyone; the syntax is optional | Get: Milkdown (7.23, MIT) first, because it is markdown-first. Alternatives: TipTap (3.34, MIT), Lexical (0.53, MIT); BlockNote (0.57) is MPL-2.0. The choice stays revisable because the source is markdown. |
| **Native rendering** | `react-native-enriched-markdown` (installed in `@repo/ui` and mobile at 1.1.1; already used for AI chat, see `docs/infra/markdown-platform-routing.md`) | Get |
| **Web rendering** ("enriched HTML") | remark → rehype → sanitised HTML; named blocks become kit components | Get the pipeline; build the block registry |
| **Slides** | The same file as a deck, using Marp's conventions (`---` between slides, front-matter directives), themed from the worlds' CSS variables | Get: `@marp-team/marp-core` (4.4, MIT) for rendering |
| **Import** | `.docx` → mammoth (1.13, BSD-2) → markdown; `.pptx` → slide text, notes and images → slides markdown | Get mammoth; build the small `.pptx` reader on `fflate` (already in `@repo/library`) |
| **Export** | `.docx` (`docx` 9.15, MIT); `.pptx` and PDF (`@marp-team/marp-cli` 4.5, MIT); HTML | Get |
| **Sheets** | Tables of data (CSV/JSON); the library already reads and writes them | Keep as a separate kind |
| **AI actions** | Text edits that produce a **draft** version or variant for a person to review | Build on the AI package, through safeguarding |

Constraints that shape this:
- **PPTX and PDF export use a headless browser.** Marp CLI uses headless Chrome, so export runs on the web, a server or a desktop, never on a phone. On a phone, slides render natively or as HTML.
- **Editors are views.** Each must pass the dialect's round-trip fixtures. An editor that changes content it didn't touch is a defect.

## Gurudevi Markdown v1

Built on **CommonMark** with the extensions below, and nothing else. The parser and serialiser
live in `@repo/library/content/body`. The fixtures there are the definition, and this text
describes them.

1. **GFM:** tables, strikethrough, task lists, autolinks.
2. **Maths:** `$inline$` and `$$block$$` (TeX).
3. **Front matter** (YAML), checked by a schema:
   - `title`, `lang` (BCP 47);
   - `kind` (`page` or `slides`);
   - `theme` (a world id);
   - `marp: true` for slides.

   Unknown keys are reported, not kept silently.
4. **Named blocks** (generic directives syntax):
   - **Containers:** `:::note`, `:::tip`, `:::warning`, `:::example` (a worked example) and `:::hint{level=1}` (a rung on a hint ladder).
   - **Leaves, one per line:**
     - `::activity{form=… version=…}` — a form-builder activity;
     - `::h5p{pack=…}` — an H5P package;
     - `::video{pack=… cues=…}` — a video, with its in-video question cues;
     - `::audio{pack=…}` — an audio file.

   Leaf references name a **version or pack**, never a moving target. An unknown directive is kept as written, rendered as plain text, and reported.
5. **Slides:** in `kind: slides`, a top-level `---` separates slides. In a page it is a rule.
6. **Not allowed:** raw HTML, scripts and inline styles. They are reported and dropped on render, for security and for portability across native and web.
7. **Text:** stored in Unicode NFC. **Zero-width joiners and non-joiners are preserved**: Sinhala conjuncts and some Tamil forms need them. Answer matching in the quiz code strips them for comparison only; content never does.
8. **Images need alt text.** A missing alt is reported for the author, and AI can suggest one.
9. **Canonical style:** `-` for bullets, `*` for emphasis, `**` for strong, fenced code with backticks. Serialising is idempotent, so saving twice changes nothing.

### The round-trip contract

For every fixture (Sinhala, Tamil and English included):
- **Stable:** parsing, serialising and parsing again gives the same tree.
- **Idempotent:** serialising twice gives the same text.
- **Faithful:** an editor that opens and saves without changes leaves the text byte-identical, once it is in canonical style.

## AI actions

AI works on the text and never publishes. Each action makes a draft version, or a draft variant
in another language, that goes through the same review states as any human edit
(`draft` → `in_review` → `published`). The AI is credited as a contribution (`ai_assisted`, beside the
editorial roles). The first actions to offer:

| Action | Produces |
| --- | --- |
| Simplify for a grade, or explain more | A draft version |
| Translate (si, ta, en) | A draft language variant |
| Make practice questions from this page | A draft form-builder activity linked from the page |
| Suggest alt text, a summary, or key terms | Draft edits for the author to accept |
| Turn a page into slides, or slides into a handout | A draft of the other kind |

Which actions ship, their wording, and whether minors can use them are product decisions.
Safeguarding (`safeguard-core` in the gap map) comes before any of them reach students.

## Order of work

Each step is a commit on `integrate/nov-consolidation`, foundation first:

1. **The dialect:** spec, parser, serialiser, checks, and the round-trip fixtures in three languages.
2. **The block registry:** named blocks mapped to kit components, one contract for native and web.
3. **Slides:** splitting and theming from the worlds; Marp rendering on the web.
4. **Import and export:** `.docx` in and out, `.pptx` in, Marp out.
5. **Editors:** a Milkdown trial on the web and enriched input on mobile, both held to the round-trip contract.
6. **AI actions** as drafts, after safeguarding.

## What this changes in older documents

- `packages/ui/docs/architecture/media-consumption-architecture.md` (Jul 2026) previews DOCX and PPTX through Google or Microsoft viewers. For prose content, importing to Gurudevi Markdown replaces that. Viewer hand-off stays only for files a person keeps as files (an attachment, a downloaded original).
- `docs/infra/markdown-platform-routing.md` (Aug 2026) stays valid. It is how `react-native-enriched-markdown` resolves on the web. The package is now at 1.2.0; moving from 1.1.1 is a normal dependency step.

## Open for Neev (product)

- Which web editor teachers get first, after the Milkdown trial.
- Which AI actions ship, and whether students may use them.
- Whether slides are a separate kind of work, or the same work shown two ways.

---
title: "Library · Resources (the content model)"
status: draft
owner: Naveen
created: 2026-11-14
scribe: "Claude"
tags: [architecture, domains, library, resources, content, cms, card]
---

# Library · Resources (the content model)

`library.resources` owns content: what people learn from and with. That covers a lesson page, a
PDF or EPUB, a video or audio, an image, an H5P activity, a form-builder quiz, or a link. It is
step 0 of the LMS. Without content there is nothing to learn from, and every learning loop
(practice, feedback, reflection, the teacher's view) attaches to a piece of content. Without
the loops, though, content is only delivery.

It inherits the upstream (Gurudevi start-here). Content is authored by people and shared into
relations; it is never owned by a classroom. The evidence for why the loops sit on top is in
the project doc `claude/learning-that-works.md`.

**Who encodes it.** L0 (`schema.zmodel`, the generated Zod and the API contract) is Neev's. This
card proposes the facts. The offline **content pack** is a file format, like `h5p.json`, so its
manifest and download planning are built now in `@repo/library/content`.

## What exists today (checked 14 Nov 2026)

| Model | What it is | Against the upstream and the loops |
| --- | --- | --- |
| `Lesson`, `Material` | Content inside one `Classroom` | A container owns content, so a teacher's lesson dies with the classroom (axiom 1). Old generation: `Classroom`, not `GradeClass`. |
| `LibraryResource` (`nodes`) | One flat row per resource | No versions, so an attempt can't name the exact version tried. No hashes, sizes or variants, so offline packs can't be planned. Languages are fixed `title_si/ta/en` columns. Alignment is one boolean (`curriculum_aligned`). Counters (`views`, `endorsements`) are stored instead of read. |
| `LibraryCollection`, `CollectionNode` | Ordered collections, with an append-only event trail | Good; keep. Sequences of works reuse this. |
| `@repo/editorial` | Rights agreements, contributions, review states, translation status | Good vocabulary for review and rights; reuse it rather than a second one. |

## Facts it owns

- **Work.** The identity of a piece of content, across all its versions. It holds:
  - its kind: `page`, `document`, `video`, `audio`, `image`, `h5p`, `activity` (form builder), `link`, or `sequence`;
  - its authors and contributors, using the editorial roles (`author`, `translator`, `editor`, `reviewer`, `curator`). Owner kind is **person**, or **public** once published;
  - an optional institution, when a school publishes it officially.
- **Version.** An immutable snapshot of a work. Attempts, journal steps, shares and alignments all name a version, so changing a lesson never rewrites what a learner did. It holds:
  - its body, by kind: Gurudevi Markdown for pages and slides ([content authoring and formats](../../2026-11-14-content-authoring-and-formats.md)), a file reference, an H5P package, or a form schema;
  - its licence (an SPDX or Creative Commons identifier) and attribution;
  - its source, when curated or licensed (the editorial `ExternalSource`);
  - its review state: `draft` → `in_review` → (`rights_review`) → `published` · `withdrawn`;
  - the time it was made, and by whom.
- **Variant.** One way to deliver a version: a language (si, ta, en and others), a format, and a quality (`low`, `standard`, `high`), with each file's bytes and SHA-256. A translation is a variant with its own review state. This replaces the fixed per-language columns.
- **Alignment.** A link from a version to a syllabus outcome (an NIE outcome, later in CASE form), or to a person's own area (`wellbeing.growth`). It records who aligned it and when. A version can align to many outcomes, or to none; outside-syllabus content is first-class.
- **Pack.** The offline unit for a version: its manifest, files and sizes (see below).

What it does **not** own:
- Sharing content with learners, with an intent ("read before Tuesday", "practise this") — that is `learning.assignments` or the relation's content in `learning.relations`.
- Attempts — those are `learning.assessments`.
- Use counts and endorsements — those are read-time views over engagement facts, not stored counters.

## Invariants

1. A version never changes after it is published. Edits make a new version, and the work points at its current one.
2. Every fact that refers to content names a version, not only a work.
3. Every published version has a licence and at least one language variant.
4. Content is never owned by a container. A classroom or grade class receives shares of versions, and losing the container loses nothing authored.
5. Alignment is optional and many-to-many, and it records its author. Nothing ranks content by alignment.
6. Every variant's files carry their size and SHA-256, so a device can plan a download and check what it received before opening it.

## Authority and privacy

- **Drafts** are the authors' (owner kind: person).
- **Published versions** are public, or institution-visible when an institution publishes them for its own people.
- **Review:** an institution's reviewer approves its official content. The `is_ministry_official` mark (in today's model) belongs on a version, set only by a ministry-capacity reviewer.
- **Rights:** a version with `rights_review` pending can't be published. A takedown withdraws the version, and keeps the record that it existed.

## Offline: the content pack (built now)

A pack is the files of one version, with a manifest (`gurudevi-pack.json`) listing each file's path, role, language, quality, bytes and SHA-256. Packs can depend on other packs, for example shared H5P libraries.

- **The download plan** (`planDownload`) picks one variant per role, using:
  - the person's language order;
  - the free space and data budget on the device;
  - whether the connection is metered, and the quality policy.

  It says what it would fetch, what it skipped and why, and whether it fits. It never silently half-downloads.
- **Verification** (`verifyPack`) checks every file's size and hash through a hash port (expo-crypto on mobile, WebCrypto on the web) before the content opens.

## Commands and queries (on admission)

| Command | What it does |
| --- | --- |
| `library.resources.createWork` | Starts a work with its first draft version. |
| `library.resources.draftVersion` | A new draft version from the current one. |
| `library.resources.submitForReview` / `review` / `publish` / `withdraw` | The review lifecycle, reusing the editorial states. |
| `library.resources.addVariant` | A translation or another format or quality, with its files' sizes and hashes. |
| `library.resources.align` / `unalign` | Links a version to an outcome or an area. |

| Query | What it returns |
| --- | --- |
| `library.resources.work` | A work with its current published version and variants. |
| `library.resources.version` | An exact version, for anything that names one. |
| `library.resources.pack` | A version's pack manifest, for the download plan. |
| `library.resources.search` | Published content by language, kind, subject, grade and outcome. |

## Migration from today's models (owner's decision)

- `LibraryResource` rows become works, each with one published version and one variant per language that has a title.
- `Lesson` and `Material` become works authored by the classroom's teacher, shared into the classroom. The classroom layer itself is the open two-generations question in the start-here doc.

## Open questions

- **Page body.** Settled as Gurudevi Markdown with named blocks (activity, H5P, video, callouts, hints, maths), not an editor's JSON. See [content authoring and formats](../../2026-11-14-content-authoring-and-formats.md). Which editor teachers get is still open.
- **Who reviews official content.** Is it per institution or national? _Default:_ per institution, with a separate ministry mark.
- **Teachers' copies.** Does editing someone else's published work make a fork (a new work) or a suggestion? _Default:_ a fork that credits the original, as `LibraryCollection.original_collection_id` does today.

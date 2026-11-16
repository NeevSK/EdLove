---
title: "Open Source and Upstream Reuse Policy Proposal"
status: "proposed"
created: 2026-11-08
updated: 2026-11-08
author: "Naveen"
tags: [open-source, licensing, upstream-reuse, copyleft, trademark, proposal]
---

# Open Source and Upstream Reuse Policy Proposal

## Purpose

Record one coherent licensing direction for EdLove and Gurudevi, and separate
two questions that have repeatedly become confused:

1. What terms apply when this project receives code or other material from
   someone else?
2. What terms should apply when someone else receives and reuses this
   project's work?

This is a proposal for an owner decision, not a legal opinion and not a license
change. The root repository currently carries MIT terms; this document does not
replace them.

## Intent

The project intends to support the software-freedom principles associated with
the Free Software Foundation: people should be able to run, study, modify, and
share the software. The project welcomes reuse and independent services. It
does not seek exclusivity over those freedoms or to prevent competition.

The project also intends to respect the people and projects whose work it uses:
preserve their notices, honor their licenses, credit their authors, and avoid
presenting another project's work as our own. The official EdLove and Gurudevi
names and marks identify the authentic upstream project; code reuse alone does
not grant permission to use those marks to imply endorsement or official status.

## The two directions

### A. Code and material received from upstream projects

The upstream license governs the upstream material. Choosing a license for
Gurudevi does not erase or replace that license. Before incorporating material,
record its source, version, license, notices, relevant dependencies, and intended
integration boundary.

The project may study public source code for ideas and independently implement
useful behavior. If source code, assets, documentation, or other protected
material is copied or adapted, follow its actual license and preserve required
attribution and notices. Treat code, content, fonts, media, datasets, trademarks,
and patents as distinct rights questions.

License compatibility depends on the exact licenses and on whether components
are copied, linked, bundled, or remain separate services. MIT, BSD, ISC, and
Apache-2.0 material is generally compatible with an AGPL-3.0 distribution when
its notices and conditions are preserved. GPL-3.0 and AGPL-3.0 have an explicit
combination path. GPL-2.0-only, MPL-2.0, LGPL, project-specific exceptions, and
mixed dependency trees require checking the exact terms and architecture before
integration. Keeping two programs separate and communicating through an API is
not the same license question as combining them into one program.

No contributor should infer that a repository-wide license badge accurately
covers every dependency, asset, or subdirectory. Maintain a machine-readable
dependency license inventory and human-readable provenance for copied material.

### B. Code received from this project

**Proposed default for code the project has authority to license: GNU AGPL-3.0.**
This best matches the stated intent: allow anyone to use, modify, redistribute,
and run the software, while requiring source to be offered to users who interact
over a network with a modified covered program. It permits independent forks,
commercial activity, and competing hosted services; it does not reserve the
market for the original project.

AGPL-3.0 does not automatically relicense upstream components. A combined
distribution must comply with each included component's terms. Code owned by
contributors or third parties may be separately licensed where its owner has
not granted the project sufficient rights to relicense it.

The project's name, logos, and marks are separate from the software license.
Adopt a clear trademark policy that permits accurate references and
compatibility statements while reserving the right to identify the official
project and prevent misleading endorsement claims. A fork may identify itself
as an independent fork and must not imply it is the official service.

## Contribution stewardship

Open source should not erase authorship. Preserve copyright attribution for
contributors and upstream authors. Before accepting contributions under AGPL,
publish a clear contributor policy explaining the inbound license and any
copyright or patent permissions needed to distribute the contribution. Do not
silently claim ownership of contributors' work or promise rights the project
does not hold.

## Scope by material type

| Material | Proposed handling |
| --- | --- |
| Original application and server code | AGPL-3.0, after rights and compatibility review |
| Third-party source and dependencies | Keep upstream license and notices; assess compatibility |
| Documentation | Choose a suitable Creative Commons license per document set; do not assume software licenses cover it |
| Educational resources, images, audio, video, datasets, fonts | Track creator, source, license, attribution, and redistribution/derivative permissions individually |
| Names, logos, product marks | Separate trademark policy; no automatic rights from source license |
| Standards and formats (for example, H5P packages or education interchange formats) | Implement or consume according to the format and component terms; a format is not a blanket license to its content or software |

## Reuse review workflow

For every material integration, answer these questions before shipping:

1. What exact repository, version, files, assets, and transitive dependencies are used?
2. What licenses and notices apply to each item? Is the evidence from the source repository or merely a summary?
3. Are we studying behavior, independently implementing it, copying code, consuming a package, or running a separate service?
4. How are components combined and delivered: app bundle, browser bundle, device package, container, or network service?
5. What notices, source offers, reciprocal terms, attribution, or other conditions must users receive?
6. Does the integration preserve upstream authorship and avoid confusing use of names or marks?
7. Record the decision and unresolved questions in the package's provenance or dependency record.

When the exact compatibility answer is uncertain, isolate the project as a
separately deployed service if that suits the product, or obtain qualified legal
review before copying or combining code. Do not treat architectural separation
as an automatic legal conclusion.

## Decision still required

The owner should explicitly decide whether to replace the current MIT licensing
direction with AGPL-3.0 for original application code. Before applying that
decision, inventory contribution ownership and third-party code, reconcile the
root `LICENSE`, README badges and claims, package-level licenses, extracted
projects, documentation/content licenses, and trademark policy. Preserve
existing notices and do not relicense code where the project lacks authority.

Until that decision and inventory are complete, the existing MIT license and
accepted openness ADR remain the repository's recorded terms. This proposal
clarifies intent but does not itself alter permissions.

## Primary references

- GNU license overview: <https://www.gnu.org/licenses/licenses.html.en>
- GNU license compatibility: <https://www.gnu.org/licenses/license-compatibility.en.html>
- GNU GPL FAQ on compatibility and combinations: <https://www.gnu.org/licenses/gpl-faq.en.html>
- GNU AGPL-3.0 text: <https://www.gnu.org/licenses/agpl-3.0.html>
- Apache License 2.0: <https://www.apache.org/licenses/LICENSE-2.0>
- Mozilla Public License 2.0 FAQ: <https://www.mozilla.org/en-US/MPL/2.0/FAQ/>

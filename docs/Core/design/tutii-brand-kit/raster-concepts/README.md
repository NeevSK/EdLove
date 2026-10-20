# Tutii raster collection tracker

This folder holds concept art for a broad raster illustration library. The images are individually generated from the current Tutii reference. They are **concepts only**: no image here is approved for production, and none is connected to the mobile or web app.

## Concept batches

- [`round-01/`](round-01/README.md): 14 individual character studies spanning teacher, student, principal, guardian, shared poses, and generic completion/recovery states.
- [pose-studies-round-02/](pose-studies-round-02/README.md): 4 more shared poses, bringing the first exploration to 18 distinct pose concepts.
- [`scene-studies-round-01/`](scene-studies-round-01/README.md): 5 composed classroom, leadership, family, library, and community scenes.
- [scene-studies-round-02/](scene-studies-round-02/README.md): 5 further teacher, learner, handoff, sport, and wellbeing scenes.
- [scene-studies-round-03/](scene-studies-round-03/README.md): 14 more learner, teacher, leadership, family, library, and community scenes.
- [state-studies-round-01/](state-studies-round-01/README.md): first-use empty-state direction sample.
- [state-studies-round-02/](state-studies-round-02/README.md): six state concepts for search-empty, offline, queued work, long wait, recoverable error, and not found.

## Review experience`r`n`r`nOpen [state-review-showcase.html](state-review-showcase.html) to see each state in a responsive Gurudevi screen. The page is a standalone review artifact and does not load into app runtime.`r`n`r`n## Current progress

- 18 individual character pose concepts are saved across round 01 and pose-studies round 02.
- 24 composed context scenes are saved across three scene-study rounds; the open-day image is flagged for firefly identity drift.
- Seven dedicated state illustrations are saved across two state-study rounds. See [state coverage](state-coverage.md) for the full system, including states intentionally handled without mascot art.
- The 7 motion clips are not created. Existing static welcome, empty, offline, and error art in the web app remains legacy reference material for the unified set.
- None of the new concepts are in runtime code or marked production-approved. Existing Web `firefly-guide-*` assets cover several contexts; see [state coverage](state-coverage.md) for the audit.
## Full collection to build

### Core pose and expression library — 18 distinct poses

1. Face-forward welcome
2. Attentive listening
3. Thinking or planning
4. Curious lean
5. Open-hand guidance
6. Point toward a next step
7. Hover in a shallow arc
8. Land and settle
9. Rest with relaxed wings
10. Read alongside someone
11. Look back toward the user
12. Help one person
13. Support a group
14. Quiet celebration
15. Gentle concern
16. Uncertain, then seeking help
17. Playful discovery
18. Calm waiting

The first concept round explores many of these, but the collection still needs a pose-by-pose review for genuine silhouette and gesture variety. A role label or outfit change does not count as a new pose.

### Role and context scenes

Create purposeful scenes for:

- **Learners:** start a lesson, plan, practice, ask, read, reflect, receive feedback, recognize progress, return after a break.
- **Teachers:** prepare a lesson, begin class, check attendance, teach a group, help one learner, lead group work, give feedback, guide a transition, wrap up the day.
- **Principals and school teams:** review school papers, plan, coordinate staff, review policy, guide a team, hand work off, make a shared decision.
- **Parents and guardians:** welcome a family, link with a learner's school, read a notice, meet an educator, support a learner, celebrate effort.
- **Librarians and mentors:** browse, read, find a resource, follow a question, recommend a book or tool.
- **School community:** open day, arts, sports, service, cultural gathering, meeting, seasonal celebration.
- **Wellbeing and care:** pause, reflect privately, ask for help, receive a supportive check-in, return calmly, set a respectful boundary.

Scenes should show real people and places where that adds meaning. Tutii should share the scene's light, scale, and activity rather than sit on top as a sticker. Role clothes and props are optional and should clarify a real function; complete outfits should be coordinated and cover the body and legs.

### Shared app states

Create or approve an uncostumed, cross-role visual for: welcome/return, loading, empty, listening/waiting, offline, queued work, reconnecting, recoverable error, retry, maintenance, and completion. Use the existing app-state files as references; avoid producing near-duplicate poses for the same meaning.

### Motion studies — 7 purposeful clips

1. Arrival and direct gaze
2. Listen and settle
3. Attention shift
4. Guide toward a next step
5. Short fly-by between narrative beats
6. Land and rest
7. Quiet completion

Every clip needs a still fallback. These are not yet authored as Lottie/Rive files; generated stills do not count as animation.

## Review gates before app use

- Confirm face, proportions, wing anatomy, gaze, and recognizability stay consistent.
- Review palette and glow; current concepts still inherit too much amber from the reference and need art direction before approval.
- Review role garments for completeness, cultural fit, and restraint.
- Check each pose at inline, card, and scene sizes, plus phone, tablet, and desktop crops.
- Keep one source reference and record provenance for every accepted image.
- Export optimized transparent WebP/PNG derivatives only after review; keep concepts out of runtime bundles.

## Concept source

Each file in the batch folders is a separate image. The images were generated as visual studies using the existing Tutii raster artwork as reference. There are no production exports, editable layered masters, or animation files in this collection yet.












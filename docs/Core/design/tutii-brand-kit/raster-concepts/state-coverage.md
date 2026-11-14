# Tutii state art coverage

This is the concept-level state system. It does not connect or replace assets in application code. New art remains unapproved until visual, brand, accessibility, and responsive-crop review.

## Existing Web artwork

`apps/gurudevi-web/public/mascot/` contains older `firefly-guide-*` WebP files for welcome, onboarding, empty, offline, error, explore, professional, and coming-soon contexts. The welcome and onboarding cutouts are referenced by web welcome/auth/onboarding screens; the error scene is used by both web error boundaries; the explore cutout is used by not-found. Empty and offline files exist but those files are not currently referenced by the searched screens. Treat these as legacy candidates to compare against the unified Tutii set, not automatic production approvals.

The welcome-page review now uses [`welcome-garden-tutii-concept.png`](../../../../../apps/gurudevi-web/public/artwork/welcome-garden-tutii-concept.png), a scene concept composed with Tutii within the garden rather than layered as a separate cutout. Keep it under visual review before production approval.

## State-to-art mapping

| State | Concept art to use/review | UX treatment |
|---|---|---|
| First-use empty | [First-use sample](state-studies-round-01/state-first-use-empty.png) | Explain what belongs here and offer one useful first action. |
| Search/filter has no matches | [Search-empty study](state-studies-round-02/state-search-empty.png) | Explain that the query found nothing; offer a clear-filter or query-change action. |
| All caught up | Existing [quiet-completion pose](round-01/state-quiet-completion.png) | Reuse for low-key completion; explain there is nothing left to do. Avoid a celebration for routine states. |
| Short/in-place loading | No Tutii image | Use stable skeletons or a small progress indicator near the action. Avoid making routine work feel slower. |
| Long wait | [Long-wait study](state-studies-round-02/state-long-wait.png) | Use only when a wait is meaningfully long; say what is still loading. |
| Offline with local content | [Offline-available study](state-studies-round-02/state-offline-available.png) | Say what remains available and whether new work can be saved locally. |
| Work queued to sync | [Queued-work study](state-studies-round-02/state-work-queued.png) | Confirm the action is saved locally and waiting to sync. Preserve local work. |
| Reconnecting/syncing | Reuse the queued-work illustration, with a small inline progress indicator | Say when syncing starts and when it completes; don't imply completion while it is still pending. |
| Recoverable action error | [Recoverable-error study](state-studies-round-02/state-recoverable-error.png) | State what failed and offer a clear retry or alternate path. Keep the copy blame-free. |
| Access/permission denied | No dedicated mascot art | Explain who can grant access and how to request it. Keep the user in context. |
| Not found/moved | [Not-found study](state-studies-round-02/state-not-found.png) | Explain the item may have moved and offer a safe destination. |
| Service maintenance/unavailable | Reuse the long-wait study | Explain that the service is temporarily unavailable and confirm saved work remains safe. |
| Partial completion | Existing [quiet-completion pose](round-01/state-quiet-completion.png), if it helps | State exactly what succeeded and what still needs attention. Prefer no large illustration in a dense workflow. |
| Success | Existing quiet-completion pose | Use proportionate acknowledgement. Reserve a bigger celebratory treatment for meaningful milestones. |
| Destructive confirmation | No mascot by default | Put the consequences and choices in the confirmation copy and controls. |
| Empty/error field validation | No mascot | Show the message next to the field or action that needs attention. |

This gives the core states distinct semantics while reusing art where the user-facing meaning is close. The image is supportive; copy, state labels, and available actions remain the source of truth.

## Brand and UX rules

- Keep the firefly Tutii face, proportions, purple limbs/head, antennae, leaf collar, veined wings, and segmented amber body recognizable. Vary pose and setting, not the character species.
- Keep amber on Tutii; use grounded daylight and natural surroundings for scenes. Avoid a gold wash or mystical atmosphere.
- First-use empty, no search results, and all-caught-up are different states and need different copy/actions.
- Offline is not automatically an error. Separate offline access, queued work, syncing, and failed sync in both copy and system status.
- Do not let an illustration carry the only explanation. Provide text and accessibility labels; keep decorative images out of screen-reader order.
- Check crop and scale on phone, tablet, and desktop. Scene art belongs in spacious narrative contexts; compact states should use cutouts or no art.
- Avoid anxious, ashamed, injured, or blaming expressions. Use language and imagery that work for students, teachers, principals, and families.
- Any future motion needs a still fallback and must respect reduced-motion preferences.

## Art review flags

- The open-day image in [scene-studies-round-03](scene-studies-round-03/README.md) depicts a bird instead of firefly Tutii. It is excluded from the usable Tutii set until regenerated.
- All generated concepts need final review for palette, character consistency, context fit, and responsive crops. Concept art is not yet approved product art.

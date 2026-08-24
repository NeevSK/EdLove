---
title: "Gurudevi Marketing Web â€” Elegant Launch Redesign"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-marketingWeb, historical]
---

# Gurudevi Marketing Web — Elegant Launch Redesign

## Summary

Redesign the full Gurudevi marketing surface around brand understanding rather than feature density.

Primary goal: communicate Gurudevi’s human purpose, philosophy, and trustworthiness.

Visual direction: human editorial — real Sri Lankan education imagery, warm paper-like surfaces, deep indigo, restrained saffron, quiet motion, and generous whitespace.

Scope: full marketing site, including Home, About, FAQ, Support, Privacy, Terms, Thuthimal, and launch conversion.

## Core experience

### Homepage structure

1. **Full-bleed hero**

   Headline: “Technology that gives energy back to education.”

   Supporting message: “Gurudevi connects teachers, students, schools, families, and communities in one respectful education ecology.”

   Actions:
   - Join or follow the October 6 launch
   - Explore how Gurudevi works

2. **The education tension**

   Explain the human problem plainly:
   - teachers carry too much operational weight
   - students need agency rather than surveillance
   - schools need visibility without institutional overreach
   - families need connection without intrusion

3. **Four role pathways**

   Replace the generic pillar-card grid with editorial pathways:
   - Teachers — prepare, teach, reflect
   - Principals — coordinate without surveillance
   - Students — learn with agency
   - Families — stay connected with dignity

4. **Workspace ecology**

   Explain the product surfaces through outcomes:
   - Classroom
   - School
   - Family Space
   - Learning Studio

5. **Real product proof**

   Use authentic Gurudevi Mobile/Web screenshots rather than fake dashboard illustrations.

6. **Trust and boundaries**

   Explain what teachers can keep private, what principals can see, what families can access, what Gurudevi does not automate, and how human review works.

7. **Launch section**

   Centralize October 6 launch information: date, Sri Lanka timezone, countdown, launch CTA, institutional enquiry CTA, and clear “coming soon” language where appropriate.

8. **Final CTA**

   Use one dominant conversion action and one secondary informational action.

## Parallel workstreams

### Strategy lead

Own the shared brief and resolve conflicts between workstreams.

Deliverables: positioning statement, audience hierarchy, conversion goal, page responsibilities, approved visual/verbal thesis, and decision log.

### UX and information architecture

Define the full navigation map, visitor journeys for teacher/principal/student/family, CTA hierarchy, mobile navigation behavior, and launch conversion flow.

### Content and copy

Rewrite all public copy in plain, warm, credible language. Produce role messaging, workspace descriptions, trust/privacy language, FAQ copy, and Sinhala/Tamil translation-ready content keys.

Remove invented testimonials and unsupported adoption claims. Explain practical value before philosophy.

### Visual art direction

Create the photography brief, approved image sources, crop rules, typography pairing, refined palette, material direction, and image alt-text guidance.

Use real people and places, Sri Lankan context without stereotypes, calm editorial compositions, and no decorative imagery without narrative purpose.

### Layout and responsive system

Create the full-bleed hero, editorial role sections, product-proof layout, responsive mobile composition, shared spacing/type scale, and reduced-card visual system.

Retain Astro and Tailwind; rebuild composition and hierarchy rather than introducing a new framework.

### Motion and polish

Implement three major motion systems: restrained hero entrance, scroll-linked image/text reveal, and role/workspace reveal. Add launch countdown behavior, hover/focus states, and reduced-motion fallbacks.

### Accessibility and performance

Validate keyboard navigation, focus states, contrast, screen-reader labels, countdown announcements, reduced motion, mobile tap targets, image loading, fonts, and Core Web Vitals.

### Technical and SEO cleanup

Remove stale marketing-owned durable-agent UI after migration is complete. Keep durable-agent functionality behind Gurudevi Mobile/Sanctuary API. Centralize launch configuration, validate canonical URLs/sitemap/robots/Open Graph/JSON-LD, and eliminate avoidable browser bundle warnings.

### QA and launch readiness

Run desktop/mobile screenshot review, slow-network testing, launch countdown testing, CTA/link validation, analytics verification, and regression checks.

## Page responsibilities

- **Home:** explain Gurudevi and create emotional understanding
- **About:** explain the education ecology and philosophy
- **FAQ:** answer practical questions about access, privacy, roles, and launch stage
- **Support:** collect support, feedback, bug reports, and feature requests
- **Thuthimal:** explain gratitude without implying unverified impact
- **Privacy/Delete Account:** provide clear user controls
- **Terms:** remain legally readable and visually consistent

## Public interfaces

Add one centralized launch configuration object containing the launch timestamp, timezone label, display date, launch status, and CTA target.

Add translation-ready content keys for the hero, role pathways, workspace descriptions, trust principles, launch messaging, and CTA labels.

Do not add new public API endpoints for the marketing site.

## Testing and acceptance

### Functional

- every navigation link works
- every CTA has a defined destination
- countdown works before and after launch
- countdown displays correctly in Sri Lanka time
- launch CTA works on desktop and mobile
- forms show loading, success, and error states
- privacy/delete-account links remain reachable

### Responsive

Validate at 360px, 390px, 768px, 1024px, and 1440px widths.

### Visual

Review captured screenshots for first-viewport hierarchy, hero image strength, headline readability, section rhythm, mobile overflow, visual consistency, and absence of unnecessary cards/shadows.

### Accessibility

Test keyboard-only navigation, screen-reader landmarks, visible focus, contrast, reduced-motion preference, accessible countdown messaging, and alt text.

### Performance

Audit image formats/sizing, font loading, bundle warnings, Lighthouse/Core Web Vitals, and accidental mobile-app/server-only code in the public bundle.

## Assumptions

- Brand story is the primary objective; launch conversion is secondary.
- Real product imagery will be used where available.
- Unsupported statistics and invented testimonials will not be published.
- “Family Space” remains the recommended fourth workspace name.
- Astro/Tailwind remains the implementation stack.
- The marketing site remains public and informational; product functionality belongs to Gurudevi Mobile and Sanctuary API.
- The first implementation pass establishes the complete design system and homepage, then propagates it across secondary pages.

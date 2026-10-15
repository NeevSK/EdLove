---
title: "EDLOVE.ORG â€” 03 TECH"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [apps, edlove-web]
---

# EDLOVE.ORG — 03 TECH
## The Build Guide | How We Actually Make This

**Role in Constellation**: The technical blueprint. Feed this to Cursor alongside the relevant domain doc.  
**Last Updated**: April 17, 2026

---

## IMPORTANT CURRENT ADDENDA

This file remains the core technical guide for edlove.org, but for current cross-site reality and future AI-native direction, also read:

- [18_WEB_PLATFORM_STATUS_2026-04-17.md](./18_WEB_PLATFORM_STATUS_2026-04-17.md)
- [19_AI_NATIVE_WEB_ROADMAP.md](./19_AI_NATIVE_WEB_ROADMAP.md)

---

## THE STACK (And Why)

Every choice here is driven by three constraints:
1. **AI-Friendly** — Cursor and Claude can build it well
2. **Free or near-free** — Sustainable without funding
3. **Fast and flexible** — Performs well, changes easily

### Frontend Framework: Astro
**Why**: Static-first. Blazing fast. Works with ANY UI framework (Svelte, React, Vue, or vanilla JS). AI tools generate Astro code very well. Zero JavaScript shipped by default unless you explicitly add it.

```
Install: npm create astro@latest
Docs: https://astro.build
```

### Interactive Components: Svelte
**Why**: Tiny bundle size. Compiles away — almost zero runtime. Perfect for the interactive pieces (paradigm cards, animations, search). AI generates Svelte well.

```
Add to Astro: npm install @astrojs/svelte svelte
```

### Styling: Tailwind CSS
**Why**: Utility-first. Consistent design system. AI generates it perfectly. Fast to write. Works beautifully with Astro.

```
Add to Astro: npx astro add tailwind
```

### Animations: GSAP (GreenSock)
**Why**: Industry standard for web animation. Handles scrollytelling beautifully. Smooth, performant, works on all devices. The "Malick Effect" (contemplative scroll pacing) lives here.

```
Install: npm install gsap
```

### Search: Pagefind
**Why**: Completely free. Works with static sites. No backend needed. Built-in with Astro. Instant search.

```
Add to Astro: npm install pagefind
```

### Content: Markdown + Frontmatter
**Why**: Every piece of content (paradigm descriptions, thinker profiles, stories, guides) is a markdown file. AI generates markdown perfectly. Version controlled in Git. Easy to edit, easy to add, easy to sort.

```markdown
---
title: "Maria Montessori"
domain: "epistemic"
category: "thinker"
tags: ["montessori", "prepared-environment", "child-development"]
published: true
date: "2026-02-03"
---

# Maria Montessori

Content goes here...
```

### Hosting: Cloudflare Pages
**Why**: Free tier is genuinely free. Unlimited bandwidth. Global CDN (fast everywhere). Automatic SSL. Deploys from GitHub automatically. Edge functions if we need dynamic features later.

```
Sign up: https://pages.cloudflare.com
Deploy: Connect GitHub → auto-deploys on every push
```

### Analytics: Plausible (or Cloudflare Analytics)
**Why**: Privacy-friendly. Simple. No tracking cookies. Plausible is ~$9/month. Cloudflare Analytics is free but basic. Start with Cloudflare, upgrade if needed.

### Domain
- **edlove.org** (~$15/year via Namecheap, Cloudflare, or similar)
- Subdomains if needed: `app.edlove.org`, `community.edlove.org`

### Total Monthly Cost
| Item | Cost |
|------|------|
| Astro + Svelte + Tailwind | $0 (open source) |
| Cloudflare Pages | $0 (free tier) |
| Cloudflare Analytics | $0 |
| Domain (edlove.org) | $1.25/month (~$15/year) |
| **Total** | **~$1.25/month** |

If we add Plausible later: $10.25/month. Still nothing.

---

## SUBDOMAIN STRATEGY

### The Ecosystem Architecture

EdLove.org is the main site (this constellation documents it).

Three additional sites exist as **subdomains** temporarily:

| Subdomain | Purpose | Future Home |
|-----------|---------|-------------|
| gurudevi.edlove.org | Teacher sanctuary web companion | gurudevi.lk (when funded) |
| intuituilabs.edlove.org | Systems intelligence studio | intuituilabs.lk (when funded) |
| neevsk.edlove.org | Personal portfolio/writing | neevsk.lk or stays subdomain |

### Why Subdomains (Temporarily)

**Economic reality:**
- Separate `.lk` domains cost money (~$15-30/year each)
- Current priority: build EdLove.org first
- Subdomains are free and professional

**Technical benefits:**
- Easy to set up (just DNS configuration)
- Can deploy independently (separate Astro projects)
- Professional URLs (gurudevi.edlove.org looks legitimate)
- Easy migration later (301 redirects preserve SEO)

### Hosting Configuration

**Monorepo structure:**
```
/apps
  /edlove-web → deploys to edlove.org
  /gurudevi-marketingWeb → deploys to gurudevi.edlove.org  
  /intuitui-web → deploys to intuituilabs.edlove.org
  /neevsk-web → deploys to neevsk.edlove.org
```

**Deployment (Cloudflare Pages or Vercel):**
- Each subdomain is a separate deploy
- Point each to correct `/apps/[name]` directory
- Configure custom domains in hosting dashboard

**DNS Configuration:**
```
A record: edlove.org → Hosting IP
CNAME: gurudevi.edlove.org → hosting-provider.com
CNAME: intuituilabs.edlove.org → hosting-provider.com
CNAME: neevsk.edlove.org → hosting-provider.com
```

### Migration Path (Future)

When funding allows:
1. Register new domain (e.g., gurudevi.lk)
2. Add to hosting as additional domain
3. Set up 301 redirects (gurudevi.edlove.org → gurudevi.lk)
4. Keep redirects active forever (SEO, bookmarks)

### Documentation Strategy

**EdLove.org = this constellation** (complete, ready to build)

**Subdomains = documented separately when building begins:**
- Full strategy docs created only when ready to build
- For now: See `11_SUBDOMAIN_NOTES.md` for brief context
- Keeps focus on Phase 1 priority (EdLove.org)

---

## FILE STRUCTURE

This is the exact project layout. Every file has a purpose. Nothing extra.

```
edlove/
│
├── package.json
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
│
├── src/
│   │
│   ├── pages/                    # URL structure (file = route)
│   │   ├── index.astro           # Homepage (edlove.org)
│   │   ├── paradigms/
│   │   │   └── index.astro       # Domain I: Paradigm Cosmos
│   │   ├── sri-lanka/
│   │   │   ├── index.astro       # Domain II: Sri Lanka (main)
│   │   │   ├── official.astro    # Official structure
│   │   │   └── shadow.astro      # Shadow education
│   │   ├── gurudevi/
│   │   │   └── index.astro       # Domain III: Gurudevi portal
│   │   ├── library/
│   │   │   └── index.astro       # Domain VI: Library (browse view)
│   │   ├── resources/
│   │   │   └── index.astro       # Domain IV: Resources (v0.1)
│   │   └── community/
│   │       └── index.astro       # Domain V: Sangha (v0.1)
│   │
│   ├── content/                  # All markdown content lives here
│   │   ├── paradigms/            # Domain I content
│   │   │   ├── industrial.md
│   │   │   ├── montessori.md
│   │   │   ├── democratic.md
│   │   │   ├── unschooling.md
│   │   │   └── indigenous.md
│   │   ├── thinkers/             # Domain VI: Thinker profiles
│   │   │   ├── paulo-freire.md
│   │   │   ├── maria-montessori.md
│   │   │   ├── ivan-illich.md
│   │   │   ├── bell-hooks.md
│   │   │   └── [indigenous-elder].md
│   │   ├── frameworks/           # Domain VI: Theoretical frameworks
│   │   │   ├── devneevma-pressure-theory.md
│   │   │   ├── education-ecology.md
│   │   │   └── thermodynamic-semiotics.md
│   │   ├── guides/               # Domain VI: Practical guides
│   │   │   ├── montessori-guide.md
│   │   │   ├── waldorf-guide.md
│   │   │   ├── democratic-schools-guide.md
│   │   │   ├── unschooling-guide.md
│   │   │   └── forest-schools-guide.md
│   │   ├── stories/              # Domain VI: Real narratives
│   │   │   ├── teacher-transformation.md
│   │   │   ├── student-journey.md
│   │   │   ├── school-innovation.md
│   │   │   ├── family-experience.md
│   │   │   └── community-initiative.md
│   │   └── sri-lanka/            # Domain II research content
│   │       ├── official-structure.md
│   │       └── shadow-education.md
│   │
│   ├── components/               # Reusable UI pieces
│   │   ├── layout/
│   │   │   ├── Header.astro      # Main navigation header
│   │   │   ├── Footer.astro      # Site footer
│   │   │   └── Layout.astro      # Base layout wrapper
│   │   ├── paradigm/
│   │   │   ├── ParadigmCard.svelte     # Card for each paradigm
│   │   │   ├── ParadigmCompare.svelte  # Side-by-side comparison
│   │   │   └── ParadigmTimeline.svelte # Historical timeline
│   │   ├── library/
│   │   │   ├── ContentCard.svelte      # Generic library card
│   │   │   ├── ThinkerProfile.svelte   # Thinker profile layout
│   │   │   └── SearchOverlay.svelte    # Search modal
│   │   ├── ui/
│   │   │   ├── Button.astro      # Button variants
│   │   │   ├── Card.astro        # Base card
│   │   │   ├── Tag.astro         # Content tags
│   │   │   └── ScrollIndicator.svelte  # Scroll progress
│   │   └── animation/
│   │       ├── FadeIn.svelte     # Scroll-triggered fade
│   │       ├── ParallaxSection.svelte  # Parallax wrapper
│   │       └── Particles.svelte  # Ambient particle system
│   │
│   ├── layouts/                  # Page-level layouts
│   │   ├── Base.astro            # Base layout (header + footer + styles)
│   │   ├── Article.astro         # For library content (generous reading layout)
│   │   └── Domain.astro          # For domain landing pages
│   │
│   ├── styles/
│   │   ├── global.css            # Global styles + CSS variables (from 02_DESIGN)
│   │   └── typography.css        # Font imports + type rules
│   │
│   └── utils/                    # Helper functions
│       ├── getContent.ts         # Reads and sorts markdown content
│       ├── formatDate.ts         # Date formatting
│       └── slugify.ts            # URL slug generation
│
├── public/                       # Static assets (served as-is)
│   ├── fonts/                    # Self-hosted fonts (if needed)
│   ├── images/                   # Static images
│   │   ├── logo.svg
│   │   └── og-image.png          # Open Graph image for sharing
│   └── favicon.ico
│
└── docs/                         # THIS constellation lives here too
    ├── 00_INDEX.md
    ├── 01_PHILOSOPHY.md
    ├── 02_DESIGN.md
    ├── 03_TECH.md
    ├── 04_Domain_I.md
    ├── 05_Domain_II.md
    ├── 06_Domain_III.md
    ├── 07_Domain_IV.md
    ├── 08_Domain_V.md
    ├── 09_Domain_VI.md
    └── 10_ROADMAP.md
```

---

## ASTRO CONFIG (Starting Point)

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import svelte from '@astrojs/svelte';

export default defineConfig({
  integrations: [
    tailwind(),
    svelte(),
  ],
  // Content collections for markdown
  // Markdown rendering
  markdown: {
    syntaxHighlight: 'shiki',
  },
});
```

---

## CONTENT COLLECTION SCHEMA

All markdown content is typed. This catches errors and makes AI generation consistent.

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const paradigmSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  domain: z.literal('paradigm'),
  order: z.number(),           // display order
  color: z.string(),           // accent color for this paradigm
  tags: z.array(z.string()),
  published: z.boolean(),
  date: z.coerce.date(),
});

const thinkerSchema = z.object({
  title: z.string(),           // Full name
  tagline: z.string(),         // One-line description
  domain: z.literal('thinker'),
  era: z.string(),             // "1921–2007" or "Contemporary"
  region: z.string(),          // Geographic origin
  keyWork: z.string(),         // Most important book/work
  tags: z.array(z.string()),
  published: z.boolean(),
  date: z.coerce.date(),
});

const guideSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  domain: z.literal('guide'),
  paradigm: z.string(),        // Which paradigm this relates to
  difficulty: z.enum(['introductory', 'intermediate', 'deep']),
  readTime: z.number(),        // minutes
  tags: z.array(z.string()),
  published: z.boolean(),
  date: z.coerce.date(),
});

const storySchema = z.object({
  title: z.string(),
  tagline: z.string(),
  domain: z.literal('story'),
  storyType: z.enum(['teacher', 'student', 'school', 'family', 'community']),
  location: z.string(),
  tags: z.array(z.string()),
  published: z.boolean(),
  date: z.coerce.date(),
});

const frameworkSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  domain: z.literal('framework'),
  author: z.string(),
  tags: z.array(z.string()),
  published: z.boolean(),
  date: z.coerce.date(),
});

export const collections = {
  paradigms: defineCollection({ schema: paradigmSchema }),
  thinkers: defineCollection({ schema: thinkerSchema }),
  guides:   defineCollection({ schema: guideSchema }),
  stories:  defineCollection({ schema: storySchema }),
  frameworks: defineCollection({ schema: frameworkSchema }),
};
```

---

## AI WORKFLOW: HOW TO BUILD WITH CURSOR

### The Loop

```
1. YOU decide what to build next (check 10_ROADMAP)
2. YOU gather the docs Cursor needs (see below)
3. YOU prompt Cursor with clear intent
4. CURSOR generates code
5. YOU test locally (npm run dev)
6. YOU show Claude if something feels off
7. CLAUDE helps debug or refine
8. YOU push to GitHub
9. CLOUDFLARE auto-deploys
10. REPEAT
```

### What To Feed Cursor (By Task)

**Building a page:**
```
Feed: 00_INDEX + 02_DESIGN + 03_TECH (file structure) + the specific Domain doc
Prompt: "Build the [Domain Name] landing page following the design system in 02_DESIGN. 
        Use the file structure in 03_TECH. Content is in src/content/[folder]/"
```

**Building a component:**
```
Feed: 02_DESIGN (CSS variables + component patterns)
Prompt: "Create a [ComponentName] Svelte component following edlove design system.
        CSS variables are defined in global.css. See component patterns in the design doc."
```

**Writing content (markdown):**
```
Feed: 01_PHILOSOPHY (for voice) + 02_DESIGN (voice section) + the specific Domain doc
Prompt: "Write a [content type] about [topic] in edlove voice. 
        Follow the frontmatter schema in 03_TECH. 
        Voice guidelines are in 02_DESIGN under 'Voice and Tone'."
```

**Fixing a bug:**
```
Feed: The specific file with the bug + 03_TECH (for context on stack)
Prompt: "This component has [describe bug]. Fix it. Don't change the design or behavior 
        of anything else."
```

### Cursor Prompt Template

Use this as a starting point for any Cursor session:

```
You are building edlove.org — an educational transformation ecosystem.
Design system: [paste relevant parts of 02_DESIGN]
Tech stack: Astro + Svelte + Tailwind + GSAP
The site must feel alive, warm, cinematic — not corporate or sterile.

Task: [describe what you need built]

Requirements:
- Follow the CSS variables and component patterns exactly
- Mobile responsive (check at 375px, 768px, 1200px)
- Accessible (semantic HTML, ARIA labels, keyboard navigable)
- Performance: No unnecessary JavaScript. Astro's zero-JS default where possible.
```

---

## DEPLOYMENT FLOW

### One-Time Setup
```
1. Create GitHub repository: github.com/neev/edlove (or similar)
2. Sign up at pages.cloudflare.com
3. Connect GitHub repo to Cloudflare Pages
4. Set build command: npm run build
5. Set output directory: dist
6. Point edlove.org domain to Cloudflare
7. Done — every git push auto-deploys
```

### Daily Development
```bash
# Start local server
npm run dev
# → Opens at http://localhost:4321

# See changes live as you edit files

# When happy:
git add .
git commit -m "describe what you built"
git push
# → Cloudflare deploys automatically within 30 seconds
```

### Environment Variables (if needed later)
```
# .env file (never committed to git)
CLAUDE_API_KEY=your_key_here
ALGOLIA_APP_ID=your_id_here
# etc.
```

---

## PERFORMANCE RULES

1. **No JavaScript by default.** Astro ships zero JS unless you explicitly use a Svelte/React component with `client:` directive. Most pages should be purely static HTML.

2. **Images are optimized.** Use Astro's built-in `<Image />` component. It auto-resizes, auto-formats (WebP), and lazy-loads.

3. **Fonts are self-hosted or loaded efficiently.** Use `font-display: swap`. Load only the weights you actually use.

4. **GSAP animations are lightweight.** Only load GSAP on pages that use scrollytelling. Don't import it globally.

5. **Content is statically generated.** All markdown renders at build time. No server-side rendering needed. Fast everywhere.

6. **Target Lighthouse score: 90+ across all categories.** Check with `npm run build` then test the dist folder.

---

## ACCESSIBILITY CHECKLIST

- [ ] All images have alt text
- [ ] Color is never the only way information is conveyed
- [ ] All interactive elements are keyboard navigable
- [ ] Focus states are visible (use Warm Gold outline)
- [ ] Heading hierarchy is logical (H1 → H2 → H3, never skipped)
- [ ] Semantic HTML elements used (nav, main, article, section, etc.)
- [ ] ARIA labels on icons and ambiguous elements
- [ ] Contrast ratios meet WCAG AA (4.5:1 normal text, 3:1 large)
- [ ] Text is resizable (no fixed pixel sizes that break at 200% zoom)
- [ ] Reading order matches visual order

---

## MOBILE TECHNICAL CONSIDERATIONS

### ClientRouter & Scripts
When using `<ClientRouter />`, standard scripts only run once on the initial page load. Interactive elements like the mobile menu MUST be initialized on every page transition.

**Pattern for interactive components:**
```javascript
document.addEventListener('astro:page-load', () => {
  // Initialize mobile menu, sliders, etc.
});
```

### Touch Interactivity
- **Avoid `:hover` for critical functionality**: Hover states don't exist on mobile. Use active states or clear visual cues.
- **FastClick**: Astro/Tailwind handle this well, but ensure no "ghost clicks" on mobile triggers.
- **Prevent Scroll Leak**: When the mobile menu is open, the body scroll should be disabled (`overflow: hidden`).

---

*"Build simply. Build well. Build for everyone."*

**Last Updated**: February 3, 2026  
**Status**: Active. Feed to Cursor for all technical work.

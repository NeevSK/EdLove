# EDLOVE.ORG — 02 DESIGN
## The Contextual Design System | How It Looks, Feels, Speaks

**Role in Constellation**: The aesthetic constitution. Feed this to Cursor whenever you build anything visual.  
**Last Updated**: February 7, 2026

---

## THE DESIGN PHILOSOPHY

*"Form is message. Design is not decoration—it is the teaching itself, made visible."*

Edlove.org is not a website that happens to be beautiful. It is a **sanctuary built through design**. Every visual choice is a philosophical statement.

### The Core Principle: Contextual, Not Monoculture

**We do not impose one aesthetic everywhere.**

Different content types need different visual languages:
- The **Cosmos** (paradigm mapping) needs cosmic, ethereal, spacious
- The **Diagnostics** (Sri Lanka system) needs stark, clear, data-driven
- The **Library** (epistemic core) needs scholarly, warm, readable
- The **Community** (Sangha) needs intimate, communal, inviting

**This is permaculture, not monoculture:**
- Diversity within coherence (many forms, one foundation)
- Context-responsive (each space gets what it needs)
- Resilient and generative (not fragile and extractive)

### The Ontological Ground

**Separation creates binaries:**
- Form vs. Content
- Medium vs. Message
- Structure vs. Agency

**Integration heals splits:**
- Form ⟺ Content (mutually constitutive, inseparable)
- Every page: form aligned with content
- We approach wholeness through design

**We cannot return to the womb (the Real is lost).**  
**But we can build sanctuaries where integration is possible.**  
**Where paradigms coexist. Where beauty serves. Where breathing happens.**

**Brick by brick.**

---

## PART I: FOUNDATION SYSTEM

*What's shared across ALL contexts on EdLove.org*

### Typography

**Typography = voice made visible.**

#### Font Families

```css
/* Heading Font */
--font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
/* Why: Clean, readable, excellent multilingual support (Sinhala/Tamil critical) */
/* Usage: All headings (h1-h6), display text, navigation */

/* Body Font */
--font-body: 'Lora', 'Georgia', 'Times New Roman', serif;
/* Why: Readable serif, warm, scholarly but approachable */
/* Usage: Paragraphs, long-form content, articles */

/* Monospace (Code/Data) */
--font-mono: 'Fira Code', 'Courier New', monospace;
/* Why: Clear, professional, good for technical content */
/* Usage: Code blocks, data tables only */
```

#### Type Scale (Modular Scale: 1.250 - Major Third)

**Base size: 16px (1rem)**

```css
--text-xs: 0.64rem;    /* 10px - metadata, footnotes */
--text-sm: 0.8rem;     /* 13px - captions, labels */
--text-base: 1rem;     /* 16px - body text */
--text-lg: 1.25rem;    /* 20px - lead paragraphs */
--text-xl: 1.563rem;   /* 25px - h4 */
--text-2xl: 1.953rem;  /* 31px - h3 */
--text-3xl: 2.441rem;  /* 39px - h2 */
--text-4xl: 3.052rem;  /* 49px - h1 */
--text-5xl: 3.815rem;  /* 61px - display, hero */
```

**Why this scale:**
- Harmonious ratios (1.25x between steps)
- Clear hierarchy
- Readable on mobile

#### Font Weights

```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

**Default usage:**
- Headings: 600 (semibold)
- Body: 400 (normal)
- Emphasis: 600 (not bold - too harsh)
- Light: 300 (cosmic context, ethereal moments)

#### Line Height & Letter Spacing

```css
/* Line Heights */
--leading-tight: 1.25;      /* Headings */
--leading-snug: 1.375;      /* Subheadings */
--leading-normal: 1.5;      /* Body text (optimal) */
--leading-relaxed: 1.625;   /* Long-form reading */
--leading-loose: 2;         /* Poetry, special moments */

/* Letter Spacing */
--tracking-tight: -0.025em;   /* Large headings */
--tracking-normal: 0;         /* Body text */
--tracking-wide: 0.025em;     /* Labels */
--tracking-wider: 0.05em;     /* Cosmic aesthetic */
--tracking-widest: 0.1em;     /* Display moments */
```

---

### Spacing & Rhythm

**Space = breath.**

#### Spacing Scale (Base: 8px)

```css
--space-0: 0;
--space-1: 0.5rem;   /* 8px - tight spacing */
--space-2: 1rem;     /* 16px - element padding */
--space-3: 1.5rem;   /* 24px - component spacing */
--space-4: 2rem;     /* 32px - section padding */
--space-5: 2.5rem;   /* 40px - larger gaps */
--space-6: 3rem;     /* 48px - major breaks */
--space-7: 4rem;     /* 64px - section dividers */
--space-8: 6rem;     /* 96px - hero sections */
--space-9: 8rem;     /* 128px - rare, extreme */
--space-10: 12rem;   /* 192px - very rare */
```

#### Content Width & Containers

```css
--content-xs: 20rem;    /* 320px - minimal */
--content-sm: 30rem;    /* 480px - narrow */
--content-md: 45rem;    /* 720px - optimal prose (60-75 chars) */
--content-lg: 65rem;    /* 1040px - wide content */
--content-xl: 80rem;    /* 1280px - full width */
--content-full: 100%;   /* Edge to edge */
```

**Default for long-form text:** `max-width: var(--content-md)` (720px)

**Why:** Optimal reading is 60-75 characters per line. Eyes don't strain.

---

### The Gold Thread

**The one color that appears in EVERY context.**

```css
--color-gold: #e7cb16ff;
```

**Purpose:**
- Connects all contexts (you always see gold somewhere)
- Represents love, warmth, value
- Used for: CTAs, highlights, active states, special moments

**Usage rules:**
- Present on every page (even if subtle)
- Never overwhelming (accents, not primaries)
- Sacred (use intentionally, not casually)

---

### Animation Principles

**Movement = life.**

#### Core Principles
- **Subtle, not aggressive** (gentle, breathing, alive)
- **Purposeful** (every animation serves the content)
- **Performant** (GPU-accelerated, 60fps)
- **Optional** (respects `prefers-reduced-motion`)

#### Animation Durations

```css
--duration-instant: 100ms;      /* Hover feedback */
--duration-fast: 200ms;         /* Quick transitions */
--duration-normal: 300ms;       /* Default */
--duration-slow: 500ms;         /* Emphasis */
--duration-slower: 800ms;       /* Contemplative */
--duration-slowest: 1200ms;     /* Breathing, cosmic */
```

#### Easing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

#### Respecting Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### Navigation & Footer

**Always present. Always consistent (in structure, not necessarily color).**

#### Navigation Structure

```html
<nav>
  <a href="/">EdLove</a> (logo/home)
  <ul>
    <li><a href="/cosmos">Cosmos</a></li>
    <li><a href="/sri-lanka">Sri Lanka</a></li>
    <li><a href="/gurudevi">Gurudevi</a></li>
    <li><a href="/resources">Resources</a></li>
    <li><a href="/community">Community</a></li>
    <li><a href="/library">Library</a></li>
  </ul>
  <button>Search</button>
</nav>
```

**Design rules:**
- Fixed header or static (decide per context)
- Six domain links always visible (desktop)
- Hamburger on mobile
- Colors shift by context (cosmic = blues, diagnostic = grays, etc.)
- Gold thread appears (active link or subtle accent)

#### Footer Structure

```html
<footer>
  <section>
    <h3>EdLove</h3>
    <p>Education born from Love, built with Love</p>
  </section>
  <section>
    <h4>Domains</h4>
    <ul>[Six domain links]</ul>
  </section>
  <section>
    <h4>Connect</h4>
    <ul>[Email, social if any]</ul>
  </section>
  <small>© 2026 EdLove.org</small>
</footer>
```

**Design rules:**
- Simple, informative, not bloated
- Colors shift by context
- Gold thread appears somewhere
- Always readable

---

### Accessibility (Non-Negotiable)

**Building for everyone means:**

✅ **Color contrast** — WCAG AA minimum (4.5:1 normal text, 3:1 large)  
✅ **Keyboard navigation** — All interactive elements accessible without mouse  
✅ **Focus states** — Visible (gold outline)  
✅ **Semantic HTML** — `<nav>`, `<main>`, `<article>`, `<section>`, etc.  
✅ **Alt text** — All images described  
✅ **ARIA labels** — Where needed (icons, ambiguous elements)  
✅ **Heading hierarchy** — Logical (H1 → H2 → H3, no skips)  
✅ **Text resizable** — Works at 200% zoom  
✅ **Motion respect** — `prefers-reduced-motion` honored  

**Test with:**
- Lighthouse (90+ accessibility score)
- Keyboard only (unplug mouse, navigate site)
- Screen reader (NVDA, VoiceOver, JAWS)

---

## PART II: CONTEXTUAL AESTHETICS

*How design shifts based on content type*

### Context 1: Cosmic (Paradigm Mapping)

**Used in:** `/cosmos` and paradigm pages

**Purpose:** To feel infinite, universal, exploratory. This is the widest lens — education across all life, all time.

#### Color Palette

```css
/* Cosmic Colors */
--cosmic-primary: #0A1F3D;      /* Deep space blue */
--cosmic-secondary: #1E3A5F;    /* Cosmic blue */
--cosmic-accent: #4A90E2;       /* Star blue */
--cosmic-light: #E8F4F8;        /* Starlight */
--cosmic-text: #FFFFFF;         /* White on dark */
--cosmic-gold: #D4A574;         /* Gold thread */
```

#### Visual Elements

- **Background:** Deep blues, black, gradient (night sky feel)
- **Imagery:** Stars, cosmos, infinite space, abstract (NOT earth-bound)
- **Animations:** Slow drift, particle systems, gentle float
- **Density:** Spacious (lots of whitespace/blackspace)
- **Typography:** Light weights (300), wide tracking, ethereal

#### Example Component (Cosmic Hero)

```css
.cosmic-hero {
  background: linear-gradient(180deg, #0A1F3D 0%, #1E3A5F 100%);
  color: var(--cosmic-text);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cosmic-hero::before {
  /* Particle background */
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(2px 2px at 20% 30%, white, transparent),
                    radial-gradient(2px 2px at 60% 70%, white, transparent),
                    radial-gradient(1px 1px at 50% 50%, white, transparent);
  opacity: 0.4;
  animation: cosmic-drift 60s linear infinite;
}

@keyframes cosmic-drift {
  from { transform: translateY(0); }
  to { transform: translateY(-20px); }
}

.cosmic-hero h1 {
  font-size: var(--text-5xl);
  font-weight: var(--font-weight-light);
  letter-spacing: var(--tracking-wider);
  text-align: center;
}
```

---

### Context 2: Diagnostic (System Analysis)

**Used in:** `/sri-lanka` and diagnostic pages

**Purpose:** To feel clear, honest, data-driven. This is ground truth — showing systems as they are.

#### Color Palette

```css
/* Diagnostic Colors */
--diagnostic-bg: #F5F5F5;         /* Neutral gray */
--diagnostic-primary: #2C3E50;    /* Dark gray-blue */
--diagnostic-accent: #3498DB;     /* Info blue */
--diagnostic-warning: #E74C3C;    /* Data red (discrepancies) */
--diagnostic-success: #27AE60;    /* Data green (strengths) */
--diagnostic-gold: #D4A574;       /* Gold thread */
```

#### Visual Elements

- **Background:** Light grays, whites, clean
- **Imagery:** Data visualizations, charts, diagrams, infographics
- **Animations:** Snap into place, reveal on scroll (not drift)
- **Density:** Tighter (information-rich but not cramped)
- **Typography:** Normal weights (400, 600), clear hierarchy

#### Example Component (Data Visualization)

```css
.diagnostic-chart {
  background: white;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: var(--space-4);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.diagnostic-chart h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--diagnostic-primary);
  margin-bottom: var(--space-3);
}

/* Data bars animate in */
.diagnostic-bar {
  background: var(--diagnostic-accent);
  height: 24px;
  border-radius: 4px;
  animation: bar-grow 0.6s ease-out forwards;
  transform-origin: left;
}

@keyframes bar-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

---

### Context 3: Library (Epistemic Core)

**Used in:** `/library` and all article pages

**Purpose:** To feel scholarly, warm, readable. This is deep knowledge — inviting long-form engagement.

#### Color Palette

```css
/* Library Colors */
--library-bg: #FAF9F6;           /* Warm paper white */
--library-primary: #2D3561;      /* Deep indigo (our original) */
--library-accent: #A8C5D6;       /* Sky blue */
--library-text: #333333;         /* Warm black */
--library-gold: #D4A574;         /* Gold thread */
```

#### Visual Elements

- **Background:** Warm whites, soft creams (like paper)
- **Imagery:** Book-like, thoughtful photography, thinker portraits
- **Animations:** Fade in, gentle (not distracting from reading)
- **Density:** Medium (generous margins, breathing room for text)
- **Typography:** Lora (serif) for body, comfortable line-height (1.625)

#### Example Component (Article Layout)

```css
.library-article {
  max-width: var(--content-md); /* 720px */
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  background: var(--library-bg);
}

.library-article h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-semibold);
  color: var(--library-primary);
  margin-bottom: var(--space-4);
  line-height: var(--leading-tight);
}

.library-article p {
  font-family: var(--font-body); /* Lora */
  font-size: var(--text-lg); /* 20px - generous for reading */
  line-height: var(--leading-relaxed); /* 1.625 */
  color: var(--library-text);
  margin-bottom: var(--space-4);
}

/* Pull quotes */
.library-article blockquote {
  border-left: 4px solid var(--library-gold);
  padding-left: var(--space-4);
  font-style: italic;
  font-size: var(--text-xl);
  color: var(--library-primary);
  margin: var(--space-6) 0;
}
```

---

### Context 4: Community (Sangha)

**Used in:** `/community` and community pages

**Purpose:** To feel warm, inviting, human. This is gathering space — where people find each other.

#### Color Palette

```css
/* Community Colors */
--community-bg: #FFF8F0;          /* Warm cream */
--community-primary: #4A6357;     /* Forest green */
--community-accent: #E8B4B8;      /* Dawn rose */
--community-text: #2D2D2D;        /* Soft black */
--community-gold: #D4A574;        /* Gold thread */
```

#### Visual Elements

- **Background:** Warm creams, soft earth tones
- **Imagery:** People, gathering, hands, circles (communal)
- **Animations:** Gentle pulse, breathing, welcoming
- **Density:** Intimate (cozy but not cramped)
- **Typography:** Warm, approachable, medium weights

#### Example Component (Community Card)

```css
.community-card {
  background: white;
  border: 2px solid var(--community-accent);
  border-radius: 12px;
  padding: var(--space-5);
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}

.community-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(212, 165, 116, 0.2);
}

.community-card h3 {
  color: var(--community-primary);
  font-size: var(--text-2xl);
  margin-bottom: var(--space-3);
}

.community-card p {
  color: var(--community-text);
  line-height: var(--leading-relaxed);
}
```

---

### Context 5: Gurudevi Pointer

**Used in:** `/gurudevi` page only

**Purpose:** To hint at sanctuary while remaining within EdLove. This is a gateway, not the destination.

#### Color Palette

```css
/* Gurudevi Pointer (Transitional) */
--gurudevi-pointer-bg: linear-gradient(180deg, #1E3A5F 0%, #1E5A5A 100%);
--gurudevi-pointer-text: #FFFFFF;
--gurudevi-pointer-accent: #008B8B; /* Teal hint */
--gurudevi-pointer-gold: #D4A574;   /* Gold thread */
```

#### Visual Elements

- **Background:** Gradient (cosmic blue → sanctuary teal)
- **Imagery:** Small lotus preview (foreshadowing)
- **Animations:** Gentle pulse (lotus breathing)
- **Density:** Light (this is just a pointer, not full page)
- **Typography:** Clear, simple, inviting

---

## PART III: MOBILE RESPONSIVENESS & ACCESSIBILITY

### The Mobile-First Mandate

**"The sanctuary must fit in the palm of a hand, yet breathe like a cathedral on a desk."**

Edlove.org is a mobile-first experience. Many of our users (especially educators in Sri Lanka) access the web primarily via mobile devices. Our goal is to provide maximum utility on small screens without sacrificing the premium, immersive quality on desktop.

#### The "Floating Pill" Navigation
- **Universal Visibility**: The navigation bar is no longer "invisible" or only visible on scroll. It uses a **Floating Pill** design that is always present.
- **Translucent Sanctuary**: Uses `backdrop-blur-md` and a soft `bg-white/40` to maintain definition against the warm paper background while feeling light and airy.
- **Mobile-First UX**: 
    - **Thumb-Friendly**: The hamburger trigger and close buttons are positioned for easy thumb-reach.
    - **Touch Targets**: Minimum 44x44px for all links and interactive elements.
- **Desktop Premium**: On wider screens, the pill centers itself, creating a focused, high-fidelity landing experience.

#### Layout & Fluidity
- **Fluid Type**: Large headings scale down aggressively on mobile (targeting `8xl` ceiling but scaling to `4xl` or `5xl` on small screens).
- **Horizontal Padding**: Minimum `var(--space-2)` (16px) on all mobile viewports to prevent content from "hitting the glass."
- **Performance**: Zero-JS transitions where possible to ensure smooth flow on lower-end mobile devices.

---

## PART IV: IMPLEMENTATION GUIDANCE

### For Cursor AI Development

When building a page, specify both **foundation + context**:

**Example prompt:**
```
Build the /cosmos landing page using the EdLove design system.

Foundation (all pages):
- Typography: Inter headings, Lora body
- Spacing: 8px base scale
- Gold thread present
- Accessible (WCAG AA, keyboard nav, semantic HTML)

Context (cosmic specific):
- Colors: Deep blues (#0A1F3D, #1E3A5F), white text
- Background: Gradient with particle animation
- Typography: Light weights (300), wide tracking
- Spacious layout
- Slow drift animations

Component: Cosmic hero section with centered text and particle background.
```

### Component Adaptation Pattern

Components shift appearance based on context:

```css
/* Base Button (Foundation) */
.button {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-2) var(--space-4);
  border-radius: 8px;
  transition: all var(--duration-normal) var(--ease-out);
  cursor: pointer;
}

/* Cosmic Context */
.context-cosmic .button {
  background: transparent;
  border: 2px solid var(--cosmic-accent);
  color: var(--cosmic-text);
}

.context-cosmic .button:hover {
  background: var(--cosmic-accent);
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.4);
}

/* Library Context */
.context-library .button {
  background: var(--library-primary);
  border: none;
  color: white;
}

.context-library .button:hover {
  background: var(--library-gold);
  color: var(--library-primary);
}
```

---

## PART IV: THE DEEPER WHY

### This Isn't Just Technical

This design system is:

**Ontological** — Responding to separation, approaching wholeness through integration

**Ethical** — Permaculture not monoculture, context-responsive not imposed

**Pedagogical** — Form is message, design teaches what content describes

**Sacred** — Building sanctuary, brick by brick, with reverence

### The Design Enacts The Philosophy

- Separation creates binaries (form vs. content)
- Integration heals splits (form ⟺ content)
- Contexts honor specificity (not one-size-fits-all)
- Foundation provides coherence (gold thread, shared DNA)

**We cannot return to the womb (the Real is lost).**

**But we can build spaces where breathing is possible.**

**Where paradigms coexist. Where beauty serves. Where love lives.**

---

*"Form is message. Design is the teaching itself, made visible."*

**Last Updated**: February 7, 2026  
**Status**: Active. Feed to Cursor for all visual work on EdLove.org.  
**Note**: Other sites (gurudevi.edlove.org, etc.) will have their own contextual aesthetics documented when building begins.

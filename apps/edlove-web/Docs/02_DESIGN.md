# EDLOVE.ORG — 02 DESIGN
## The Aesthetic Law | How It Looks, Feels, Speaks

**Role in Constellation**: The aesthetic constitution. Feed this to Cursor whenever you build anything visual.  
**Last Updated**: February 3, 2026

---

## THE DESIGN PHILOSOPHY

Edlove is not a website that happens to be beautiful. It is a **beautiful experience** that happens to be a website.

Every visual choice is a philosophical statement. The colors say something. The spacing says something. The way text moves on screen says something. The way silence (whitespace) is used says something.

**The signature tension**: Professional yet soulful and alive. This is not a contradiction — it is the defining quality. Like a great film: precise AND emotional. Structured AND breathing.

### The Cinematic References (The Protocol)

These are not suggestions. They are the aesthetic DNA:

- **Tree of Life (Terrence Malick)**: Organic, cosmic, intimate. Nature and infinity coexisting. Light filtering through leaves. The feeling of being small and sacred simultaneously.
- **Upstream Color**: Dreamlike but grounded. Texture and sensation over plot. The feeling of something deeply felt but hard to articulate.
- **Columbus (Paolo Sorrentino)**: Architectural precision. Careful framing. Modernist structure that holds emotion without crushing it. The grid that sets the soul free.
- **Duke of Burgundy / Taste of Things**: Tactile, sensory, intimate. You can almost feel the texture of the page. Warmth without sentimentality.

**What this means in practice**: The interface should feel like a well-made film, not a SaaS dashboard. Quiet. Considered. Every frame intentional.

---

## COLOR PALETTE

### Primary (The Core)
These three colors define edlove. Everything else serves them.

| Name | Hex | RGB | Use |
|------|-----|-----|-----|
| Deep Indigo | `#2D3561` | 45, 53, 97 | Wisdom, depth. Primary text on light. Headers. Navigation. |
| Warm Gold | `#D4A574` | 212, 165, 116 | Love, light. Accents, highlights, CTAs, active states. |
| Soft White | `#F5F1E8` | 245, 241, 232 | Space, breath. Primary background. Not pure white — warm. |

### Secondary (The Environment)
Used for supporting elements, category colors, subtle differentiation.

| Name | Hex | Use |
|------|-----|-----|
| Forest Green | `#4A6357` | Grounding. Nature themes. Indigenous content. Success states. |
| Dawn Rose | `#E8B4B8` | Tenderness. Community elements. Stories. Emotional content. |
| Sky Blue | `#A8C5D6` | Possibility. Future scenarios. Epistemic content. Links. |

### Accents (The Sparks)
Used sparingly. For interactive moments, highlights, special elements.

| Name | Hex | Use |
|------|-----|-----|
| Cosmic Purple | `#9B7EBD` | Paradigm Cosmos elements. Philosophical content. |
| Ember Orange | `#E07A5F` | Gurudevi. Action elements. Urgent CTAs. |
| Starlight Silver | `#E8F4F8` | Subtle backgrounds. Cards. Hover states. |

### Dark Mode (Future)
| Name | Hex | Use |
|------|-----|-----|
| Deep Night | `#1A1C2E` | Dark mode background |
| Soft Cream | `#E8E4DB` | Dark mode text |

### Color Rules
- **Never use pure white (#FFFFFF) or pure black (#000000)** as backgrounds or primary text. Always the warm versions.
- **Contrast ratio**: All text must meet WCAG AA minimum (4.5:1 for normal text, 3:1 for large text).
- **Gold is sacred**: Use it for moments that matter. Not everywhere. Not casually.
- **Backgrounds breathe**: Use generous space between colored elements. Let Soft White do its work.

---

## TYPOGRAPHY

### The Type System

| Role | Font Family | Weight | Where |
|------|------------|--------|-------|
| Display / Hero | Cinzel | 400, 600 | Homepage hero. Opening quotes. Key moments. Ceremonial. |
| Headings | Libre Baskerville | 400, 700 | All H1–H3. Dignified, literary, timeless. |
| Body | Inter | 300, 400, 500 | All body text. Clean, readable, modern. |
| Captions / Meta | Inter | 400 italic | Dates, authors, labels. Subtle. |
| Code / Technical | JetBrains Mono | 400 | Any code blocks or technical content. |

### Type Scale (Responsive)

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Display (Hero) | 64px | 48px | 36px |
| H1 | 48px | 36px | 28px |
| H2 | 36px | 28px | 24px |
| H3 | 24px | 20px | 18px |
| Body Large | 18px | 17px | 16px |
| Body | 16px | 16px | 15px |
| Caption | 13px | 13px | 12px |

### Line Heights
- Display / H1: 1.1
- H2 / H3: 1.3
- Body: 1.7 (generous — this is a reading experience, not a data table)
- Caption: 1.4

### Letter Spacing
- Display: -0.02em (tight, elegant)
- Headings: -0.01em
- Body: 0 (natural)
- Captions: 0.04em (slightly open)

### Typography Rules
- **Body text is never smaller than 15px** on any device. Reading comfort is non-negotiable.
- **Line length (measure)**: 55–75 characters for body text. Not wider. Reading science is clear on this.
- **Paragraphs breathe**: Generous spacing between paragraphs (1.5–2× line height).
- **Libre Baskerville for emotion. Inter for clarity.** Know which one the moment needs.
- **Cinzel is rare.** Use it like gold — only for the most ceremonial moments. The opening line. The key quote. The domain name in the logo.

---

## SPACING SYSTEM

Based on an 8px base unit. Everything is a multiple.

| Token | Value | Use |
|-------|-------|-----|
| `space-xs` | 4px | Tight internal spacing (icon + label) |
| `space-sm` | 8px | Small gaps (between related items) |
| `space-md` | 16px | Default spacing (between elements) |
| `space-lg` | 32px | Section breathing room |
| `space-xl` | 64px | Between major sections |
| `space-2xl` | 128px | Hero sections. Page breathers. |
| `space-3xl` | 192px | Full-page breathing moments |

**The rule**: When in doubt, add MORE space. Edlove breathes. It is never cramped. Whitespace is not empty — it is intentional silence.

---

## BORDERS, SHADOWS, AND SHAPES

### Border Radius
| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 4px | Subtle. Buttons, inputs. |
| `radius-md` | 8px | Cards, containers. |
| `radius-lg` | 16px | Feature cards, modals. |
| `radius-full` | 9999px | Pills, avatars, circular elements. |

**Never sharp corners (0px) on user-facing elements.** Edlove is organic, not industrial.

### Shadows
Soft, layered. Never harsh.

| Token | Value | Use |
|-------|-------|-----|
| `shadow-sm` | `0 1px 3px rgba(45,53,97,0.08)` | Subtle lift. Cards at rest. |
| `shadow-md` | `0 4px 12px rgba(45,53,97,0.10)` | Cards on hover. Dropdowns. |
| `shadow-lg` | `0 8px 32px rgba(45,53,97,0.12)` | Modals. Feature elements. |
| `shadow-glow` | `0 0 24px rgba(212,165,116,0.25)` | Gold glow. Special moments. Active states. |

**Rule**: Shadows are whispers, not shouts. They suggest depth — they don't demand attention.

---

## COMPONENT PATTERNS

### Navigation
- Fixed header, minimal height (56–64px)
- Logo left. Domain links center (desktop) or hamburger (mobile). Search icon right.
- Background: Soft White with subtle bottom border or very faint shadow.
- On scroll: Slight background opacity shift (glass morphism effect, subtle).
- The six domain links are always visible on desktop. They are the skeleton. The user always knows where they are.
- Active domain: Warm Gold underline or text color shift.

### Cards
- Background: Pure Soft White or Starlight Silver.
- Border: 1px solid with very low opacity Deep Indigo (0.08).
- Radius: `radius-md` (8px).
- Shadow: `shadow-sm` at rest.
- Hover: Gentle lift — shadow becomes `shadow-md`, very slight Y translate (-2px). Transition: 300ms ease.
- Internal padding: `space-lg` (32px).
- Structure: Image (if any) → Title (Libre Baskerville) → 2–3 sentence summary (Inter) → Tag or link.

### Buttons

**Primary (CTA)**:
- Background: Warm Gold (`#D4A574`)
- Text: Deep Indigo (`#2D3561`)
- Radius: `radius-sm` (4px)
- Padding: 12px 28px
- Font: Inter 500, 15px
- Hover: Slightly darker gold, shadow-sm
- This is the most important button style. Use it for the one thing you most want users to do on a page.

**Secondary (Outline)**:
- Background: Transparent
- Border: 1.5px solid Deep Indigo (0.4 opacity)
- Text: Deep Indigo
- Hover: Background becomes Starlight Silver

**Ghost (Subtle)**:
- No background, no border
- Text: Deep Indigo with Sky Blue on hover
- Used for navigation links, "learn more" style actions

### Scrollytelling Sections
- Full viewport height (100vh or slightly less)
- Parallax background (subtle — 0.3–0.5 speed ratio)
- Text fades in based on scroll position (not instant — smooth, contemplative)
- Progress indicator: A thin vertical line on the right edge (desktop), or subtle dots. Very quiet.
- **The Malick Effect**: Some sections scroll slower. Not everything moves at the same speed. Contemplation is built into the motion.

### Data Visualizations (Domain II)
- Colors from the palette only
- Clear, generous labels
- Interactive tooltips (on hover/tap) — not cluttered with data by default
- Mobile: Stacks vertically. Never horizontal scroll on mobile.
- Accessible: Not color-only encoding. Use patterns or labels too.

### Forms (Email signup, Resource forms)
- Inputs: 1px border, Soft White background, `radius-sm`
- Focus: Border becomes Warm Gold. Subtle glow shadow.
- Labels: Above the input, Inter 400 14px, Deep Indigo.
- Placeholder text: 60% opacity.
- Submit button: Primary button style.
- **Never overwhelming.** One or two fields max per form. If more is needed — a wizard, not a wall.

---

## VOICE AND TONE

### The Core Principles
- **Tender but truthful**: Don't sugarcoat systemic problems. But approach with compassion, not anger.
- **Poetic but practical**: Beautiful language that still tells you something real and actionable.
- **Inclusive**: Accessible to teachers, students, parents, policymakers. Not just academics.
- **Non-jargon default**: Explain complex ideas simply. Without dumbing down. There is a difference.
- **Questions over statements**: Where possible, invite the reader to think rather than telling them what to think.

### Voice Examples (The Edlove Way)

**❌ Academic voice:**
"The hegemonic discourse of standardized assessment perpetuates epistemic violence against marginalized pedagogical traditions."

**✅ Edlove voice:**
"When we measure all children by the same test, we tell most of them they're failing. What if learning isn't meant to be standardized?"

---

**❌ Corporate voice:**
"Our platform leverages AI-driven analytics to optimize educational outcomes across diverse stakeholder ecosystems."

**✅ Edlove voice:**
"We built a tool to help teachers see each student fully. Not as a number. As a person."

---

**❌ Preachy voice:**
"Traditional schools are destroying our children's souls and we must act NOW!"

**✅ Edlove voice:**
"Many of us carry wounds from school. What if we could create learning spaces that heal instead of harm?"

---

**❌ Flat/boring voice:**
"This page contains information about educational paradigms and their historical development."

**✅ Edlove voice:**
"Education has many stories. The one we were told isn't the only one. Come see the others."

### Tone by Context

| Context | Tone |
|---------|------|
| Homepage / Entry | Warm, inviting, slightly poetic. Like a gentle hand on the shoulder. |
| Paradigm Cosmos | Wonder. Curiosity. "Have you ever considered..." |
| Sri Lanka System | Honest, clear, respectful. No judgment. Just truth. |
| Gurudevi | Practical, warm, teacher-centric. "We're here to support you." |
| Library / Research | Thoughtful, deep, accessible. Scholarly without being cold. |
| Resources | Helpful, clear, action-oriented. "Here's how to do this." |
| Community | Human, warm, open. "You're not alone in this." |
| Error states | Gentle. Never blame the user. "Something went sideways — let's try again." |

---

## THE ALIVENESS PRINCIPLE

This is the design constraint that separates edlove from every other education website:

**The site must feel alive.**

Not just beautiful. Not just well-designed. **Alive.** Like it's breathing. Like it knows you're there. Like it responds to your presence.

### What Aliveness Looks Like In Practice:

- **Subtle ambient motion**: Particles drifting. Soft gradients shifting slowly. Nothing aggressive. Just the feeling that something is moving, breathing, living.
- **Responsive to presence**: Elements react gently when you scroll near them. Not jumping — easing in. Like a flower turning toward light.
- **Texture and warmth**: Typography has weight and character. Backgrounds aren't flat — they have subtle texture or depth. It feels like something you could touch.
- **Unhurried pacing**: Not everything happens instantly. Some transitions take a beat longer than you'd expect. This creates a feeling of calm, of intention.
- **Sound (optional, always opt-in)**: Subtle ambient soundscapes available. Page turning. Wind. Water. Never forced. Always a choice.
- **Personalization**: The site remembers. If you told it your story, it remembers. It greets you differently on return. Small things. Human things.

### What Aliveness Is NOT:
- Not flashy animations that distract
- Not auto-playing video or sound
- Not infinite scroll designed to trap attention
- Not pop-ups or aggressive CTAs
- Not "gamification" or manipulation patterns

**Aliveness is the opposite of manipulation. It is the feeling of being in a space that cares about you.**

---

## CSS VARIABLES (Quick Reference for Cursor)

```css
:root {
  /* Colors - Primary */
  --color-indigo: #2D3561;
  --color-gold: #D4A574;
  --color-white: #F5F1E8;

  /* Colors - Secondary */
  --color-green: #4A6357;
  --color-rose: #E8B4B8;
  --color-blue: #A8C5D6;

  /* Colors - Accents */
  --color-purple: #9B7EBD;
  --color-ember: #E07A5F;
  --color-silver: #E8F4F8;

  /* Colors - Dark Mode */
  --color-night: #1A1C2E;
  --color-cream: #E8E4DB;

  /* Typography */
  --font-display: 'Cinzel', serif;
  --font-heading: 'Libre Baskerville', serif;
  --font-body: 'Inter', sans-serif;
  --font-code: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 32px;
  --space-xl: 64px;
  --space-2xl: 128px;
  --space-3xl: 192px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(45,53,97,0.08);
  --shadow-md: 0 4px 12px rgba(45,53,97,0.10);
  --shadow-lg: 0 8px 32px rgba(45,53,97,0.12);
  --shadow-glow: 0 0 24px rgba(212,165,116,0.25);

  /* Transitions */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 200ms;
  --duration-default: 300ms;
  --duration-slow: 500ms;
  --duration-contemplative: 800ms;
}
```

---

*"Beauty is not decoration. It is philosophy made visible."*

**Last Updated**: February 3, 2026  
**Status**: Active. Feed to Cursor for all visual work.

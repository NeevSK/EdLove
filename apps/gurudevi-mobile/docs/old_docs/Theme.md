---
title: "- Gurudevi"
status: "active"
created: 2026-02-28
updated: 2026-07-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.


#  - Gurudevi

### idea
use gthis as sample idea for theme implmentation. dont use as it is but explore analyze compare what fits and not then carefully implement


### Purpose & Content

**Where used:**

* `gurudevi- The mobile app` 


**Content type:**

* **Deep Focus:** Study tools, past papers, flashcards.
* **High Utility:** Dashboards, progress trackers, schedulers.
* **Sanctuary:** A place of calm mastery, not stressful drilling.

**The Aesthetic:** **"The Glass Sanctuary"**

* **Dark Mode (Moonlight):** Bioluminescent, deep ocean, floating glass.
* **Light Mode (Sunlight):** Porcelain, frosted ice, crisp swiss typography.
* **The Feeling:** "High-Value Calm." It lowers your heart rate.

---

### 1. The "Silk & Sleek" Color System

This context introduces a **Dual-Physics System**. Light and Dark modes are not just color swaps; they are different *materials*.

```css
/* SHARED TOKENS (The Soul) */
:root {
  --gurudevi-gold: #D4AF37;       /* The Master Thread */
  --gurudevi-blue: #3B82F6;       /* Electric Cyber Blue (Focus) */
  --gurudevi-violet: #8B5CF6;     /* Deep Insight (Wisdom) */
}

/* 🌙 DARK MODE: "Bioluminescence" */
.context-gurudevi-dark {
  /* Background: Deep Void with Noise */
  --bg-layer-1: #020617;          /* Midnight */
  --bg-layer-2: #0F172A;          /* Deep Navy */
  --bg-texture: url('/assets/noise-subtle.png'); /* 3% opacity grain */

  /* Glass Material */
  --glass-surface: rgba(15, 23, 42, 0.6);
  --glass-border: rgba(255, 255, 255, 0.1); /* The "Edge Light" */
  --glass-highlight: rgba(255, 255, 255, 0.05);

  /* Text */
  --text-primary: #F8FAFC;        /* Porcelain White */
  --text-secondary: #94A3B8;      /* Starlight Grey */

  /* The "Glow" (Shadows act as lights) */
  --shadow-ambient: 0 0 40px -10px rgba(59, 130, 246, 0.15); /* Blue ambience */
  --shadow-focus: 0 0 20px rgba(59, 130, 246, 0.4); /* Active glow */
}

/* ☀️ LIGHT MODE: "Porcelain & Ice" */
.context-gurudevi-light {
  /* Background: Crisp Atmosphere */
  --bg-layer-1: #F8FAFC;          /* Porcelain */
  --bg-layer-2: #F1F5F9;          /* Ice White */
  --bg-texture: none;             /* Clean, no grain needed */

  /* Glass Material */
  --glass-surface: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.6); /* Crisp reflection */
  --glass-highlight: rgba(255, 255, 255, 0.4);

  /* Text */
  --text-primary: #0F172A;        /* Deep Navy Ink */
  --text-secondary: #64748B;      /* Slate */

  /* The "Air" (Shadows are colored, not black) */
  --shadow-ambient: 0 10px 30px -10px rgba(148, 163, 184, 0.3); /* Cool Grey */
  --shadow-focus: 0 10px 40px -10px rgba(59, 130, 246, 0.25); /* Blue Lift */
}

```

---

### 2. The Material Physics (CSS Implementation)

**The "Gurudevi Card" (The Core Component)**
This is how you tell the AI to build the "Glass" effect.

```css
.gurudevi-card {
  /* 1. The Structure */
  border-radius: 24px; /* "Super-ellipse" feel */
  padding: var(--space-6);
  
  /* 2. The Glass Physics */
  background: var(--glass-surface);
  backdrop-filter: blur(20px) saturate(180%); /* The "Frosted" Magic */
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  
  /* 3. The Edge Light (Crucial for 3D feel) */
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-ambient);
  
  /* 4. Interaction (Silk Movement) */
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.gurudevi-card:hover {
  transform: translateY(-4px); /* Lift */
  box-shadow: var(--shadow-focus); /* Glow/Color intensifies */
  border-color: var(--gurudevi-blue); /* Edge lights up */
}

```

---

### 3. Swiss Typography Overrides

Gurudevi is an *academic* tool. It needs the "University" feel of Swiss design.

```css
.context-gurudevi {
  /* Headers: Tight, Bold, massive x-height */
  --font-heading: 'Inter', sans-serif;
  --tracking-tight: -0.04em; /* Tighter than standard */
  --font-weight-display: 800; /* Extra Bold */
}

/* The "GURUDEVI" Branding Header */
.gurudevi-display-text {
  font-family: var(--font-heading);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 0.9; /* Extremely tight vertical rhythm */
  text-transform: uppercase;
  
  /* The "Ink" Gradient (Subtle sheen) */
  background: linear-gradient(to bottom right, var(--text-primary), var(--text-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

```

---

### 4. AI Prompt: How to Build This

**Copy-paste this block to your AI Coder (Cursor/ChatGPT) to implement the theme:**

> "I need you to implement the 'Gurudevi Context' for my app using the design tokens provided above.
> **Implementation Rules:**
> 1. **Dual-Mode Physics:** Check the system theme. If Dark, use the 'Bioluminescent' tokens (glows, dark glass). If Light, use the 'Porcelain' tokens (colored shadows, white glass).
> 2. **The Glass Effect:** Every card component (`<SanctuaryCard />`) must use the `backdrop-filter: blur(20px)` property. In React Native, use `<BlurView intensity={20}>`.
> 3. **Swiss Layouts:** Use CSS Grid. Keep headers massive (Inter, Weight 800, Tracking -0.04em). Align everything strictly to the left grid.
> 4. **No Dead Black:** Never use `#000000`. Use the `voidIndigo` variables.
> 5. **No Dead Grey Shadows:** In Light mode, shadows must be tinted Blue/Grey (`rgba(59, 130, 246, 0.15)`), never pure black."
> 
> 

---


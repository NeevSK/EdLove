# 🚀 CONTENT EXECUTION - IMMEDIATE ACTION PLAN
## NeevSK Web Content Implementation
**Start Date**: 2026-02-14 | **Priority**: Content First | **Approach**: Surgical, Keep Design Intact

---

## ✅ YOUR DIRECTIVES (Confirmed)

1. **Home Bio Update**:
   - Remove: "Pannala Sri Lanka" (geographic)
   - Add: "a human being", "an INFJ 4W5", "Navigating the Life"
   - Keep: Name, INFJ reference, emotional connection

2. **Cursor Design**:
   - Find suitable icon/shape (not circle)
   - Add glow effect
   - Align with vibe
   - Options: crosshair, pointer with glow, custom icon

3. **Timeline**:
   - Animated path (forest/road/water metaphor)
   - Visual, not just text
   - Personal page centerpiece

4. **Docs Available**:
   - ✅ `personal-section-content.md` (ready)
   - ✅ `phylosophical-lineage` (massive, comprehensive)
   - ✅ Content architecture docs (01-06 theme files)

5. **Logos**:
   - Add social platform logos/icons
   - Professional appearance

---

## 🎯 EXECUTION PHASES (Immediate Start)

### PHASE 1: Home Page Update (30 minutes)
**What**: Update hero section with new bio

**Files**:
- `src/components/sections/HeroHome.astro`

**Changes**:
```
OLD:
- Title: "Neev SK"
- Subtitle: "Existential Cyberneticist"
- Text: "Building the soul behind the machines"

NEW:
- Title: "NeevSK" (rename everywhere)
- Subtitle: "a human being | an INFJ 4W5 | Navigating the Life"
- Intro paragraph: Warm welcome message
- Keep: All animations, glows, colors, effects
```

**Keep Design**: ✅ Aurora background, ✅ Floating shapes, ✅ Scroll indicator, ✅ Button styles

---

### PHASE 2: Cursor Redesign (20 minutes)
**What**: Replace circle with better shape + glow

**Current Code**: `src/styles/cursor.scss`

**Options to Explore**:
1. **Crosshair** - Professional, clean, aligns with vibe
2. **Pointer with Glow** - Glowing arrow/hand (shows interactivity)
3. **Custom Icon** - Something unique to your brand
4. **Minimalist Dot with Ring** - Circle but with outer ring for alignment

**Implementation**:
- Better center alignment (SVG path or emoji)
- Add glow: `box-shadow: 0 0 10px rgba(var(--accent-teal-rgb), 0.8)`
- Add inner + outer elements for visual interest
- Expand on hover: 24px → 48px

**Keep Design**: ✅ Smooth follow, ✅ Expand on interactive, ✅ Desktop only

---

### PHASE 3: Facets Section (30 minutes)
**What**: Rename "Five Doors" → Better terminology

**Files**:
- `src/components/sections/FiveDoors.astro`

**Changes**:
```
OLD:
- Section title: "Choose Your Path"
- Card structure: doors with mystical names

NEW:
- Section title: "Facets of My Life" or "Who I Am, Unfolded"
- Card titles (keep icons, colors, links):
  1. 🔥 Personal → "Warmth" (same)
  2. 🧠 Intellectual → "Systems" (same)
  3. ⚡ Professional → "Build" (same)
  4. 📚 Library → "Archive" (same)
  5. ✨ Connect → "Signal" (same)
```

**Keep Design**: ✅ 3D cards, ✅ Color glows, ✅ Hover effects, ✅ Gradient backgrounds, ✅ All animations

---

### PHASE 4: "Now" Section Enhancement (20 minutes)
**What**: Make current focus alive and present

**Files**:
- May need new component or update existing section

**Content**:
```
Current: Business Analytics @ University of Moratuwa (2023-present)
         Building Gurudevi
         Thinking about: Physics of life, Material conditions of systems

NEW (Make it PRESENT & ALIVE):
Title: "Where I Am Now"

Section 1: Current Year (2025)
- Highlight "2025" visually
- 3rd year @ University of Moratuwa
- Business Analytics with ERP minor
- CGPA 3.3 (don't overemphasize)

Section 2: What I'm Building
- Gurudevi (teacher wellbeing)
- EdLove ecosystem
- Intuitui Labs

Section 3: What I'm Thinking About
- Physics of life
- Material conditions of systems
- How do we design systems that breathe?

Visual Treatment:
- Add icons or small graphics
- Use vivid colors (teal, purple, emerald)
- Animate on scroll
- Feel: Present, active, generative
```

**Keep Design**: ✅ Animations, ✅ Colors, ✅ Typography

---

### PHASE 5: Cursor Implementation (15 minutes)
**Implementation Code**:

```scss
// New cursor design option (crosshair + glow)
.custom-cursor {
  position: fixed;
  width: 24px;
  height: 24px;
  pointer-events: none;
  z-index: 10000;
  mix-blend-mode: screen;
  filter: drop-shadow(0 0 8px rgba(var(--accent-teal-rgb), 0.6));

  .cursor-inner {
    width: 100%;
    height: 100%;
    border: 2px solid var(--accent-teal);
    border-radius: 50%;
    box-shadow: inset 0 0 8px rgba(var(--accent-teal-rgb), 0.3);

    // Add crosshair effect
    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      background: var(--accent-teal);
      top: 50%;
      left: 0;
      opacity: 0.5;
    }

    &::after {
      content: '';
      position: absolute;
      width: 2px;
      height: 100%;
      background: var(--accent-teal);
      left: 50%;
      top: 0;
      opacity: 0.5;
    }
  }

  &.expanded {
    width: 48px;
    height: 48px;

    .cursor-inner {
      background: rgba(var(--accent-teal-rgb), 0.15);
      border-color: var(--accent-teal);
      box-shadow: 0 0 20px rgba(var(--accent-teal-rgb), 0.8);
    }
  }
}
```

---

### PHASE 6: Footer Enhancement (20 minutes)
**What**: Make links feel "openable"

**Files**:
- `src/components/common/Footer.astro`

**Effects to Add**:
```scss
// Link hover animations
a.footer-link {
  position: relative;
  transition: all 0.3s var(--ease-smooth);

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent-teal), var(--accent-emerald));
    transition: width 0.4s var(--ease-smooth);
  }

  &:hover {
    color: var(--accent-teal);
    transform: translateY(-2px);
    text-shadow: 0 0 12px rgba(var(--accent-teal-rgb), 0.3);

    &::after {
      width: 100%;
    }
  }
}
```

**Add Scroll to Top**:
```astro
<button class="scroll-to-top" id="scrollTop" aria-label="Scroll to top">
  <svg><!-- Up arrow --></svg>
</button>
```

---

## 📅 PERSONAL PAGE STRUCTURE (When Ready)

**Top to Bottom**:

1. **Who I Am** (Hero section)
   - Use `personal-section-content.md` (Version 1 or 2)
   - Warm, vulnerable, story-based
   - ~400-500 words
   - Visual: Subtle background, generous spacing

2. **Life Timeline** (Visual centerpiece)
   - Age 10 → Library card
   - Age 11 → Nalanda College
   - Age 18-20 → COVID films
   - Age 20 → Axcer Innovations
   - Age 21 → University
   - Age 22 → VP Student Union
   - Age 23 → Building Gurudevi (NOW)

   **Visual Options**:
   - Animated path (road through forest)
   - Flowing water (metaphor for life flow)
   - Tree branches (growth)
   - Choose based on vibe preference

3. **Lineage Section** (Lower)
   - Use `phylosophical-lineage` file
   - Organized by branches (psychoanalytic, systems, Buddhist, etc.)
   - Accessible summary format
   - Visual: Clean, organized, readable

4. **Artistic Elements**
   - Animated leaves (floating gently)
   - Branches (connecting ideas)
   - Water (flowing, organic)
   - Keep subtle (don't overwhelm)

---

## 🧠 INTELLECTUAL PAGE STRUCTURE (Roadmap)

**Sections**:
1. **Existential Cyberneticist** (moved from home)
2. **Domains of Inquiry** (8 domains, organized)
3. **Intellectual Lineage** (from philosophical-lineage.md)
4. **Own Thoughts** (5 core quotes/ideas)
5. **Frameworks** (4 theories you've developed)

**UI Treatment**:
- Eccentric + powerful
- Typography emphasis
- Color-coded domains
- Deep, sophisticated feel

---

## 💼 PROFESSIONAL PAGE (Template)

**Sections**:
1. **Projects** (cards with descriptions)
   - Gurudevi
   - EdLove
   - Intuitui Labs

2. **Experience** (timeline or cards)
   - Management Intern (Axcer, 2022-2023)
   - VP Students Union (2025-2026)
   - Founder (EdLove, 2023-2025)
   - Founder (Intuitui Labs, 2025-2026)

3. **Education** (with logos)
   - BBsc Business Analytics (2023-2027)
   - Nalanda College (2013-2021)
   - Pannala National School (2008-2012)

---

## 🔗 CONNECT PAGE (Contact)

**Platforms** (with logos):
1. WhatsApp - green icon
2. Email - envelope icon
3. LinkedIn - blue icon
4. GitHub - dark icon
5. Discord - purple icon
6. Telegram - light blue icon
7. Bluesky - sky blue icon
8. X (Twitter) - black icon

**Layout**: Grid of cards with hover effects (you already have these!)

---

## 🔄 GIT WORKFLOW

```bash
# Create new branch
git checkout -b feat/content-implementation-phase-1

# After each phase, commit
git add [files]
git commit -m "feat: [Phase N] description"
git push -u origin feat/content-implementation-phase-1

# When ready, create PR
gh pr create --title "Content Implementation" --body "..."
```

---

## 🎨 DESIGN INTEGRITY CHECKLIST

✅ Keep all existing animations
✅ Keep vivid color palette
✅ Keep premium effects (glass, shadows, 3D)
✅ Keep button styles and interactions
✅ Keep card designs and hover states
✅ Keep layout structure
✅ Keep navigation design
✅ Only change: Text content, cursor design, add new sections

---

## ⚠️ CRITICAL NOTES

1. **Rename Everywhere**: "Neev SK" → "NeevSK"
   - Check: navigation, footer, metadata, titles

2. **Personal Content**: Use provided files, don't rewrite
   - `personal-section-content.md` is ready
   - `phylosophical-lineage` is comprehensive

3. **Timeline Visual**: Pick one (forest path / flowing water / tree branches)
   - Decision needed from you

4. **Cursor**: Final shape decision needed
   - Crosshair? Pointer? Custom? Ring?

5. **Logos**: Collect social media logos
   - Need: WhatsApp, LinkedIn, GitHub, Discord, Telegram, Bluesky, X

---

## 🚀 READY TO BEGIN?

**Next Steps**:
1. ✅ Confirm cursor design choice
2. ✅ Confirm timeline visual metaphor
3. ✅ Confirm social logo sources
4. ⏳ Start PHASE 1 (Home page update)

**What You'll Get**:
- Living, breathing content
- Personal + professional
- Authentic voice
- Magic in motion

**Timeline**: 2-3 hours for all content updates (+ design is preserved)

---

**Status**: Ready for immediate execution
**Waiting For**: Your confirmation on 3 design choices above
**Then**: We create magic 🌟


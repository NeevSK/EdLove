# 📋 NeevSK Web Content Implementation Plan
## Strategic Guide for Content & Copy Updates

**Prepared**: 2026-02-14
**Priority**: Content First, Design Stays (Unless Explicitly Needed)
**Approach**: Conservative - Don't break existing design, enhance what's there

---

## 🎯 Phase 1: Global Changes (Foundation)

### 1.1 Branding Updates
**What**: Rename "Neev SK" → "NeevSK" everywhere
**Scope**:
- [ ] Update all text references (hero, nav, footer, pages)
- [ ] Update CSS variables if needed
- [ ] Update metadata/titles

**Why**: Consistency and professionalism
**Risk**: Low - text replacements only

**Files Affected**:
- `HeroHome.astro`
- `Navigation.astro`
- `Footer.astro`
- `All page titles`

---

### 1.2 Text & Color Audit (Critical Review)
**What**: Analyze every text element, color, and component alignment
**Approach**: Conservative review, no changes yet
**Check**:
- [ ] Text color contrast (readability)
- [ ] Text size consistency (hierarchy)
- [ ] Text color matching context/background
- [ ] UI component colors matching surrounding colors
- [ ] Overall visual coherence

**Deliverable**: Report of what needs adjustment (show before making changes)

**Files Affected**:
- All components
- All color usage
- All text sizes

---

### 1.3 Cursor Design (UX Improvement)
**Current Issue**: Circle cursor not aligned
**Options to explore**:
- [ ] Align circle center properly (CSS fix)
- [ ] Change shape (square, diamond, custom)
- [ ] Add crosshair style
- [ ] Add glow/trail effect
- [ ] Hide on non-desktop

**Decision Needed**: Which style do you prefer?

---

## 🏠 Phase 2: Home Page Redesign

### 2.1 Hero Content Replacement
**What**: Remove/Replace hero text
**Current**: "Existential Cyberneticist" + "Building the soul..."
**New**:
- Main: "NeevSK" (name prominent)
- Subtitle: "23 years old | Pannala, Sri Lanka | INFJ 4W5"
- Bio: "Welcome message" (personalized)

**Changes**:
- [ ] Replace title text
- [ ] Replace subtitle text
- [ ] Add biographical info
- [ ] Keep visual style (animations, gradients)

**Risk**: Low - only text replacement

---

### 2.2 Door Cards → Facets Section
**What**: Rename "Choose Your Path" → Better terminology
**Current**: Five "doors" with mystical names
**New**:
- Remove door metaphor
- Use "Facets of My Life" or "Explore My Journey"
- Keep the 5 sections but make them more personal:
  1. Who I Am (Personal)
  2. How I Think (Intellectual)
  3. What I Build (Professional)
  4. What I Read (Library)
  5. Let's Connect (Connect)

**Changes**:
- [ ] Update section title/subtitle
- [ ] Update card titles (clearer)
- [ ] Update card descriptions
- [ ] Keep visual design (3D, colors, animations)

**Risk**: Low - content only

---

### 2.3 Current Focus Section (Now Section)
**What**: Make it more present-tense and alive
**Content Structure**:
- Business Analytics undergrad @ University of Moratuwa (2023-present)
- Currently building Gurudevi
- Thinking about:
  - Physics of life
  - Material conditions of systems
  - Systems thinking

**UI Enhancement**:
- [ ] Add visual progress/timeline
- [ ] Highlight "current year" (2025)
- [ ] Make university name/link prominent
- [ ] Add icons for each thinking area
- [ ] Keep smooth animations

**Risk**: Medium - may need UI tweaks for clarity

---

## 👤 Phase 3: Personal Page

### 3.1 Structure (Top to Bottom)
**Sections**:
1. **Who I Am** (Hero section)
   - Personal biography
   - Life philosophy intro

2. **Journey** (Content + Timeline)
   - Life timeline from birth → now
   - Visual: Path/forest road/flowing water
   - Key milestones

3. **Lineage** (Lower section)
   - Family/spiritual lineage
   - Influences

4. **Creative Elements** (Artistic)
   - Moving tree leaves
   - Branches (could animate)
   - Water flowing (metaphor for life flow)

**Content**:
- [ ] Write "Who I Am" section (use `personal-section-content.md`)
- [ ] Create life timeline (birth → 2026)
- [ ] Write lineage section
- [ ] Decide on artistic visual (leaves? branches? water?)

**Risk**: Medium - New layouts needed, requires custom design

---

### 3.2 Visual Design Considerations
**Keep**:
- Vivid color palette
- Smooth animations
- Premium feel

**Add**:
- Timeline visualization
- Artistic elements (leaves/branches/water)
- Better spacing for readability

---

## 🧠 Phase 4: Intellectual Page

### 4.1 Content Structure
**Sections**:
1. **Existential Cyberneticist**
   - Move from home → here
   - Full explanation

2. **Domains of Inquiry** (Organized)
   - Psychology & Psychoanalysis
   - Political Economy
   - Sociology
   - Systems Thinking & Cybernetics
   - Enactivism
   - Thermodynamics
   - Philosophy
   - Arrow of Time in Life

3. **Intellectual Lineage** (from `philosophical-lineage.md`)
   - Thinkers who influenced you
   - Key ideas/concepts

4. **Own Thoughts** (Own Ideas)
   ```
   - "Life is a dissipative structure trying to survive against entropy"
   - "I-Thou is the divine human encounter" - Martin Buber (through impedance matching?)
   - "Life ratchet is ticking forward"
   - "Topological nature of human existence and siloed epistemic domains??"
   - "Power is relational, generative, non-zero-sum game"
   ```

5. **Frameworks** (Your Theories)
   - Devneevma Pressure Theory
   - Devneevma Capital Theory
   - Thermodynamic-Semiotic Theory
   - Amla Model of Human Existence

**Content**:
- [ ] Fetch `philosophical-lineage.md`
- [ ] Organize domains with descriptions
- [ ] Format own thoughts nicely
- [ ] Explain each framework

**UI**:
- [ ] Make content "eccentric and powerful"
- [ ] Use typography to emphasize key ideas
- [ ] Add visual separation between sections
- [ ] Keep vivid colors for impact

**Risk**: Medium - Needs content organization and unique UI

---

## 💼 Phase 5: Professional Page

### 5.1 Projects Section
**Content**:
- [ ] Gurudevi (gurudevi.edlove.org)
  - Description, tech stack, link

- [ ] Edlove (edlove.org)
  - Description, tech stack, link

- [ ] Intuitui Labs (intuituilabs.edlove.org)
  - Description, tech stack, link

**Format**: Cards with project info, tech tags, links

---

### 5.2 Experience Section
**Content**:
- [ ] Management Intern @ Axcer Innovations (2022-2023)
  - Scrum Master role

- [ ] Vice President @ Students Union, Faculty of Business (2025-2026)
  - Responsibilities

- [ ] Founder @ Edlove.org (2023-2025)
  - What you built

- [ ] Founder @ Intuitui Labs (2025-2026)
  - Vision/goals

**Format**: Timeline or card layout with dates and descriptions

---

### 5.3 Education Section
**Content** (with logos):
- [ ] BBsc Business Analytics with ERP minor @ University of Moratuwa (2023-2027)
- [ ] Nalanda College Colombo (2013-2021)
- [ ] Pannala National School (2008-2012)

**Format**: Card layout with logos, dates, highlights

**Risk**: Low - standard content layout

---

## 📞 Phase 6: Connect (Contact) Page

### 6.1 Contact Links (with Icons/Logos)
**Platforms**:
- [ ] WhatsApp
- [ ] Email
- [ ] LinkedIn
- [ ] GitHub
- [ ] Discord
- [ ] Telegram
- [ ] Bluesky
- [ ] X (Twitter)

**Format**:
- Cards or buttons with logos
- Clickable links
- Organized grid

**UI**:
- Keep vivid colors
- Add hover effects (already have)
- Make each link visually distinctive

---

## 🔗 Phase 7: Footer Enhancement

### 7.1 Footer Link Interactions
**What**: Make footer links feel "openable"
**Options**:
- [ ] Add underline animation on hover
- [ ] Add glow effect
- [ ] Add icon that appears
- [ ] Color change with gradient
- [ ] Small lift animation

**Implementation**: CSS hover states (we already have animations)

---

### 7.2 Scroll to Top Button
**What**: Add button that returns to top
**Placement**: Bottom right (fixed position)
**Styling**:
- Match brand colors
- Smooth scroll behavior
- Hide when at top
- Show on scroll down

**Implementation**: JavaScript + CSS animation

---

## 🎨 Phase 8: Global Text & Color Audit Results

### 8.1 What We'll Check
- [ ] Text readability (contrast ratios)
- [ ] Text hierarchy (sizes, weights)
- [ ] Text color appropriateness (on backgrounds)
- [ ] UI component colors (match surroundings)
- [ ] Overall coherence (nothing looks out of place)

### 8.2 Conservative Approach
- Only suggest changes if there's a real clarity issue
- Don't redesign unless necessary
- Keep existing animations and effects
- Maintain current color palette

---

## 📅 Execution Order

**Recommended Sequence**:
1. ✅ Phase 1.1: Rename "Neev SK" → "NeevSK"
2. ✅ Phase 1.2: Text & Color Audit (review, show results)
3. ⏳ Phase 1.3: Decide on cursor design
4. ⏳ Phase 2.1-2.3: Update Home Page
5. ⏳ Phase 3: Personal Page (content + custom design)
6. ⏳ Phase 4: Intellectual Page (complex content + unique UI)
7. ⏳ Phase 5: Professional Page (straightforward content)
8. ⏳ Phase 6: Connect Page (links + logos)
9. ⏳ Phase 7-8: Footer + Global enhancements

---

## 📊 Risk Assessment

| Phase | Risk | Complexity | Time | Notes |
|-------|------|-----------|------|-------|
| 1.1 | 🟢 Low | Low | 15 min | Simple find/replace |
| 1.2 | 🟢 Low | Low | 30 min | Review only |
| 1.3 | 🟡 Medium | Low | 20 min | Needs decision |
| 2 | 🟢 Low | Medium | 1-2 hr | Content updates |
| 3 | 🔴 High | High | 2-3 hr | Custom design needed |
| 4 | 🔴 High | High | 2-3 hr | Complex content + UI |
| 5 | 🟡 Medium | Medium | 1-2 hr | Standard layout |
| 6 | 🟢 Low | Low | 45 min | Straightforward |
| 7-8 | 🟢 Low | Low | 45 min | Global tweaks |

---

## ⚠️ Important Notes

### What We WON'T Change (Unless Asked)
- Existing animations (GSAP, CSS)
- Vivid color palette
- Layout structure
- Premium glass/shadow effects
- Navigation design
- Button styles
- Card designs

### What We WILL Change
- Text content (copy)
- Text labels/names
- Text color if readability issue
- Add new sections/components
- Add interactive elements
- Footer enhancements
- Cursor design

### Decision Points Needed
1. **Cursor Style**: What shape/effect do you want?
2. **Personal Page Timeline**: Text-based? Visual timeline? Animated?
3. **Intellectual Page UI**: How "eccentric and powerful" should it look?
4. **Connect Page Icons**: Do you have logo files for social platforms?

---

## 🚀 Next Steps

**Immediate Actions**:
1. ✅ Review this plan
2. ⏳ Decide on cursor design
3. ⏳ Confirm content sources (do you have files ready?)
4. ⏳ Start with Phase 1.1 (rename)
5. ⏳ Show you Phase 1.2 audit results before making changes

**Questions for You**:
- Do you have content files ready for each section?
- Should I fetch content from existing docs?
- Cursor preference: circle, crosshair, custom?
- Timeline for delivery (when do you need this done)?

---

**Status**: 📋 Ready for Approval
**Next**: Waiting for your go-ahead and answers to questions above


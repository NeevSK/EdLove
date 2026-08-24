---
title: "EDLOVE.ORG â€” 05 DOMAIN II"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [apps, edlove-web]
---

# EDLOVE.ORG — 05 DOMAIN II
## System of Sri Lanka | "What is the reality we're working with?"

**Phase 1 Target**: v1.0 (Fully realized at launch)  
**URL**: `edlove.org/sri-lanka`  
**Accent Color**: Forest Green `#4A6357`  
**Last Updated**: February 3, 2026

---

## PURPOSE

This is the ground truth. The honest map of what education actually IS in Sri Lanka — not the brochure version, not the aspirational version. The real one.

When someone arrives here, they should feel: *"Now I see. Now I understand the system I'm actually inside of. And I can see both where it works and where it doesn't."*

This domain is the **diagnosis before the cure**. It is respectful, non-judgmental, and data-informed. It does not attack the system. It reveals it — clearly enough that people can see what needs changing.

---

## THE TWO LAYERS

### 2.1 Official Structure
**What the system says it is.**

This is the Ministry of Education's version. The stated goals. The hierarchy. The policies. The curriculum. The intended design.

Content includes:
- **Ministry hierarchy**: How the Ministry of Education is structured. Who decides what.
- **Stated goals**: What the government says education should achieve.
- **School types**: National schools, provincial schools, rural schools, private schools, international schools — and how they differ.
- **Curriculum**: What is taught. What subjects. What standards.
- **Assessment system**: How students are evaluated. The exam structure (O-Levels, A-Levels).
- **Teacher qualification and appointment**: How teachers become teachers. How they're placed.
- **Funding structure**: How education is funded. Where money flows.
- **Key statistics**: Enrollment rates, literacy rates, pass rates, dropout rates, teacher-student ratios.

**Tone**: Factual. Clear. Neutral. "This is how the system is designed to work."

### 2.2 Shadow Structure
**What actually happens outside and beneath the official system.**

This is the unmapped reality. The things that shape education in Sri Lanka but don't appear in official documents. The informal systems that often matter MORE than the formal ones.

Content includes:
- **Tuition culture**: Private tutoring as a massive parallel education system
  - How many students attend tuition?
  - What subjects? (Likely: Math, Science, English)
  - Who are the tutors? (Teachers moonlighting? Specialized tuition centers?)
  - What does it cost? (And what does that mean for families who can't afford it?)
  - How does this create a two-tier system?

- **Hidden hierarchies**:
  - Elite schools vs. rural schools — the gap
  - English-medium vs. Sinhala/Tamil-medium — language as divider
  - Urban vs. rural — access and quality differences
  - Family connections and their role

- **Socioeconomic pressures**:
  - Exam pressure culture — what it does to students and teachers
  - Family expectations and how they shape learning
  - Economic barriers to education (cost of uniforms, books, transport, tuition)
  - The relationship between education and employment expectations

- **Informal learning systems**:
  - Religious education (temple, mosque, church learning)
  - Family and community knowledge transmission
  - Self-directed learning (especially digital)
  - Peer learning networks

- **Discrepancies and Tensions** (the sharpest content):
  - Where official goals and actual outcomes DIVERGE
  - What the system SAYS it values vs. what it actually REWARDS
  - Intentions vs. outputs — where they match and where they don't
  - The pressures that push teachers and students away from genuine learning toward exam performance

**Tone**: Honest. Clear. Respectful. Not angry — revealing. "This is what's actually happening. Let's look at it together."

---

## THE USER EXPERIENCE FLOW

### Entry
User arrives at `/sri-lanka`

**First thing they see:**
```
[Forest green tones. Warm, grounded.]

"Sri Lanka's education story.
 Not the brochure.
 The real one."

[Two pathways visible:]
"The Official Story →"
"The Shadow Story →"
[Or: "See both together →"]
```

### The Official Structure Page
- Clean data visualizations
- Ministry hierarchy as an interactive org chart
- Key statistics displayed clearly (not buried in text)
- Curriculum overview
- "This is what the system is designed to do"

### The Shadow Structure Page
- More narrative, more story-driven
- Data where available (tuition costs, enrollment in private tutoring, etc.)
- Real stories (anonymized) from teachers and students about their experience
- Visual maps showing the gaps between official and actual
- "This is what actually happens"

### The Discrepancies View
The most powerful page in this domain:
- Side-by-side: "What the system says" vs. "What actually happens"
- Visual tension maps showing where goals and reality diverge most
- "These gaps are where transformation becomes possible"

---

## RESEARCH METHODOLOGY

We don't have this data yet. Here is how we gather it:

### Phase 1: Desk Research (Now)
- Ministry of Education website and publications
- World Bank education reports on Sri Lanka
- UNESCO data
- Academic papers on Sri Lankan education
- News articles and journalism
- UNICEF reports

### Phase 2: Community Research (After Domain V launches)
- Teachers sharing their experiences in the Sangha
- "Tell us about your school" forms
- Anonymous story submissions
- Pattern recognition across many voices

### Phase 3: On-ground (Future)
- Interviews with teachers, students, parents
- School visits (with permission)
- Data collection partnerships with researchers

**For Phase 1 launch**: We use desk research + whatever community input we have. We are transparent about what is research-backed and what is emerging/anecdotal. We don't pretend to have more certainty than we do.

---

## DATA VISUALIZATION GUIDELINES

Domain II uses data differently than other domains. It is **stark and honest**.

- **Charts**: Simple. Clear labels. No unnecessary decoration. Use Flourish or Observable (both free).
- **Colors**: Forest Green palette. Use color to distinguish categories, not to make things pretty.
- **Tooltips**: Hover/tap reveals exact numbers. Don't clutter the visual with data — let interaction reveal depth.
- **Mobile**: All visualizations must work on mobile. Stack vertically. Never horizontal scroll.
- **Source attribution**: Every piece of data has a visible source link. Transparency is non-negotiable here.
- **Uncertainty shown**: If data is estimated or incomplete, say so visibly. Don't hide gaps.

---

## CONNECTIONS TO OTHER DOMAINS

| Connection | How |
|------------|-----|
| ← Domain I (Cosmos) | "You've seen what education COULD be globally. Now see what it IS here." |
| → Domain III (Gurudevi) | "Here are the gaps and pressures. Gurudevi is designed to address them." |
| → Domain IV (Resources) | "These are the needs the data reveals. Here's how to help." |
| ↔ Domain VI (Epistemic Core) | Research and frameworks inform the analysis. Stories live in the library. |
| ↔ Domain V (Sangha) | Community contributes stories and lived experience to this domain. |

---

## CONTENT FILES NEEDED

| File | Location | Status |
|------|----------|--------|
| Official structure overview | `src/content/sri-lanka/official-structure.md` | Research needed |
| Shadow education overview | `src/content/sri-lanka/shadow-education.md` | Research needed |

---

## COMPONENTS NEEDED

| Component | File | Purpose |
|-----------|------|---------|
| HierarchyChart | `components/srilanka/HierarchyChart.svelte` | Ministry org chart |
| StatCard | `components/srilanka/StatCard.svelte` | Key statistics display |
| DiscrepancyView | `components/srilanka/DiscrepancyView.svelte` | Side-by-side official vs. reality |
| DataChart | `components/srilanka/DataChart.svelte` | General data visualization wrapper |

---

*"This is what is. Now let's imagine what could be."*

**Status**: v1.0 target for Phase 1 launch (research phase active)  
**Last Updated**: February 3, 2026

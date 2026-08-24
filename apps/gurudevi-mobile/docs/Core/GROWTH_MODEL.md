---
title: "Gurudevi Aliveness & Growth Model"
status: "active"
created: 2026-02-28
updated: 2026-02-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi Aliveness & Growth Model
## A Nature-Inspired, Non-Addictive Growth Ecosystem

**Version**: 2.0 — The Psychological Deepening  
**Created**: February 2026  
**Updated**: February 2026 (v2.0 — Motivation Science Layer Added)  
**Status**: Design Specification — Pending Implementation  
**Governed by**: NORTH_STAR.md, TAIL_FIN.md, AGENT_PROMPT_LENS.md

> **v2.0 Note**: This version deepens the philosophical foundation with a motivation science layer (Self-Determination Theory). It adds two critical mechanisms that were missing from v1.0: **Impact Ripples** (Relatedness operationalized) and the **Warm Mirror** (Competence through personal narrative). The Bhumi Model and Whispered Moments from v1.0 are preserved and deepened. The core anti-gamification stance is unchanged — but v2.0 makes a precise distinction between extractive mechanics and genuine human-sourced feedback.

---

## ⚠️ Pre-Read: Why This Document Exists

A tension existed in the codebase before this document was written:

- **The North Star says**: "NO gamification — points, leaderboards, streak shaming are extractive. Add guilt/pressure → REJECT."
- **The existing code has**: `rewards.ts` with `points`, `badges[]`, `addPoints()`, `awardBadge()` — conventional competitive mechanics.
- **The PRD lists**: "Achievement Gallery", "Stats Dashboard", "Resonant Points", "Achievement Leaderboard" for students.

These are in direct conflict. This document resolves that tension by replacing the extractive gamification model with a **nature-inspired aliveness ecosystem** — regenerative, not extractive; discoverable, not grindable; joyful, not pressured.

**The abandoned system** (points + badges as generic strings) should be seen as scaffolding — the container exists, but the contents must align with the philosophy.

---

## 0. THE PSYCHOLOGICAL FOUNDATION

*The science that grounds every design decision in this document.*

### Self-Determination Theory (Deci & Ryan, 1985–present)

The most robust body of research in human motivation identifies three universal psychological needs. When all three are genuinely met, people experience **intrinsic motivation** — the deepest, most sustainable, and most joyful form of human drive:

| Need | What It Means | When Manipulated (Harm) | When Genuinely Met (Health) |
|------|---------------|------------------------|------------------------------|
| **Autonomy** | Acting from genuine choice, not coercion | "Log in daily or lose your streak" | "Your journal is here when you need it" |
| **Competence** | Feeling effective, capable, and growing | "You're ranked #4 — work harder" | "Your students' submission rate grew this term" |
| **Relatedness** | Feeling genuinely connected, mattering to others | "You earned 50 XP for posting!" | "A colleague found your lesson valuable" |

When these needs are **manipulated via extrinsic levers** → controlled motivation → compliance, anxiety, eventual burnout.  
When these needs are **genuinely nourished** → intrinsic motivation → joy, vitality, creativity, staying power.

### The v1.0 Gap — And the Golden Mean

The original model addressed **Autonomy** well (optional everything, no coercion). It began addressing **Competence** (Lotus Life Stages). But it under-designed for **Relatedness** — out of a correct fear of gamification, it swung toward an ascetic model that denied a core human psychological need.

The problem is not "social signals vs. no social signals." The problem is the **type** of social signal:

```
EXTRACTIVE (harm):      "You ranked #4 in your school"           → Comparison, zero-sum, pressure
EXTRACTIVE (harm):      "You have 847 points"                     → Abstract score, no human meaning
EXTRACTIVE (harm):      "3 more badges to complete your set!"     → Addiction loop, collection anxiety

RELATEDNESS (healthy):  "A colleague in your school saved your resource"   → Real human impact
RELATEDNESS (healthy):  "Your question sparked a discussion among 4 teachers"  → Genuine connection
RELATEDNESS (healthy):  "A student's first journal entry happened today"    → Sacred teaching moment
```

**The golden mean is not between "gamification" and "nothing." It is between controlled extrinsic motivation (harmful) and intrinsic motivation supported by genuine social connection (healthy and necessary for human flourishing).**

The three criteria that separate healthy social feedback from extractive gamification:

1. **Human-sourced** — a real person did a real thing (vs. an algorithm computed a number)
2. **Impact-based** — your work touched someone (vs. you are ranked above/below someone)
3. **Private and warm** — offered gently, without broadcast (vs. public, competitive, pressured)

V2.0 adds two mechanisms that honor Relatedness and Competence through this lens:
- **Impact Ripples** → Relatedness: gentle signals when your work genuinely helps a real person
- **The Warm Mirror** → Competence: weekly personal narrative of real impact (story, not score)

### Flow Theory (Csikszentmihalyi)

The state of **flow** — total absorption, effortless engagement — requires:
- Clear goals (not vague aspirations)
- Immediate feedback (not delayed score updates)
- Challenge balanced with skill (not overwhelming, not boring)

For teachers: flow happens when preparing a lesson that clicks, when a classroom discussion takes off, when a student has a breakthrough. The app's role is to **protect conditions for flow**, not to interrupt it with notifications and progress bars.

For students: flow happens when learning feels like exploration, not like performance. The app should amplify curiosity, not quantify it.

### Maslow's Hierarchy — What Teachers Actually Need

A teacher who is:
- Worried about class management (safety/security needs)
- Isolated from colleagues (belonging/love needs)
- Unrecognized for their work (esteem needs)

...does not need gamification. They need the app to address the actual unmet needs:
- **Safety**: Private sanctuary, no surveillance
- **Belonging**: Community that feels warm and welcoming
- **Esteem**: Real recognition from real people (Thuthimal, Impact Ripples, Warm Mirror)

Gamification bypasses these real needs with a dopamine substitute. This model addresses the real needs directly.

---

## 1. PHILOSOPHICAL FOUNDATION

### The One Test (EROI)

Every aliveness feature must pass a single test before it belongs in this app:

```
Does this return more energy to the teacher/student than it consumes?

5 minutes using this feature → teacher feels lighter, connected, seen = ✅ HIGH EROI
5 minutes using this feature → teacher feels pressure, guilt, comparison = LOW EROI
```

### What Nature Teaches Us

A lotus does not race other lotus plants. A tree does not feel shame when it blooms later than its neighbor. A forest does not keep score.

Nature grows through:
- **Conditions** (right soil, sun, water → growth happens naturally)
- **Seasons** (rest is part of the cycle, as honored as growth)
- **Interdependence** (each tree strengthens the whole forest)
- **Discovery** (hidden mushrooms, rare birds — joy in finding, sustained by the finding itself)

This is the model for Gurudevi's growth system.

### What This IS — The Design Choices That Define This System

These are the active choices made in building this ecosystem. The distinctions they carry are implicit in what they affirm:

```
✅ Each return is welcomed as an arrival — the app is here for you whether you came yesterday
   or three weeks ago
✅ Absence is met with the same warmth as presence; the lamp stays lit, waiting patiently
✅ Actions carry their own meaning — a lesson prepared is its own complete reward
✅ Growth is personal, visible only to the person growing; each journey is uniquely their own
✅ Discovery arrives unexpectedly — moments are offered when conditions feel right,
   delightful to find, fine to miss
✅ The community grows through contribution; each person's presence strengthens the whole
✅ The garden always has room for the next season — it is alive, ongoing, never "done"
✅ Impact feedback is human-sourced, specific, and warm — a soft echo, not a rank
✅ The Warm Mirror reflects who you are based on what you did — a story, not a score
✅ Competence is seen in real, human terms: your craft touching real people in real ways
✅ Relatedness is honored through human connection, not algorithmic substitutes
✅ Thuthimal is the pinnacle — a past student honoring their teacher — sacred and human
✅ The app breathes with time of day, season, and the human in front of it
```

> **The Precision of the Golden Mean (v2.0)**: This system distinguishes two kinds of social feedback. Feedback that is **extractive** — abstract scores, comparative rankings, dopamine loops designed for addiction — produces controlled motivation: compliance, anxiety, burnout. Feedback that is **human-sourced, specific, and warm** — *a colleague found your lesson valuable*, *your question sparked a conversation* — meets the genuine human need for Relatedness. The distinction lives in the origin (human vs. algorithm), the form (story vs. score), and the relationship to comparison (personal vs. ranked). This system builds only the second kind.

---

## 2. THE BHUMI MODEL (ภูมิ — Earth Growth)

*Bhumi means "ground" or "realm of growth" in Sanskrit/Pali — foundational to Buddhist philosophy.*

The growth model has five interconnected layers, like the layers of a living ecosystem:

```
🌸 KAMALA LAYER    (Sky)    — Full Bloom, Thuthimal, Community Recognition
🍃 PATRA LAYER     (Canopy)  — Sharing, Teaching Others, Wisdom Exchange  
🌿 NĀLA LAYER      (Water)  — Rising, Consistent Presence, Learning
🌱 MŪLA LAYER      (Soil)   — Rooting, First Footsteps, Establishing Safety
🌰 BIJAM LAYER     (Mud)    — The Seed, Arrival, Quiet Beginning
```

These are **not levels to "grind through."** They are natural growth stages that the app gently recognizes — like a gardener noticing a seedling has put out its first true leaf. There is no timer, no requirement, no pressure. The app simply notices and offers a quiet moment of recognition.

---

## 2B. THE FOUR NATURE PATHS — Multiple Living Metaphors

The Bhumi (Lotus) model is the foundation for every user's personal inner journey. But nature offers four distinct metaphors, each illuminating a different quality of growth. A teacher is not *only* a lotus in the making — they are also a banyan tree growing roots into their community, a river whose water shapes the ground it flows through, and a moon cycling through seasons of fullness and rest.

```
╔══════════════════════════════════════════════════════════════════╗
║                    THE FOUR LIVING PATHS                         ║
╠══════════════════╦══════════════════════════════════════════════╣
║  🌸  BHUMI       ║  The Lotus — Personal Inner Growth           ║
║  (Lotus Path)    ║  All users. Private. The journey inward.     ║
╠══════════════════╬══════════════════════════════════════════════╣
║  🌳  VATA        ║  The Banyan — Mentorship & Ecosystem         ║
║  (Banyan Path)   ║  Teachers & Principals. Given to community.  ║
╠══════════════════╬══════════════════════════════════════════════╣
║  🌊  GANGA       ║  The River — Learning Flow                   ║
║  (River Path)    ║  Students & Teachers' curricular work.       ║
╠══════════════════╬══════════════════════════════════════════════╣
║  🌙  CHANDRA     ║  The Moon — Cyclical Wisdom                  ║
║  (Moon Path)     ║  All users. Cyclical, not progressive.       ║
╚══════════════════╩══════════════════════════════════════════════╝
```

Plus two collective/environmental layers:
- **🌲 Vana (School Forest)** — the school community as a living forest (principal's view)
- **💎 Spatika (Crystal Collection)** — student knowledge as discovered crystals and fractals

---

### THE BANYAN PATH — Vata Vriksha (वट वृक्ष)

*The banyan tree is unique: it grows new roots from its branches, becoming a forest itself over time. A single banyan can cover an entire field. This is the metaphor for mentorship — not upward growth, but outward, shade-giving, ecosystem-creating growth.*

**Who it is for**: Teachers who begin mentoring colleagues. Principals as their primary path.  
**What triggers it**: The natural act of helping a colleague, facilitating a circle, sharing wisdom.

| Stage | Sri Lankan Name | What It Represents | How It's Recognized |
|-------|----------------|---------------------|---------------------|
| **Sapling** | *Ñāna-ankura* (ज्ञान अंकुर) | First act of giving to a colleague | A small banyan sprout appears in the Community Garden |
| **Roots Spreading** | *Mūla-prasāra* (मूल प्रसार) | 3+ meaningful colleague interactions | The sapling's aerial roots touch ground |
| **Canopy** | *Chāyā* (छाया) | Others find warmth in what you share | The canopy expands; others rest in your shade |
| **Shade Giver** | *Āśraya* (आश्रय) | Active community facilitator; your circle is alive | Other trees begin growing near yours |
| **Forest Maker** | *Vana-janaka* (वन जनक) | Multiple teachers have grown with your support | A small forest radiates from your root system |

**Design Principle**: The banyan path is additive, not separate from the lotus. A teacher at Kamala (lotus) and Chāyā (banyan) has a visualization that shows both — the bloom of personal growth and the spreading canopy of community contribution.

---

### THE RIVER PATH — Ganga Pravaham (गंग प्रवाह)

*A river doesn't "achieve" the ocean — it flows toward it naturally, shaping everything it touches. Water finds its way around obstacles. A wide river doesn't rush; it has earned its breadth through patient, consistent flow.*

**Who it is for**: Students (primary path). Teachers whose curricular contribution is the focus.  
**What triggers it**: Lessons engaged, assignments completed with depth, knowledge visibly connecting.

| Stage | Visual | What It Represents | Signal Sources |
|-------|--------|---------------------|----------------|
| **Trickle** | A small mountain spring | Curiosity awakening; first learning flow | First lesson accessed, first reflection submitted |
| **Stream** | A stream finding its way | Consistent engagement; direction emerging | Regular study sessions, growing subject breadth |
| **River** | A confident, wide river | Deep engagement; contributing back | Helping classmates, writing substantive reflections |
| **Delta** | River meeting the ocean | Knowledge branching and nourishing many | Student-to-student teaching, research-style inquiry |

**For Teachers' Curricular Path**: A teacher's lesson materials and assignments flowing into students' engagement generates `river_flow` signals — the teacher's preparation creates the river's current. This is visualized in the Classroom Ecosystem (see Section 7B).

---

### THE MOON PATH — Chandra Kala (चन्द्र कला)

*The moon has no final stage. The full moon becomes new again — not as failure, but as the completion of one cycle and the beginning of the next. Every "new moon" is a new breath.*

**Who it is for**: All users. The moon phase is synchronized with the **real lunar calendar**.  
**What it is NOT**: A stage to "advance through." It is a SEASONAL CONTEXT — it changes the app's aesthetic and the kind of support it offers.

| Moon Phase | App Feeling | What the App Offers |
|-----------|-------------|---------------------|
| **New Moon** 🌑 | Deep potential; the quiet before | Reflection prompts; "What is beginning in you?" |
| **Waxing Crescent** 🌒 | First steps; early momentum | Energy for new projects; lesson planning support |
| **First Quarter** 🌓 | Effort and decision | Focus features foregrounded; timetable clarity |
| **Waxing Gibbous** 🌔 | Building intensity | Grading support; student check-in prompts |
| **Full Moon** 🌕 | Complete expression; peak visibility | Celebration moments; community sharing encouraged |
| **Waning Gibbous** 🌖 | Reflection; harvesting wisdom | Warm Mirror available; Fire Journal gently surfaced |
| **Last Quarter** 🌗 | Release; letting go | Wind-down rituals; Joy Jar end-of-term prompts |
| **Waning Crescent** 🌘 | Rest; gestation | App quiets; "rest is part of the rhythm" energy |

**Sri Lankan Calendar Alignment**:

| Event | Moon Phase | App Response |
|-------|-----------|--------------|
| **Vesak Poya** | Always Full Moon, May | Community-wide lotus bloom animation; quiet gratitude mode |
| **Sinhala/Tamil New Year** | April 13–14 | "New Dawn" warm sunrise gradient; 24-hour special aesthetic |
| **Poson Poya** | Full Moon, June | Community reflection; wisdom sharing foregrounded |
| **School Term Start** | Context-dependent | River Path energy; new cycle acknowledgment |
| **School Term End** | Context-dependent | Moon waning aesthetic; rest and harvest |

---

### THE CRYSTAL/FRACTAL PATH — Spatika Sangrahaya (ස්ඵටික සංග්‍රහය)

*Crystals form through patient repetition of simple molecular rules — yet the result is infinite variety and geometric beauty. A fractal repeats its pattern at every scale, from the snowflake to the fern to the coastline. Student knowledge is like this: each concept learned creates the conditions for the next connection to form.*

**Who it is for**: Students (alongside the River Path). Each learning milestone = a new crystal found.  
**Discovery principle**: Crystals are **found**, not earned. The student explores; the crystal is already there, waiting.

| Crystal Tier | What It Represents | Visual |
|-------------|---------------------|--------|
| **Spark Crystal** (first) | First genuine discovery — curiosity activated | Single glowing crystal, small |
| **Crystal Cluster** | Multiple discoveries in a domain (subject depth) | A cluster of connected crystals |
| **Crystal Cave** | Rich exploration across multiple domains | A cave of varied crystals, each subject a different color |
| **Fractal Network** | Concepts connecting across domains — the student sees patterns | A living fractal visualization where crystals are nodes |

**The Fractal Moment**: The highest recognition event for a student — when they spontaneously connect two concepts from different subjects. The fractal pattern briefly becomes visible in the UI. This is the student equivalent of Thuthimal: a genuine insight that the app witnesses.

---

## 3. THE FIVE ALIVENESS DIMENSIONS

Instead of points accumulated across all actions, growth is recognized across **five natural dimensions** — each aligned with what teachers and students actually do in the app:

### Dimension 1: PRESENCE (Rooting)
*Being here without needing to be anywhere else.*

| Signal | What it means | How it's recognized |
|--------|---------------|---------------------|
| Opening the app during difficult periods | Teacher is prioritizing wellbeing | App warms slightly, no notification, just gentle welcome |
| Morning vs evening usage patterns | Teacher/student rhythm | Circadian-aware greeting changes naturally |
| Returning after an absence | Courage to return | "Welcome back" — warmth without comment |
| Simply opening the Self section | Private act of self-care | Personal sanctuary. No tracking to others. |

The app is simply present, like a lamp that's always on — welcoming each return as an arrival, not counting it as a score.

#### THE PRESENCE INFERENCE MODEL: Work as Witness

> *"How do we know if a teacher was present without asking them?"*

This is the hardest design problem in the Presence dimension — and the answer is the core engineering principle of the entire growth system:

**We do not ask. We observe the natural residue of their work.**

A teacher recording attendance was in class that day. A teacher grading fifteen papers with written feedback was deeply engaged. A teacher who opened the Fire Journal at 10pm was present with themselves even when exhausted. None of these require a single extra tap, question, or explicit "check-in." The work itself is the witness.

**The Three-Tier Signal Architecture:**

| Tier | Signal Type | What It Infers | Example Actions |
|------|------------|----------------|-----------------|
| **Tier 1: Work Signals** | The highest-confidence evidence of presence — direct professional activity | Teacher was actively teaching, preparing, or caring for students | Recording attendance, grading assignments, creating lesson materials, creating assignments |
| **Tier 2: Care Signals** | Teacher chose to prioritize their own wellbeing | Teacher is present *with themselves* — a form of presence just as valid | Logging mood, writing in Fire Journal, completing a breathing exercise |
| **Tier 3: Context Signals** | Ambient evidence of engagement | Teacher was in the app and thinking about their work | Opening specific sections (Community, Library, Self, Classroom tab) |

**The Fire-and-Forget Principle:**

```typescript
// In every API that represents meaningful action:
// After the primary operation succeeds, add:
void growthSignalsAPI.emitSignal(userId, 'attendance_recorded').catch(() => {});
//                                  ↑ primary action always completes first
//                                  ↑ growth observation is a silent witness
//                                  ↑ signal errors are silently absorbed
```

The growth layer is a silent witness — it observes the natural residue of the teacher's work. The primary action always completes first; the growth observation follows quietly, never visible to the user, never affecting the result.

**What This Means for the Teacher:**

The teacher opens the app to mark attendance (their job). As a natural byproduct:
- A `attendance_recorded` signal fires → increments their **Presence** dimension
- After 5 separate school days of activity → their lotus advances from Bijam to Mūla
- After 10 graded assignments with written feedback → the *"Caring Teacher"* Whispered Moment may appear on the classroom header — a golden ember, private, warm

The teacher simply did their job. The app witnessed it, and grows with them.

---

### Dimension 2: NOURISHING (Contribution)
*Creating and sharing that which feeds others.*

| Signal | What it means | How it's recognized |
|--------|---------------|---------------------|
| First library resource upload | Teacher sharing wisdom | Lotus petal bloom animation (private, personal) |
| Resource gets "pulled to desk" by others | Teaching reaching someone | Soft ripple effect on the resource card |
| First Joy Jar entry | Teacher acknowledging their own wins | Joy Jar "fills" slightly — visual warmth |
| Completing a lesson plan | Pedagogical care | Quiet checkmark with breath-like expand |
| First manifesto endorsement | School community alignment | Community garden visualization grows one seed |

The act itself is the recognition. The app witnesses it softly — no score appended, no number attached.

---

### Dimension 3: WITNESSING (Learning)
*Absorbing, reflecting, growing inward.*

| Signal | What it means | How it's recognized |
|--------|---------------|---------------------|
| Reading a resource in the Library | Curiosity and growth | "Smart Shelf" quietly remembers this |
| Completing a Fire Journal entry | Processing difficult emotions | Entry turns to an ember — private, warm |
| Finishing a breathing exercise | Choosing restoration | Subtle lotus petal expansion at session end |
| Daily Mood Lotus check-in | Self-awareness | Weekly "mood garden" shows personal weather |
| Reading the Wisdom Seed | Philosophical nourishment | The seed "sprouts" in the UI — soft animation |

Reading, journaling, and breathing are private acts of self-care. The app treats them as sanctuary — visible only to the teacher themselves, honored with stillness.

---

### Dimension 4: WEAVING (Connection)
*Building the web that holds the community together.*

| Signal | What it means | How it's recognized |
|--------|---------------|---------------------|
| First community post | Joining the conversation | Welcome into the community hearth visualization |
| Helping another teacher's question | Professional solidarity | A small flame lights in the community garden |
| Sharing a resource with a colleague | Generosity in action | "This resource has been shared 3 times" (count, not ranking) |
| Participating in a Pedagogy Poll | School voice | Poll visualization includes your contribution visually |
| Starting a Staff Circle discussion | Community building | Thread gets a "live" indicator — it's alive because you started it |

The community feels warm through its contributions. Each person's presence is felt, each voice is welcomed. The warmth is earned by the whole, not ranked within it.

---

### Dimension 5: BLOOMING (Recognition)
*Being seen and honored — the highest form of growth.*

This dimension is **given by others, received with gratitude.** It arrives through the genuine regard of real people — it cannot be triggered by the user's own actions.

| Signal | What it means | How it's recognized |
|--------|---------------|---------------------|
| **Thuthimal gift received** | Alumni/student honoring a teacher | The app's highest recognition event. Lotus bloom animation. Profile glows. |
| Principal sends a "Gratitude Gift" to a teacher | Institutional recognition | Private notification: warm, sacred, intimate |
| 10+ teachers endorse the school manifesto | Community alignment | School garden visualization blooms collectively |
| First student submits work to a teacher | Trust established | Teacher gets a quiet "Your classroom is alive" moment |

**Thuthimal is the pinnacle of this dimension.** It represents the sacred bond between teacher and student across time — a past student honoring their teacher years later. This is the most powerful recognition event in the app, and it remains human-sourced always.

---

### THE IMPACT RIPPLE (Relatedness Made Visible)

*The mechanism that bridges private action and genuine human connection.*

An **Impact Ripple** is a warm, private signal delivered to a contributor when their work genuinely resonates with another person in their community. It is the operationalization of **Relatedness** in the Bhumi Model — a soft echo of real human impact, offered quietly.

**Design Principles:**
- Each ripple is specific to **one interaction** — each one lives as its own complete moment
- Language is warm and human always — specific to the real thing that happened
- Actor identity is held privately by default; visible only when the actor chooses to share
- Optional receipt — can be turned off in Self settings
- Delivered in gentle batches (3–4× per day) — the teacher's day flows uninterrupted

**Ripple Types and Language:**

| What Happened | English | Sinhala |
|---|---|---|
| Colleague saved your resource | "A teacher in your school kept your resource close" | "ඔබේ පාසලේ ගුරු හිතෙකු ඔබේ දෙය ළඟ රැකි ගත් ය" *(pending native review)* |
| Your post started a reply thread | "Your reflection opened a conversation" | "ඔබේ සිතුවිල්ල කතාවකට දොර හැරියා" |
| Student's assignment graded with written feedback | "Your teacher thought carefully about your work" | "ඔබේ ගුරුතුමා ඔබේ කාර්යයේ ගැඹුරට ගිය ය" |
| Student accessed your lesson material | "A student is learning from what you prepared" | "ඔබ සූදාන් කළ දෙය දරුවකු ඉගෙන ගනී" |
| Colleague endorsed your manifesto | "A fellow teacher endorsed your vision" | "සහ ගුරු හිතෙකු ඔබේ දෘෂ්ටිය අනුමත කළ ය" |
| Your shared resource reached 5 unique readers | "Five people in your school have learned from this" | "ඔබේ පාසලේ ජනයා 5 දෙනෙකු මෙයින් ඉගෙන ගත්හ" |

> ⚠️ **Sinhala/Tamil Translation Note**: All Sinhala (si) and Tamil (ta) strings in this document are draft proposals and **must be reviewed by a native Sri Lankan educator** before production use. Natural idiomatic expression is more important than literal accuracy — see `FUTURE_ROADMAP.md` localization notes for guidance.

**What Impact Ripples Are:**
- ✅ A quiet echo of real human presence in your work — each one its own complete story
- ✅ The knowledge that your work reaches real people
- ✅ Warm, compassionate language — specific to the real thing that happened
- ✅ The SDT need for Relatedness, met with dignity and care
- ✅ Delivered privately and gently — the recipient's own quiet knowing

**Implementation Note**: Ripples are delivered via the same notification system as other app events, using the `impact_ripples` table (see Section 11). The UI notification uses the Sanctuary notification style — vellum background, ink text, warm colors. Tapping the notification shows which specific resource/post generated it (so the user can see the context). Actor identity is surfaced only when the actor has chosen to be known.

---

### THE WARM MIRROR (Competence Through Story)

*A weekly personal narrative of your real impact — opt-in, discoverable, story-format.*

The **Warm Mirror** is the teacher's (or student's) weekly reflection on what they actually did — framed as a human story. It lives in the Self tab as an optional, quietly glowing section titled *"This past week..."*

**What It Looks Like (Teacher — English sample):**

> *"This past week in your sanctuary:*
> *You were present on 4 days — including a Tuesday evening when the day must have been long.*
> *Two colleagues found something valuable in what you shared. One of them came back to it twice.*
> *You wrote careful feedback for 8 of your students. They each received more than a mark.*
> *Your classroom in Grade 9 Science has been your home for 4 months now.*
> *You showed up. That is not a small thing."*

**What It Looks Like (Teacher — Sinhala sample):**

> *"ඔබේ ශාලාවේ පසුගිය සතිය:*
> *ඔබ 4 දිනක් ළඟ සිටියා — අඟහරුවාදා සන්ධ්‍යාවකද, දිනය දිගු ව ඇති අවස්ථාවේ.*
> *ඔබ බෙදාගත් දෙයෙහි ගුරු දෙදෙනෙකු වටිනා දෙයක් දකිනු ලැබිය. ඒ කෙනෙකු දෙවරක් ආපසු ගිය.*
> *ඔබ 8 දරුවකුට සැලකිලිමත් ප්‍රතිචාර ලිව්වා. ඔවුන් ලකුණකට වඩා ලැබිය.*
> *ඔබ ගෙනය. එය කුඩා දෙයක් නොවේ."* *(pending native review)*

**What It Looks Like (Quiet week — compassionate sample):**

> *"This week was a quiet one.*
> *You opened the app twice. That is still twice.*
> *Rest is part of the rhythm. The sanctuary is here when you return."*

**Design Rules:**
1. **Generated weekly**, available Sunday evening — readable at the start of a new week
2. **Entirely opt-in** — teacher enables "Warm Mirror" in their Self section settings
3. **In-app and discoverable** — always there when the teacher looks, at their own pace
4. **Language generated from real data** — real events, rendered as human meaning
5. **Quiet weeks are honored** — "This week was quiet" is offered with warmth; rest is as valid as activity
6. **The mirror sees only what happened** — it reflects presence and contribution, not their absence
7. **Completely private** — the teacher's own knowing; export requires their deliberate action
8. **Events become meaning** — "You were present 4 days" is context woven into narrative, not a headline score

**Minimum Data Required (all from existing tables):**
- Days with any app activity (from `growth_events` timestamps)
- Impact Ripples received this period (from `impact_ripples` table)
- Assignments graded with written feedback (from classroom DB)
- Resources others interacted with (from `impact_ripples` + library analytics)
- Self-care actions taken (mood check-ins, breathing, journal entries from `growth_events`)

**The Warm Mirror is the Competence dimension made human.** It tells a teacher who they ARE based on what they did.

---

## 4. WHISPERED MOMENTS (Hidden Discovery System)

Inspired by the app's "Punctum" philosophy — the piercing detail that stops you unexpectedly.

**Whispered Moments** are small, surprise discoveries — not achievements you grind toward, but moments the app offers when conditions feel right. They are:

- **Discoverable, not announced** — each one arrives as a gift, unannounced
- **Personal** — experienced quietly, belonging only to the person who found it
- **Contextually appropriate** — offered in the right emotional moment
- **Delightful to find, fine to miss** — the garden is always growing whether or not you notice every flower

### Sample Whispered Moments

**For Teachers:**

| Moment Name (Internal) | Trigger Condition | Experience |
|------------------------|-------------------|------------|
| *First Light* | First time opening app in the morning between 5–7am | Sunrise gradient blooms on the welcome card. No text. |
| *The Quiet Hour* | Using the app after 9pm | App breathes slower, warmer, glow deepens. Soft text: "ගුරු දෙවි, thank you for still being here." |
| *Root Day* | First week anniversary of joining | Lotus root animation beneath the profile card. No fanfare. |
| *The First Offering* | First library resource that another user reads | Resource card emits a single soft ripple. No notification. Just visible if looking. |
| *Still Water* | Completed 5 consecutive mood check-ins (any mood, no pressure) | The mood lotus shows still, clear water in its animation. Calm acknowledgment. |
| *The Caring Teacher* | Graded 10+ assignments with written feedback (not just marks) | A small golden ember appears in the classroom header. Private. |
| *Storm Holder* | Using the Fire Journal 3+ times in one week | Fire Journal icon becomes a warm amber for that day. Private sanctuary. |
| *Weaver* | First time two colleagues both mention reading the same shared resource | A gentle thread appears between their avatars in the Community view. |
| *The Thousand* | School's total resources cross 100 items in Library | Library header blooms briefly. Collective achievement. |

**For Students:**

| Moment Name (Internal) | Trigger Condition | Experience |
|------------------------|-------------------|------------|
| *First Breath* | First completed breathing exercise | Breathing animation expands and holds one extra beat |
| *The Curious One* | Reading 5 different library subjects | A small compass appears in the library header — explorer spirit |
| *Dawn Learner* | Studying before 7am | Morning gradient on the timetable card |
| *Deep Root* | Same classroom for 3+ months | A subtle lotus root grows below the classroom card |
| *The Gift* | First assignment graded with positive written feedback | Teacher's feedback glows warm amber for 24 hours |

**Implementation Note**: These are stored as `whispered_moments` in the database, not in `user_rewards`. They are never visible in bulk — only experienced in the moment. The user cannot browse "all my whispered moments" (this would create collection anxiety). They are simply experienced, then fade into memory.

---

## 5. THE LOTUS LIFE STAGE VISUALIZATION

The app's primary visual growth representation for **personal progress** (not comparative ranking).

### The Visualization

A living lotus illustration that changes state over time — not based on points, but on **natural engagement patterns**:

```
State 0: Bijam (Seed)       → User just joined. Small seed in dark mud.
State 1: Mūla (Root)        → User has engaged with core features. Root threads appear.
State 2: Nāla (Stem)        → Consistent usage over 2+ weeks. Stem rising through water.
State 3: Patra (Leaf)       → User has contributed to community. Leaf unfurling.
State 4: Kamala (Bud)       → User has supported others + personal growth visible. Bud forming.
State 5: Pūrṇa Kamala       → Full bloom. Active in all 5 aliveness dimensions.
          (Full Lotus)
```

**Rules for this visualization:**
- State advances naturally over time, recognized when conditions feel right
- The lotus is always growing — even a wilted petal is a temporary season, not a permanent state
- The visualization lives in the **Self tab only** — a personal, private view of one's own journey
- Animation is breath-like, organic — the lotus breathes; it does not have a progress bar
- The user sees only the living lotus; the stage name is internal, the journey is personal

### Technical Note on Transition Triggers

Stage transitions are detected server-side via `user_growth_state` table. The criteria are **intentionally approximate and lenient** — designed to trigger on natural engagement, not metric grind:

```
Bijam → Mūla:    Completed profile + opened all 5 tabs at least once
Mūla → Nāla:     Used app on 5+ separate days + completed first core action
Nāla → Patra:    Contributed to community OR library at least once
Patra → Kamala:  Active across 3+ aliveness dimensions over 30 days
Kamala → Full:   Thuthimal received OR recognized by principal OR 90-day sustained engagement
```

---

## 6. THE MEMORY GARDEN (Personal Journey View)

A personal, private visualization replacing the conventional "achievements" gallery.

### What It Shows

Instead of a grid of badges, the Memory Garden is a **living illustration** — an abstract garden that visually reflects the teacher's/student's journey:

- **Seeds** represent the earliest Whispered Moments (small, sprouting)
- **Plants** represent sustained dimensions of engagement
- **Flowers** represent significant recognition events (Thuthimal, milestones)
- **Paths** represent exploration journeys (Library, Self, Community visits)
- **Weather** reflects the current mood pattern (calm, stormy, radiant)

### Principles

1. **It looks different for every person** — no two gardens are the same
2. **It reflects the WHOLE person**, not just their "productivity"
3. **It has seasons** — it changes with the actual time of year (Sri Lankan seasonal aesthetics)
4. **It always has room to grow** — the garden welcomes the next season
5. **It starts with a seed** — even on day 1, there is a seed, and seeds are beautiful

### What It Replaces

| Old (Remove) | New (Replace With) |
|---|---|
| `AchievementGallery.tsx` showing badge strings | Memory Garden visualization |
| `UserStatsCard.tsx` showing points count | Lotus Life Stage visualization |
| `points` number in `user_rewards` | Invisible growth signals across 5 dimensions |
| Badge strings array in DB | `whispered_moments` + `growth_events` tables |
| "Achievement Leaderboard" (student) | Personal Memory Garden (non-comparative) |

---

## 7. THE COMMUNITY GARDEN (Collective Aliveness)

The community isn't a feed to scroll — it's a **living garden** where each member contributes to the whole.

### Visualization Concept

The Community tab's "hearth" visualization shows an abstract garden where:
- Each active community member is represented as a small plant
- Recent activity causes gentle growth animations
- Shared resources create "flowering" on relevant members
- A Thuthimal event causes a rare, school-wide lotus bloom animation

### Rules

- No individual scores visible in community view (only collective health)
- The garden looks "healthy" when the community is active (lush, green)
- The garden looks "resting" during quieter periods (autumn aesthetic — still beautiful)
- Teachers who received Thuthimal have a permanent lotus flower in the garden
- Contribution recognized through the garden's collective health — shared and beautiful

---

## 7B. ROLE-SPECIFIC FEATURE CONSTELLATIONS

Each role has a designed constellation of features — the specific set that forms their experience. Roles have different primary needs, so they receive different primary metaphors and tools.

---

### 🍃 THE TEACHER'S CONSTELLATION

*The teacher is the heartwood — the steady center from which everything else grows.*

**Primary Nature Path**: Bhumi (Lotus) — personal inner journey  
**Secondary Nature Path**: Banyan (Vata) — mentorship unlocks naturally when they help colleagues

| Feature | What It Does | Nature Metaphor |
|---------|-------------|-----------------|
| **Joy Jar** | Capture small wins, student breakthroughs, beautiful moments | A jar that slowly fills with amber light |
| **Fire Journal** | Process difficult emotions privately; burned and released | Entry becomes an ember — private, warm |
| **Mood Lotus** | Daily emotional weather check-in | The lotus changes color with each check-in |
| **Warm Mirror** | Weekly personal narrative of real impact | A mirror that reflects story, not score |
| **Lotus Life Stage** | Personal inner growth visualization | Bhumi path: seed → full bloom |
| **Banyan Stage** | Mentorship growth — visible when they help colleagues | Banyan canopy growing in Community Garden |
| **Classroom Ecosystem** | A living visualization of the teacher's classroom | Each student is a small plant in a garden |
| **Seasonal Altar** | Home screen changes with Sri Lankan calendar | Vesak lotus bloom, New Year sunrise, monsoon green |
| **Whispered Moments** | Private surprise discoveries | Appear unexpectedly in the right emotional context |
| **Impact Ripples** | Warm signals when their work reaches someone | Delivered gently, 3–4× per day |
| **Thuthimal Receipt** | The apex recognition — past student honoring teacher | Full-screen lotus bloom, permanent in Community Garden |

**The Teacher's Self Tab** — a private sanctuary:
```
┌────────────────────────────────────────┐
│  🌸 Your Lotus              [Season]   │
│                                        │
│  ✦ Joy Jar         ✦ Fire Journal      │
│  ✦ Mood Lotus      ✦ Breathing         │
│  ✦ Warm Mirror     ✦ Wisdom Seed       │
│                                        │
│  [ Your Banyan ] — visible when active │
└────────────────────────────────────────┘
```

---

### 🌳 THE PRINCIPAL'S CONSTELLATION

*The principal is the banyan — the one whose roots create the conditions for an entire forest.*

**Primary Nature Path**: Banyan (Vata) — ecosystem-building is their core role  
**Secondary Nature Path**: Bhumi (Lotus) — they have personal inner growth too (the Principal's Lantern)

| Feature | What It Does | Nature Metaphor |
|---------|-------------|-----------------|
| **School Forest** | See the whole school as a living forest; each teacher is a tree | Forest visualization: healthy trees = healthy teachers |
| **Banyan Stage** | Principal's own growth as ecosystem-builder | Their banyan becomes the oldest tree in the forest |
| **Principal's Lantern** | Private wellbeing sanctuary (parallel to Teacher's Self tab) | A lantern that stays lit through long hours |
| **Gratitude Circle** | Ritual space to send recognition to teachers | Sending a "gift of light" to a specific tree in the forest |
| **School Pulse** | Gentle aggregate wellbeing signal from the teaching community | The forest's weather — is it raining on the right trees? |
| **Moon Calendar** | School-wide seasonal awareness with Sri Lankan calendar | Moon phases visible on the school planning calendar |
| **Staff Circle** | Private, principal-facilitated discussion spaces | A grove within the forest — sheltered, warm |
| **Manifesto Builder** | Create school-wide values manifestos for community endorsement | A seed planted in the forest floor |

**The School Forest View** — the principal's distinctive screen:
```
                    🌳 School Forest
    
    🌲       🌿      🌳      🌱      🌲
   (Nilu)  (Priya) (Aruna) (Dilini) (Saman)
    
    🌺              🌸           🌸
   (Chandra)      (Manel)    (Thushara)
   [Thuthimal]   [Active]   [Received ripple]
    
    School Health: 🌤️  Mostly clear, with one tree needing rain
    
    [ Send Gratitude ] [ View Pulse ] [ Start Circle ]
```

**The School Pulse** shows:
- Aggregate presence signals this week (shown as "weather" — not individual data)
- Which dimensions are active across the school (as forest health — lush/resting/growing)
- Any teacher who has been very quiet (shown as a tree that "needs rain" — private signal to principal only)
- The school's collective Banyan strength

**Privacy principle**: The principal sees aggregate forest health, not individual surveillance. "One tree needs rain" is a compassionate signal, not a report card.

---

### 🌊 THE STUDENT'S CONSTELLATION

*The student is the river — curious, finding their way, shaping everything they touch, flowing toward the vast.*

**Primary Nature Path**: River (Ganga) — learning flow  
**Secondary Path**: Crystal Collection (Spatika) — each discovery = a crystal found

| Feature | What It Does | Nature Metaphor |
|---------|-------------|-----------------|
| **River Path** | Learning growth visualization | River stages: trickle → stream → river → delta |
| **Crystal Collection** | Private collection of learning discoveries | Crystals found in the river bed |
| **Mood Garden** | Simplified emotional weather check-in | A small garden that reflects current feeling |
| **Study Companion** | A gentle nature creature that appears during study | A firefly that glows during focus sessions |
| **Student Warm Mirror** | Weekly "this is what you discovered" narrative | A mirror that reflects growth, not grades |
| **Classroom Garden** | Collective visualization of the class | A shared garden tended by the whole class |
| **Assignment River** | See assignments as stones in their river | Each submitted assignment = a stone finding its place |
| **Fractal Moment** | When concepts connect across subjects | A brief fractal animation — witnessed, not graded |
| **Wisdom Scroll** | Teacher's shared wisdom accessible to students | A scroll that unfurls — knowledge offered, not required |

**The Student's Home** — a different experience from the teacher's:
```
┌──────────────────────────────────────────┐
│  🌊 Your River              🌙 [Moon]    │
│                                          │
│  [ Today's Flow ]                        │
│  Maths 🪨  Science 🪨  Sinhala 🌸       │
│                                          │
│  💎 Your Crystals (3 new this week)      │
│  🌱 Class Garden                         │
│  📜 Wisdom Scroll                        │
│                                          │
│  ✨ Your Companion: Firefly is with you  │
└──────────────────────────────────────────┘
```

**The Fractal Moment** — the student's equivalent of Thuthimal:
> A student studying biology connects respiration to the fire they learned about in chemistry. The app — without the student noticing the connection was tracked — gently shows a fractal pattern: *"Two rivers joined today."* A crystal appears at the meeting point of two subject-channels in their collection. The teacher gets a quiet ripple: *"Something you prepared helped a student see a pattern."*

---

### CROSS-ROLE SHARED EXPERIENCES

These features span all three roles simultaneously:

| Feature | Teachers | Principals | Students |
|---------|----------|------------|---------|
| **Moon Calendar** | Personal rhythm, seasonal altar | School planning calendar | Study rhythm, exam season awareness |
| **Community Garden** | Contribute to school ecosystem | See forest health | See class garden |
| **Impact Ripples** | Receive (resource saved, lesson accessed) | Receive (gratitude from teachers) | Receive (feedback given, teacher thought about your work) |
| **Seasonal Aesthetics** | Vesak, New Year, monsoon changes | Same + school-wide celebration markers | Same + exam season support themes |
| **Whispered Moments** | Teaching-specific | Leadership-specific | Learning-specific |

---

## 8. CIRCADIAN & SEASONAL ALIVENESS

The app already has Temporal Phase logic (Dawn → Day → Dusk → Night). This should be **extended and deepened**:

### Daily Phases (already partially implemented)

| Phase | Time | App Feeling | Growth System Effect |
|-------|------|-------------|---------------------|
| **Dawn** | 5–7am | Gentle awakening, warm pinks | "First Light" Whispered Moment possible |
| **Morning** | 7–9am | Alert, focused, saffron | Daily Mood Lotus invitation appears |
| **Day** | 9am–3pm | Active, sage greens | Full-energy UI, all features accessible |
| **Golden Hour** | 3–5pm | Warm, winding down | "Tomorrow Snapshot" gently surfaces |
| **Dusk** | 5–7pm | Softening, amber tones | Wind-Down ritual invitation |
| **Night** | 7–10pm | Deep, vellum deepens | Fire Journal and reflection features foregrounded |
| **Late Night** | 10pm+ | Warm, protective dimming | App breathes slower. "ගුරු දෙවි, rest now" energy |

### Seasonal Layer (new)

Sri Lanka has distinct seasons aligned with the monsoon calendar. The app should reflect this:

| Season | Approx. Months | Visual Expression |
|--------|----------------|-------------------|
| **Yala (SW Monsoon)** | May–Sept | Lush, deep greens, rain sounds (ambient) |
| **Maha (NE Monsoon)** | Oct–Jan | Cool blues and sage, reflective |
| **Inter-Monsoon** | Feb–Apr, Oct | Transitional blends, energetic |
| **Vesak** | May full moon | Brief lotus bloom celebration (community-wide) |
| **Sinhala/Tamil New Year** | April 13–14 | App-wide warm sunrise gradient shift |

This layer is **purely aesthetic** — it changes how the app *feels*, not what it *requires* of the user. A teacher in December experiences the app in slightly different light tones than in June.

---

## 9. WHAT EXISTS, WHAT NEEDS REPAIR, WHAT IS ABANDONED

### Status Audit

| Feature | Location | Current State | Recommendation |
|---------|----------|---------------|----------------|
| `rewardsAPI` with `points` + `badges` | `packages/core/src/api/rewards.ts` | 🟡 Misaligned with philosophy | **Repurpose**: Transform `badges` into `whispered_moments` events. Keep backend structure, rename semantically toward the growth model. |
| `AchievementGallery.tsx` | `src/components/profile/AchievementGallery.tsx` | 🟡 Exists but philosophically wrong | **Transform**: Replace gallery of badge strings with Memory Garden visualization. |
| `UserStatsCard.tsx` with points display | `src/components/profile/UserStatsCard.tsx` | 🟡 Shows "points" counter | **Transform**: Replace points with Lotus Life Stage visual — the lotus speaks for itself. |
| `sacredMissions.ts` (Community manifestos) | `packages/core/src/api/sacredMissions.ts` | 🟢 Aligned — this IS the Gratitude Economy | **Keep and expand**: Manifesto endorsements are the collective growth mechanism. |
| `AchievementLeaderboard` (Student PRD) | Not yet implemented | 🔴 Designed but not yet built | **Build as personal Memory Garden instead** — the personal journey, visible only to the person living it. |
| Mood Lotus check-in | `packages/self/` | 🟡 Partial — logic mock | **Wire and complete**: Central to Witnessing dimension. |
| Joy Jar | `packages/self/` | 🟡 Partial | **Complete**: Core Presence dimension feature. |
| Thuthimal | `packages/core/src/api/thuthimal.ts` | 🟢 DB + badge exists | **Expand**: Make the Thuthimal receipt the highest Blooming event in the system. |
| Living Theme (temporal phases) | Multiple packages | 🟡 Partial | **Deepen**: Add seasonal layer on top of circadian layer. |
| `feature_usage_log` table | `packages/core` | 🟢 Exists | **Repurpose for growth signals** — aliveness dimensions, not usage metrics |
| Impact Ripple system | Not yet built | 🔴 Pending | **Build in Phase 2**: `impact_ripples` table + trigger logic + batched delivery. The Relatedness layer. |
| Warm Mirror | Not yet built | 🔴 Pending | **Build in Phase 2**: Opt-in weekly narrative from `WarmMirrorDataPoints`. Lives in Self tab. |

### Design Choices Made — What We Build Instead

These are deliberate redirections: each one replaces an extractive mechanic with something that genuinely serves the teacher.

| Original Design | Why We Redirected | What We Build Instead |
|------|---------|----|
| Points as visible number | A number induces score-watching; the anxiety of the score replaces the joy of the work | The internal `growth_score` stays in the database — it informs the lotus visual, stays out of the teacher's hands |
| Badge string array | Generic strings like "Sanctuary Seeker" carry no meaning in Sri Lankan context | Culturally resonant Whispered Moments with Sinhala/Tamil names, offered in the right emotional moment |
| Student "Achievement Leaderboard" | Ranking by definition produces both winners and everyone else | The personal Memory Garden — each person's journey uniquely their own, beautiful in itself |
| Streak counter | A streak is only meaningful when broken; the absence becomes the message | Presence is acknowledged as arrival, always, on any day — the lamp stays lit |

---

## 10. IMPLEMENTATION ROADMAP

### Phase 1 (Alpha — March 2026): Foundation
*These changes heal the misalignment before users see the app.*

1. **Remove points display from `UserStatsCard`** — replace with Lotus Life Stage (static seed visual initially)
2. **Rename/repurpose `rewards.ts`** → `growthSignals.ts` — same structure, new semantic meaning
3. **Add `user_growth_state` table** to Supabase with Bhumi stage enum
4. **Wire Mood Lotus check-in** to Witnessing dimension signal
5. **Complete Joy Jar** basic functionality (Presence dimension)
6. **Add temporal phase depth** — ensure Dawn/Day/Dusk/Night feel meaningfully different

### Phase 2 (Beta — May 2026): Aliveness + Relatedness
*These bring the growth model to life — including the v2.0 mechanisms.*

7. **Build Memory Garden visualization** for Profile self-view (replaces Achievement Gallery)
8. **Implement 5 core Whispered Moments** for teachers (listed in Section 4)
9. **Build Lotus Life Stage animation** with 6 visual states
10. **Implement Community Garden** abstract visualization
11. **Wire Thuthimal receipt** as the Blooming dimension's apex event
12. **Add 3 seasonal themes** to Living Theme system (Yala / Maha / Transitional)
13. **Build Impact Ripple system** — `impact_ripples` table + trigger logic + notification delivery
14. **Build Warm Mirror** — weekly narrative generation from `WarmMirrorDataPoints`; opt-in toggle in Self settings

### Phase 3 (v1.0 — Launch): Full Ecosystem
*The complete living app.*

15. **Full Whispered Moments set** (all roles, all contexts)
16. **Sri Lankan cultural calendar integration** (Vesak, New Year, monsoon seasons)
17. **Memory Garden seasonal evolution** — garden looks different in different seasons
18. **Cross-school aliveness signals** (when schools are connected, gardens can "see" each other's light)
19. **Thuthimal public Wall of Honor** (community-visible, teacher-controlled)
20. **Warm Mirror Sinhala/Tamil narrative quality** — review with Sri Lankan educators for natural idioms
21. **Actor opt-in for Impact Ripples** — allow colleague to choose to be identified in a ripple

### Phase 4 (v1.5 — The Extended Nature Paths): Full Multi-Metaphor Ecosystem

22. **Banyan Path** — `banyan_stage` wiring + Community Garden banyan visualization for teachers
23. **River Path** — `river_stage` for students + Classroom Ecosystem river visualization
24. **Moon Phase integration** — real lunar calendar + Sri Lankan poya calendar sync
25. **Crystal Collection** — student discovery collection with fractal visualization
26. **School Forest** — principal's school-wide forest view + Gratitude Circle
27. **Study Companion** — student firefly companion that responds to study sessions
28. **Classroom Ecosystem** — teacher sees their classroom as a living garden
29. **Principal's Lantern** — private wellbeing sanctuary for principals
30. **Fractal Moment** — cross-subject connection recognition for students

---

## 11. DATABASE DESIGN

### New Tables Required

```sql
-- Personal growth state — the living record of each user's nature paths
CREATE TABLE user_growth_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Bhumi (Lotus) path — personal inner growth
  bhumi_stage TEXT NOT NULL DEFAULT 'bijam' 
    CHECK (bhumi_stage IN ('bijam', 'mula', 'nala', 'patra', 'kamala', 'purna_kamala')),
  -- Banyan (Vata) path — mentorship and ecosystem-building (teachers/principals)
  banyan_stage TEXT DEFAULT 'sapling'
    CHECK (banyan_stage IN ('sapling', 'roots_spreading', 'canopy', 'shade_giver', 'forest_maker')),
  -- River (Ganga) path — learning flow (students / teachers' curricular contribution)
  river_stage TEXT DEFAULT 'trickle'
    CHECK (river_stage IN ('trickle', 'stream', 'river', 'delta')),
  -- Crystal (Spatika) path — student knowledge discoveries (students)
  crystal_tier TEXT DEFAULT 'spark'
    CHECK (crystal_tier IN ('spark', 'cluster', 'cave', 'fractal')),
  -- Five aliveness dimension counters (feed Bhumi stage transitions)
  presence_signals INT DEFAULT 0,
  nourishing_signals INT DEFAULT 0,
  witnessing_signals INT DEFAULT 0,
  weaving_signals INT DEFAULT 0,
  blooming_signals INT DEFAULT 0,
  -- Banyan-specific counters (feed Banyan stage transitions)
  peer_mentored_count INT DEFAULT 0,
  circles_facilitated_count INT DEFAULT 0,
  -- River-specific counters (feed River stage transitions)
  lessons_completed_count INT DEFAULT 0,
  reflections_submitted_count INT DEFAULT 0,
  -- Crystal-specific counters (feed Crystal tier transitions)
  crystals_found_count INT DEFAULT 0,
  fractal_moments_count INT DEFAULT 0,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Whispered Moments — private discovery events
CREATE TABLE whispered_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moment_key TEXT NOT NULL, -- internal identifier, e.g., 'first_light', 'still_water'
  moment_name_si TEXT, -- Sinhala name of the moment
  moment_name_ta TEXT, -- Tamil name of the moment
  moment_name_en TEXT, -- English name
  experienced_at TIMESTAMPTZ DEFAULT NOW(),
  -- Each moment is experienced in its own time; surfaced once, in the right moment
  UNIQUE(user_id, moment_key) -- Each moment experienced once (or reset intentionally)
);

-- Growth events log (internal analytics — the silent record of aliveness; teacher-facing only through the lotus visual)
CREATE TABLE growth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL 
    CHECK (dimension IN ('presence', 'nourishing', 'witnessing', 'weaving', 'blooming')),
  event_type TEXT NOT NULL, -- e.g., 'mood_checkin', 'resource_upload', 'joy_jar_entry'
  event_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Impact Ripples — the Relatedness feedback layer (v2.0)
-- Each row = one warm signal to a contributor when their work genuinely helped someone.
-- Actor identity: stored privately; surfaced in the UI only when the actor has chosen to be known.
CREATE TABLE impact_ripples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ripple_type TEXT NOT NULL CHECK (ripple_type IN (
    'resource_saved',      -- A colleague saved a resource you created
    'resource_read',       -- Anonymous threshold: your resource reached N unique readers
    'post_sparked',        -- Your community post received at least one genuine reply
    'lesson_accessed',     -- A student accessed your lesson material
    'feedback_given',      -- Someone wrote thoughtful feedback on your work
    'manifesto_endorsed',  -- Someone endorsed a manifesto you created
    'circle_joined'        -- Someone joined a community circle you started
  )),
  school_id UUID REFERENCES schools(id),
  -- Actor identity: held privately in the database; visible in the UI only by actor's own choice
  actor_user_id UUID REFERENCES users(id),
  is_actor_visible BOOLEAN DEFAULT FALSE,
  -- The original contribution that generated this ripple
  source_entity_type TEXT CHECK (source_entity_type IN ('resource', 'community_post', 'lesson', 'manifesto', 'circle')),
  source_entity_id UUID,
  -- Pre-rendered warm message in all three languages (generated at creation time)
  warm_message_si TEXT,
  warm_message_ta TEXT,
  warm_message_en TEXT,
  -- Delivery state
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  -- Batch window: ripples are delivered in gentle batches, 3-4x per day
  batch_window TEXT, -- 'morning' | 'afternoon' | 'evening' | 'night'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Partial index on undelivered ripples for the common query pattern (fetching pending delivery)
CREATE INDEX idx_impact_ripples_pending ON impact_ripples(recipient_user_id, created_at DESC)
  WHERE delivered = FALSE;
-- Full index for historical queries (analytics, Warm Mirror aggregation)
CREATE INDEX idx_impact_ripples_recipient ON impact_ripples(recipient_user_id, created_at DESC);

-- Crystal Collection — student knowledge discoveries (student-facing)
-- Each row = one crystal found; private to the student; visualized in their Crystal Collection view
CREATE TABLE crystal_discoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crystal_type TEXT NOT NULL CHECK (crystal_type IN (
    'subject_crystal',       -- Milestone within a single subject
    'connection_crystal',    -- Two subjects connected (cross-domain insight)
    'deep_crystal',          -- Extended deep engagement with one topic
    'fractal_crystal'        -- Multiple connections forming a pattern
  )),
  subject_tags TEXT[],                -- Which subjects contributed
  source_entity_id UUID,              -- Assignment, lesson, or reflection that triggered it
  crystal_name_en TEXT,               -- e.g., "The Living Cell"
  crystal_description_en TEXT,        -- e.g., "You connected biology and chemistry"
  is_fractal_moment BOOLEAN DEFAULT FALSE,  -- Special: cross-domain connection
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- School Forest State — aggregate view for principals (computed, not directly written by users)
-- Refreshed periodically from growth_events; provides the principal's forest visualization data
CREATE TABLE school_forest_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Tree health: computed from presence/nourishing/weaving signals over trailing 14 days
  tree_health TEXT NOT NULL DEFAULT 'seedling'
    CHECK (tree_health IN ('seedling', 'growing', 'flourishing', 'flowering', 'ancient')),
  has_thuthimal BOOLEAN DEFAULT FALSE,   -- Permanent lotus marker in the forest
  last_signal_at TIMESTAMPTZ,            -- When this teacher last had any growth event
  computed_at TIMESTAMPTZ DEFAULT NOW(), -- When this row was last computed
  UNIQUE(school_id, teacher_user_id)
);

-- Gratitude Gifts — principal recognition ritual (principal's equivalent of Thuthimal)
CREATE TABLE gratitude_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id),
  message TEXT,                          -- Optional personal message
  gift_type TEXT NOT NULL DEFAULT 'lantern'
    CHECK (gift_type IN ('lantern', 'rain', 'sunlight', 'seed')),
  warm_message_en TEXT NOT NULL,
  warm_message_si TEXT,                  -- Pending native review
  warm_message_ta TEXT,                  -- Pending native review
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Existing Tables to Modify

```sql
-- user_rewards: Keep structure, deepen semantic meaning
-- badges[] becomes internal_signals[] — internal to the growth model, expressed through the lotus visual
-- points becomes growth_score (internal analytics, expressed only through the Bhumi stage, not as a raw number)
-- Add migration to rename column comments

-- user_growth_state: Add new nature path columns (migration)
ALTER TABLE user_growth_state
  ADD COLUMN IF NOT EXISTS banyan_stage TEXT DEFAULT 'sapling'
    CHECK (banyan_stage IN ('sapling', 'roots_spreading', 'canopy', 'shade_giver', 'forest_maker')),
  ADD COLUMN IF NOT EXISTS river_stage TEXT DEFAULT 'trickle'
    CHECK (river_stage IN ('trickle', 'stream', 'river', 'delta')),
  ADD COLUMN IF NOT EXISTS crystal_tier TEXT DEFAULT 'spark'
    CHECK (crystal_tier IN ('spark', 'cluster', 'cave', 'fractal')),
  ADD COLUMN IF NOT EXISTS peer_mentored_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS circles_facilitated_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lessons_completed_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reflections_submitted_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crystals_found_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fractal_moments_count INT DEFAULT 0;

-- Contextual Challenges (Section 14) — opt-in, collective, generative
CREATE TABLE contextual_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('class_collective_pulse', 'school_season_challenge')),
  school_id UUID REFERENCES schools(id),
  classroom_id UUID REFERENCES classrooms(id),
  creator_user_id UUID REFERENCES users(id),
  title_en TEXT NOT NULL,
  description_en TEXT,
  metric TEXT NOT NULL CHECK (metric IN (
    'library_resources_opened', 'joy_jar_entries', 'assignments_submitted',
    'community_posts', 'reflections_written', 'lessons_completed',
    'attendance_recorded', 'feedback_given'
  )),
  target_count INT NOT NULL,
  current_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'expired', 'draft')),
  nature_metaphor TEXT NOT NULL CHECK (nature_metaphor IN (
    'river_rising', 'forest_brightening', 'lotus_opening', 'crystal_growing'
  )),
  completion_celebration_en TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal Compasses — individual opt-in, user-defined, private
CREATE TABLE personal_compasses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN (
    'library_resources_opened', 'joy_jar_entries', 'assignments_submitted',
    'community_posts', 'reflections_written', 'lessons_completed',
    'attendance_recorded', 'feedback_given'
  )),
  target_count INT NOT NULL,
  current_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'expired')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Whispered Moments registry — the memory of discovered moments
CREATE TABLE whispered_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moment_key TEXT NOT NULL,
  moment_name_en TEXT,
  moment_name_si TEXT,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, moment_key)  -- Each moment discovered once; quietly, permanently remembered
);
```

---

## 12. DESIGN TOKENS & VISUAL LANGUAGE

The growth system introduces new visual states, all using existing token vocabulary:

| Growth Event | Visual Treatment | Token(s) |
|---|---|---|
| Lotus Life Stage advance | Breath-expand → bloom animation | `glow`, `saffron`, `FadeInDown 500ms` |
| Banyan Stage advance | Roots spreading out animation | `dalu`, organic expand, 800ms |
| River Stage advance | Flow animation, water rippling | `river_blue`, `river_delta` tint |
| Crystal found | Crystal materializes, light refracts | `crystal_spark`, `crystal_glow`, haptic |
| Fractal Moment | Brief fractal pattern overlay, then dissolves | `fractal_gold`, `BlurView 20`, 1200ms |
| Moon Phase change | Background tint shifts over 30 minutes | Interpolated lunar tints |
| Whispered Moment discovery | Single pulse of warmth, fade | `glassBg`, `dalu`, stagger 150ms |
| Joy Jar entry | Jar fills, warm amber glow | `ember`, haptic pulse |
| Thuthimal receipt | Full-screen lotus bloom (rare, sacred) | `saffron`, `glow`, `BlurView ≥36` |
| Gratitude Gift received (principal) | Lantern lights in School Forest | `lantern_gold`, gentle expand |
| School Forest health change | Slow lush/resting transition | `forest_green`, `forest_autumn` |
| Study Companion appears | Firefly drifts in from edge | `firefly_warm`, fade in 600ms |
| Community Garden active | Lush, pulse of sage green | `dalu`, slow pulse animation |
| Late night / protective mode | Dimmer vellum, slower breathing | `ink` at 0.7 opacity, pulse rate ÷2 |
| Seasonal transition | Gradient shift over 24-hour fade | Interpolated `vellum` → seasonal tint |
| Mood Lotus state | Color shifts with check-in | `mood_calm`, `mood_storm`, `mood_radiant` |
| **Impact Ripple received** | Soft vellum notification, warm text, single haptic | `vellum`, `ink`, `ember` for ripple icon |
| **Warm Mirror opened** | Gentle fade-in of narrative text, breath-timing on lines | `FadeInDown 300ms` staggered per sentence, `dalu` |

### New Semantic Tokens Needed

```typescript
// In packages/design-tokens/src/

// Mood / Emotional Weather
mood_calm: '#8BBF7A',       // Dalu green — peaceful presence
mood_storm: '#D4843A',      // Saffron — processing difficulty  
mood_radiant: '#F0C060',    // Golden — flourishing
mood_winter: '#7A9BBF',     // Quiet blue — contemplative rest

// Sri Lankan Seasons
season_yala: '#5A8A4A',     // Deep monsoon green (SW Monsoon)
season_maha: '#6A88AA',     // Cool monsoon blue (NE Monsoon)
season_new_year: '#E8A040', // Sinhala/Tamil New Year gold
season_vesak: '#F8E8C0',    // Vesak — warm moonlit ivory

// Bhumi / Lotus Path
growth_seed: 'rgba(139,191,122,0.3)',    // Bijam — barely there
growth_bloom: 'rgba(212,132,58,0.8)',   // Purna Kamala — radiant

// Banyan / Tree Path
banyan_sapling: '#7AB87A',   // Young green
banyan_canopy: '#3A6A3A',    // Deep shade green
banyan_ancient: '#2A4A2A',   // Oldest tree — profound depth

// River / Water Path
river_trickle: '#A8C8E8',    // Mountain spring blue
river_stream: '#5898C8',     // Clear stream
river_river: '#2868A8',      // Deep river blue
river_delta: '#1848A8',      // Ocean-meeting deep

// Moon Phases
moon_new: '#1A1A2A',         // Dark sky
moon_crescent: '#8888A8',    // Pale violet
moon_full: '#F8F0D8',        // Warm moonlight ivory
moon_waning: '#A8A0B8',      // Soft receding

// Crystal / Fractal
crystal_spark: '#E8D8F8',    // First crystal glow — pale lavender
crystal_glow: '#C8A8F8',     // Crystal cluster — warm purple
crystal_deep: '#8868E8',     // Crystal cave — deep purple
fractal_gold: '#F0D068',     // Fractal moment — golden flash

// School Forest
forest_green: '#4A7A4A',     // Healthy forest
forest_autumn: '#A87040',    // Resting forest
forest_rain: '#7898B8',      // After the rain
lantern_gold: '#F0C040',     // Gratitude gift / principal recognition
firefly_warm: '#E8F068',     // Study companion
```

---

## 13. THE GURUDEVI GROWTH CREED

*To be read before any implementation work on this system.*

> We do not build growth mechanics. We cultivate growth conditions.
>
> A teacher who opens this app at midnight — exhausted, still caring — does not need points. She needs to feel seen.
>
> A student who finishes his first assignment does not need a leaderboard rank. He needs a quiet moment where the app says: *you did something real today.*
>
> But here is what v1.0 missed:
>
> *The lotus does not race other lotuses. But it does exist in an ecosystem. It is nourished by the water that flows from the roots of every other plant nearby. It does not compete with them. But it is not alone.*
>
> Teachers are not ascetics. They are human beings embedded in communities of other human beings. They want to know that their work reaches real people. They want to feel the warmth of genuine appreciation — not an algorithm's substitute for it.
>
> When a past student sends a Thuthimal gift, that teacher weeps — not because of points, but because a human being, years later, remembers that they were cared for.
>
> **Our job is to design for the full human being:**
> - Their private inner life (Presence, Witnessing, the Lotus growing silently)
> - Their craft and competence (Nourishing, the Warm Mirror reflecting who they are)
> - Their deep need to belong and to matter (Relatedness, the Impact Ripple, the Community Garden)
>
> The golden mean is not between "gamification" and "silence."
> The golden mean is between **extractive mechanics** and **genuine human connection**.
>
> We build for the second kind. Always.
>
> **ජයවේවා** 🪷

---

## 14. THE CONTEXTUAL COMPETITION QUESTION

*This section addresses a real tension that was identified in the design process: are we practicing "Kantian universal morality in a contextual world"? The answer is: no longer.*

### The Duolingo Analysis — What They Got Right and Wrong

Duolingo became the world's most downloaded education app on the back of:
- Streaks (30-day, 365-day)
- Experience Points (XP)
- Weekly leagues with public leaderboards
- Hearts system (losing progress for wrong answers)
- Streak freeze (pay gems to protect your streak)

**What they got right:**
- Immediate feedback feels good
- A visible sense of progress gives a hook to return
- Gentle social comparison ("your friend Priya is ahead of you this week") activates competitive instinct
- Streak mechanics do drive daily return

**What they got wrong:**
- Streaks create anxiety around breaking them — users report more stress than joy
- Leaderboard ranking frames language learning as zero-sum competition with strangers
- Hearts punish mistakes in the act of learning — the opposite of growth mindset
- XP is decoupled from actual language acquisition; users game it to stay in leagues

The critical distinction is not "competition vs. no competition." It is:

```
ADDICTIVE MECHANIC                     HEALTHY CHALLENGE
────────────────────────────────────── ─────────────────────────────────────
Variable reward schedule               Predictable, meaningful recognition
Loss aversion ("don't break streak")   Progress framing ("look how far you've come")
Zero-sum ranking (I win = you lose)    Shared collective challenge (we all win together)
Mandatory (must log in or lose)        Opt-in (here when you want it)
Abstract score (XP, points)           Concrete impact (lessons done, students helped)
Peer comparison (ranked vs. others)    Personal best (compared to yourself)
```

### What Real Classrooms Actually Have — And Why That's Not Bad

Real classrooms **do** have competition. And that is real and worth honoring:
- Students compare test scores
- Teachers compare their class performance
- Schools compare among schools
- Sports, debates, academic competitions are valuable pedagogical tools

**The distinction is not between competition and no competition. It is between:**

1. **Competition that creates losers** — ranking systems where half the population is definitionally "below average," streaks that shame the person who got sick for three days, leaderboards that identify the bottom performers
2. **Competition that creates growth** — personal best improvement, class-vs-class collective challenges, opt-in competitions where participation itself is the win, recognition that raising others also raises you

### The Gurudevi Middle Path — Contextual Challenges

We add a new system: **Contextual Challenges** — opt-in, collective, personal-best-focused.

The design principles for Contextual Challenges:

| Principle | What It Means In Practice |
|-----------|--------------------------|
| **Collective, not individual** | Challenges measure the class/school as a whole, not individuals within it |
| **Personal best, not peer comparison** | Each user sees their own trajectory, not a ranking |
| **Opt-in entirely** | No challenge is mandatory. The app offers; the user decides. |
| **Generative, not zero-sum** | Winning a challenge does not require another player to lose |
| **Grounded in real impact** | "Your class submitted 85% of this week's assignments" not "You're #3 in your school" |
| **Time-boxed and gentle** | Challenges end. The next one starts fresh. The past is not a score. |

### Three Types of Contextual Challenges

**Type 1: Class Collective Pulse** *(Teacher and Students)*
> "This week, your class has a collective reading challenge: 20 library resources opened across the whole class."
- Progress is shown as a shared nature visualization: the class river rising
- No individual breakdown visible to the class
- When complete: a gentle collective moment (the river reaches the sea)
- Teacher sees aggregate; no student is identified as under-performing

**Type 2: School Season Challenge** *(All Teachers in a School)*
> "This term, your school's teachers have a collective wellness challenge: 100 Joy Jar entries across the staff."
- Progress shown as the School Forest "brightening"
- Principal can send encouragement to the whole forest (not to individual trees)
- No individual teacher's data exposed to peers

**Type 3: Personal Compass** *(Individual, opt-in)*
> "You've set yourself a personal compass: open the Library 3 times this week."
- User sets their own challenge (not app-assigned)
- Only they can see it
- When met: a Whispered Moment, not a leaderboard placement
- No punishment for not meeting it — the compass simply resets

### What We Explicitly Choose Not to Build

| What Duolingo Has | Why We Pass |
|---|---|
| Weekly league rankings | Rankings create losers. We choose shared growth. |
| Streak shame mechanics | Loss aversion is the mechanism of addiction, not education. |
| Global leaderboards | Irrelevant to a Sri Lankan teacher's classroom context. |
| Hearts/life system | Punishing mistakes is pedagogically backwards. |
| Gems/premium streak freeze | Pay-to-not-lose-progress is the extraction model. |

The user is right: the original GROWTH_MODEL stance was too absolute — close to Kantian universalism applied to a contextual world where real human competition exists and is sometimes healthy. The updated model honors competition as a genuine human experience while designing challenges that are generative rather than extractive.

---

## 15. THE LIVING JOURNEY PANEL

*The holistic view that answers: "Where am I in my journey?"*

Every user deserves a place where their full growth picture lives — not as a score dashboard, but as a **living visualization** of who they have become.

### What the Living Journey Panel Shows

The panel assembles all four nature paths into a single, beautiful, private view:

```
╔══════════════════════════════════════════════════════════╗
║  🌸  Your Lotus          Nāla (Rising)                  ║
║      ▓▓▓▓▓▓▓░░░░  Three petals open                    ║
╠══════════════════════════════════════════════════════════╣
║  🌳  Your Banyan         Roots Spreading                 ║
║      You have offered shade to 3 colleagues             ║
╠══════════════════════════════════════════════════════════╣
║  🌊  Your River          Stream                          ║
║      12 lessons have flowed through you this term        ║
╠══════════════════════════════════════════════════════════╣
║  🌙  Moon Tonight        Waxing Gibbous 🌔               ║
║      "Building toward fullness..."                       ║
╠══════════════════════════════════════════════════════════╣
║  ✨  Whispered Moments   3 discovered                    ║
║      [ still_water ] [ first_offering ] [ storm_holder ] ║
╚══════════════════════════════════════════════════════════╝
```

### Design Principles for the Living Journey Panel

1. **Private** — visible only to the user; never visible to colleagues or the principal
2. **Story, not score** — each row shows a human-language description, not a number
3. **All paths, not just one** — the user sees their whole nature, not a single dimension
4. **Moon is live** — the moon phase is computed in real time; it changes each night
5. **Whispered Moments as memory** — discovered moments are kept as beautiful memories, not trophies
6. **Roles see different paths** — a teacher sees Lotus + Banyan; a student sees River + Crystal; everyone sees Moon
7. **Always growing** — even at the earliest stage, the language honors where the user is ("Three petals opening" not "0% complete")

### Where It Lives

The Living Journey Panel **replaces** `UserStatsCard` + `AchievementGallery` in `ProfileScreen`.
It lives as a single cohesive card, accessed from the Profile tab.

The raw `guruPoints` number and badge string array are **internal analytics only** — they feed the visual but are never shown as numbers to the user.

---

## APPENDIX A: Whispered Moment Full Catalog (Design Stage)

*Pending cultural review with Sri Lankan educators before implementation.*

### Teacher Moments

| Key | Sinhala Name | Trigger | Experience |
|-----|-------------|---------|------------|
| `first_light` | ප්‍රථම රශ්මිය | First app open 5–7am | Sunrise gradient |
| `quiet_hour` | නිශ්ශබ්ද පැය | App use after 9pm | Slower breathing, warm message |
| `root_day` | මූල දිනය | 7-day anniversary | Lotus root animation |
| `first_offering` | ප්‍රථම දානය | First library resource read by another | Soft ripple on resource |
| `still_water` | නිශ්චල දිය | 5 consecutive mood check-ins | Still water in lotus animation |
| `caring_teacher` | සැලකිලිමත් ගුරුවරිය | 10+ graded with written feedback | Golden ember in classroom header |
| `storm_holder` | කුළු ගෙන සිටින්නා | Fire Journal 3x in one week | Warm amber journal icon |
| `the_seeker` | සොයන්නා | All 5 tabs explored in first week | Compass appears in Library header |
| `school_elder` | ගුරු ආදරණීය | 90 days in the app | Ancient tree appears in Memory Garden |
| `thuthimal_received` | තුතිමල් ලැබීය | Thuthimal gift received | Full-screen lotus bloom 🪷 |

### Student Moments

| Key | Sinhala Name | Trigger | Experience |
|-----|-------------|---------|------------|
| `first_breath` | ප්‍රථම හුස්ම | First breathing exercise complete | Breath animation holds extra beat |
| `curious_one` | කුතුහලකාරී | 5 different Library subjects explored | Small compass in Library |
| `dawn_learner` | පාන්දර ඉගෙනුම | App used before 7am | Morning gradient on timetable |
| `deep_root` | ගැඹුරු මූලය | Same classroom for 3+ months | Lotus root below classroom card |
| `gift_received` | තෑගි ලැබීය | First assignment with positive feedback | Teacher's feedback glows amber 24hr |
| `first_voice` | ප්‍රථම හඬ | First community post | Small flame lights in community |

---

## APPENDIX B: Growth Signal → Dimension Mapping

```typescript
// packages/core/src/growth/dimensionMap.ts (proposed)

export const GROWTH_SIGNAL_MAP: Record<string, GrowthDimension> = {
  // PRESENCE signals
  'app_opened': 'presence',
  'mood_checkin': 'presence',
  'breathing_exercise_complete': 'presence',
  'joy_jar_entry': 'presence',
  'fire_journal_entry': 'presence',

  // NOURISHING signals
  'resource_uploaded': 'nourishing',
  'lesson_plan_created': 'nourishing',
  'assignment_created': 'nourishing',
  'wisdom_seed_shared': 'nourishing',

  // WITNESSING signals
  'resource_read': 'witnessing',
  'wisdom_seed_read': 'witnessing',
  'reflection_written': 'witnessing',
  'goal_set': 'witnessing',

  // WEAVING signals
  'community_post_created': 'weaving',
  'manifesto_endorsed': 'weaving',
  'resource_shared': 'weaving',
  'colleague_helped': 'weaving',

  // BLOOMING signals
  'thuthimal_received': 'blooming',
  'principal_recognition': 'blooming',
  'community_milestone_reached': 'blooming',
};

// ─────────────────────────────────────────────────────────────────────────────
// IMPACT RIPPLE trigger map (v2.0)
// Each entry defines: what user action creates a ripple for the ORIGINATOR
// ─────────────────────────────────────────────────────────────────────────────
export type RippleType =
  | 'resource_saved'
  | 'resource_read'
  | 'post_sparked'
  | 'lesson_accessed'
  | 'feedback_given'
  | 'manifesto_endorsed'
  | 'circle_joined';

// Maps a user action to: (1) who gets a ripple, (2) what type
export const IMPACT_RIPPLE_TRIGGER_MAP: Record<string, {
  recipientEntity: 'resource_creator' | 'post_author' | 'manifesto_creator' | 'circle_creator';
  rippleType: RippleType;
  minThreshold?: number; // only fire ripple after N occurrences (prevents noise)
}> = {
  'resource_pull_to_desk':    { recipientEntity: 'resource_creator', rippleType: 'resource_saved' },
  'resource_opened':          { recipientEntity: 'resource_creator', rippleType: 'resource_read', minThreshold: 5 },
  'community_reply_created':  { recipientEntity: 'post_author',      rippleType: 'post_sparked' },
  'lesson_material_opened':   { recipientEntity: 'resource_creator', rippleType: 'lesson_accessed' },
  'assignment_feedback_given':{ recipientEntity: 'resource_creator', rippleType: 'feedback_given' },
  'manifesto_endorsed':       { recipientEntity: 'manifesto_creator',rippleType: 'manifesto_endorsed' },
  'circle_joined':            { recipientEntity: 'circle_creator',   rippleType: 'circle_joined' },
};

// ─────────────────────────────────────────────────────────────────────────────
// WARM MIRROR data sources (v2.0)
// Each field maps to a query that gathers data for the weekly narrative
// ─────────────────────────────────────────────────────────────────────────────
export interface WarmMirrorDataPoints {
  // Presence
  days_present: number;           // distinct calendar days where at least one growth_event of any type was recorded
  quiet_moments: number;          // count of: mood_checkin + breathing_exercise_complete + fire_journal_entry
  // Nourishing / Impact
  ripples_received: number;       // impact_ripples delivered this period
  assignments_with_feedback: number; // assignments where feedback text length > 20 chars
  resources_that_reached_others: number; // ripple_type = resource_saved | resource_read
  // Weaving
  posts_that_sparked: number;     // ripple_type = post_sparked received
  // Long-running context
  days_since_joined: number;      // for "your classroom has been your home for X months"
  primary_classroom_name?: string;
}
```

---

*This document is part of the Gurudevi Core constellation. Governed by NORTH_STAR.md. Every growth mechanic built here should leave the teacher lighter, more connected, and more themselves — that is the measure.*

*From mud, through water, to full bloom. 🪷*
